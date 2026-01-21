// Profile Database Service - Uses Supabase for cloud storage
import { supabase } from "../lib/supabase";

class ProfileDatabase {
  constructor() {
    this.CURRENT_USER_KEY = "ethos_pair_current_user"; // Keep current user in localStorage for now
  }

  /**
   * Get all profiles from the database
   */
  async getAllProfiles() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading profiles:", error);
      return [];
    }
  }

  /**
   * Get a profile by Ethos address
   */
  async getProfileByAddress(address) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("address", address.toLowerCase())
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found

      // Convert snake_case to camelCase for consistency
      if (data) {
        return {
          ...data,
          displayName: data.display_name,
          profilePicture: data.profile_picture,
          ethosScore: data.ethos_score,
          trustLevel: data.trust_level,
          xpTotal: data.xp_total,
          lookingFor: data.looking_for,
          genderPreference: data.gender_preference,
          minVisibleToEthosScore: data.min_visible_to_ethos_score || 0,
        };
      }
      return data;
    } catch (error) {
      console.error("Error loading profile:", error);
      return null;
    }
  }

  /**
   * Save a new profile or update existing one
   */
  async saveProfile(profileData) {
    try {
      const profileToSave = {
        address: profileData.address.toLowerCase(),
        name: profileData.name,
        display_name: profileData.displayName || profileData.name,
        username: profileData.username,
        location: profileData.location,
        nationality: profileData.nationality,
        continent: profileData.continent,
        interests: profileData.interests,
        looking_for: profileData.lookingFor || profileData.relationshipTypes,
        profile_picture: profileData.profilePicture,
        ethos_score: profileData.ethosScore || 0,
        trust_level: profileData.trustLevel,
        xp_total: profileData.xpTotal || 0,
        description: profileData.description,
        gender_preference: profileData.genderPreference,
        min_visible_to_ethos_score: profileData.minVisibleToEthosScore || 0,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileToSave, { onConflict: "address" })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving profile:", error);
      throw new Error("Failed to save profile");
    }
  }

  /**
   * Delete a profile by address
   */
  async deleteProfile(address) {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("address", address.toLowerCase());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting profile:", error);
      return false;
    }
  }

  /**
   * Get all profiles except the current user, with filtering based on:
   * 1. Profile visibility settings (minVisibleToEthosScore)
   * 2. Gender preferences matching
   */
  async getProfilesForDiscovery(currentUserAddress) {
    try {
      // First, get the current user's profile to check their score and preferences
      const currentUser = await this.getProfileByAddress(currentUserAddress);
      if (!currentUser) {
        console.error("Current user not found");
        return [];
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("address", currentUserAddress.toLowerCase())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convert snake_case to camelCase for consistency
      let profiles = (data || []).map((profile) => ({
        ...profile,
        displayName: profile.display_name,
        profilePicture: profile.profile_picture,
        ethosScore: profile.ethos_score,
        trustLevel: profile.trust_level,
        xpTotal: profile.xp_total,
        lookingFor: profile.looking_for,
        genderPreference: profile.gender_preference,
        minVisibleToEthosScore: profile.min_visible_to_ethos_score || 0,
      }));

      // Fetch fresh trust levels and stats from Ethos API for each profile
      const { ethosService } = await import("./ethosService");
      profiles = await Promise.all(
        profiles.map(async (profile) => {
          try {
            const ethosData = await ethosService.getEthosProfile(
              profile.address,
            );
            return {
              ...profile,
              trustLevel: ethosData.trustLevel,
              ethosScore: ethosData.ethosScore,
              stats: ethosData.stats || {},
              xpTotal: ethosData.xpTotal || profile.xpTotal || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching Ethos data for ${profile.address}:`,
              error,
            );
            return profile; // Keep existing data if API fails
          }
        }),
      );

      // Filter profiles based on visibility and gender preferences
      profiles = profiles.filter((profile) => {
        // 1. Check if current user meets the profile's visibility requirements
        const meetsVisibilityRequirement = currentUser.ethosScore >= profile.minVisibleToEthosScore;

        if (!meetsVisibilityRequirement) {
          return false;
        }

        // 2. Check gender preference matching
        const currentUserPref = currentUser.genderPreference;
        const profilePref = profile.genderPreference;

        // If either user has no preference set, show the profile
        if (!currentUserPref || !profilePref) {
          return true;
        }

        // Extract gender identities and looking-for from preferences
        // Format: 'man-woman' means "man looking for woman"
        const [currentUserGender, currentUserLookingFor] = currentUserPref.split('-');
        const [profileGender, profileLookingFor] = profilePref.split('-');

        // Check if they're a match:
        // Current user should be what the profile is looking for
        // AND profile should be what current user is looking for

        const currentUserMatchesProfilePreference =
          profileLookingFor === 'everyone' ||
          profileLookingFor === currentUserGender;

        const profileMatchesCurrentUserPreference =
          currentUserLookingFor === 'everyone' ||
          currentUserLookingFor === profileGender;

        return currentUserMatchesProfilePreference && profileMatchesCurrentUserPreference;
      });

      return profiles;
    } catch (error) {
      console.error("Error loading profiles:", error);
      return [];
    }
  }

  /**
   * Save current logged-in user (still using localStorage for session)
   */
  setCurrentUser(address) {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, address);
    } catch (error) {
      console.error("Error saving current user:", error);
    }
  }

  /**
   * Get current logged-in user address
   */
  getCurrentUser() {
    try {
      return localStorage.getItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error("Error loading current user:", error);
      return null;
    }
  }

  /**
   * Logout current user
   */
  logout() {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  /**
   * Check if a profile exists for an address
   */
  async profileExists(address) {
    const profile = await this.getProfileByAddress(address);
    return profile !== null;
  }

  /**
   * Clear all data (for testing/development)
   */
  async clearAll() {
    try {
      await supabase
        .from("profiles")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase
        .from("pair_requests")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase
        .from("active_pairs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }

  /**
   * Send a pairing request from one user to another
   */
  async sendPairRequest(fromAddress, toProfile) {
    try {
      // Check if request already exists
      const { data: existing } = await supabase
        .from("pair_requests")
        .select("*")
        .eq("from_address", fromAddress.toLowerCase())
        .eq("to_address", toProfile.address.toLowerCase())
        .eq("status", "pending")
        .single();

      if (existing) {
        return existing;
      }

      const { data, error } = await supabase
        .from("pair_requests")
        .insert({
          from_address: fromAddress.toLowerCase(),
          to_address: toProfile.address.toLowerCase(),
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error sending pair request:", error);
      throw new Error("Failed to send pair request");
    }
  }

  /**
   * Get all pairing requests
   */
  async getPairRequests() {
    try {
      const { data, error } = await supabase
        .from("pair_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading pair requests:", error);
      return [];
    }
  }

  /**
   * Get pairing requests received by a user
   */
  async getReceivedRequests(userAddress) {
    try {
      const { data, error } = await supabase
        .from("pair_requests")
        .select("*")
        .eq("to_address", userAddress.toLowerCase())
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading received requests:", error);
      return [];
    }
  }

  /**
   * Get pairing requests sent by a user
   */
  async getSentRequests(userAddress) {
    try {
      const { data, error } = await supabase
        .from("pair_requests")
        .select("*")
        .eq("from_address", userAddress.toLowerCase())
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading sent requests:", error);
      return [];
    }
  }

  /**
   * Accept a pairing request
   */
  async acceptPairRequest(requestId) {
    try {
      // Update request status
      const { data: request, error: updateError } = await supabase
        .from("pair_requests")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Add to active pairs
      await this.addActivePair(request.from_address, request.to_address);

      return request;
    } catch (error) {
      console.error("Error accepting pair request:", error);
      throw new Error("Failed to accept pair request");
    }
  }

  /**
   * Decline a pairing request
   */
  async declinePairRequest(requestId) {
    try {
      const { data, error } = await supabase
        .from("pair_requests")
        .update({
          status: "declined",
          declined_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error declining pair request:", error);
      throw new Error("Failed to decline pair request");
    }
  }

  /**
   * Get all active pairs
   */
  async getActivePairs() {
    try {
      const { data, error } = await supabase
        .from("active_pairs")
        .select("*")
        .order("paired_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading active pairs:", error);
      return [];
    }
  }

  /**
   * Get active pairs for a specific user
   */
  async getUserActivePairs(userAddress) {
    try {
      const lowerAddress = userAddress.toLowerCase();
      const { data, error } = await supabase
        .from("active_pairs")
        .select("*")
        .or(`user1_address.eq.${lowerAddress},user2_address.eq.${lowerAddress}`)
        .order("paired_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading user active pairs:", error);
      return [];
    }
  }

  /**
   * Add an active pair
   */
  async addActivePair(user1Address, user2Address) {
    try {
      const { data, error } = await supabase
        .from("active_pairs")
        .insert({
          user1_address: user1Address.toLowerCase(),
          user2_address: user2Address.toLowerCase(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding active pair:", error);
      throw new Error("Failed to add active pair");
    }
  }

  /**
   * Block a user
   */
  async blockUser(blockerAddress, blockedAddress) {
    try {
      const { error } = await supabase.from("blocked_users").insert({
        blocker_address: blockerAddress.toLowerCase(),
        blocked_address: blockedAddress.toLowerCase(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error blocking user:", error);
      return false;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerAddress, blockedAddress) {
    try {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("blocker_address", blockerAddress.toLowerCase())
        .eq("blocked_address", blockedAddress.toLowerCase());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error unblocking user:", error);
      return false;
    }
  }

  /**
   * Get list of blocked users for the current user
   */
  async getBlockedUsers(userAddress) {
    try {
      const { data, error } = await supabase
        .from("blocked_users")
        .select("blocked_address")
        .eq("blocker_address", userAddress.toLowerCase());

      if (error) throw error;
      return (data || []).map((item) => item.blocked_address);
    } catch (error) {
      console.error("Error getting blocked users:", error);
      return [];
    }
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(blockerAddress, blockedAddress) {
    try {
      const { data, error } = await supabase
        .from("blocked_users")
        .select("id")
        .eq("blocker_address", blockerAddress.toLowerCase())
        .eq("blocked_address", blockedAddress.toLowerCase())
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking if user is blocked:", error);
      return false;
    }
  }
}

export const profileDB = new ProfileDatabase();
