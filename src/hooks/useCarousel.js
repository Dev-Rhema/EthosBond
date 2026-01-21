import { useState, useEffect } from "react";
import { profileDB } from "../services/profileDatabase";

export default function useCarousel(filters, currentUserId) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoading(true);

      try {
        // Load profiles from database
        const profiles = await profileDB.getProfilesForDiscovery(currentUserId);

        // Get blocked users list
        const blockedUsers = await profileDB.getBlockedUsers(currentUserId);

        // Get bonded users list
        const bonds = await profileDB.getUserActivePairs(currentUserId);
        const bondedUserAddresses = bonds.map((bond) =>
          bond.user1_address.toLowerCase() === currentUserId.toLowerCase()
            ? bond.user2_address.toLowerCase()
            : bond.user1_address.toLowerCase()
        );

        // Apply filters
        let filtered = profiles;

        // Filter out blocked users
        filtered = filtered.filter(
          (u) => !blockedUsers.includes(u.address.toLowerCase()),
        );

        // Filter out bonded users
        filtered = filtered.filter(
          (u) => !bondedUserAddresses.includes(u.address.toLowerCase()),
        );

        if (filters.location) {
          filtered = filtered.filter((u) =>
            u.location?.toLowerCase().includes(filters.location.toLowerCase()),
          );
        }

        if (filters.nationality) {
          filtered = filtered.filter((u) =>
            u.nationality
              ?.toLowerCase()
              .includes(filters.nationality.toLowerCase()),
          );
        }

        if (filters.interests && filters.interests.length > 0) {
          filtered = filtered.filter((u) =>
            filters.interests.some((interest) =>
              u.interests?.some((uInterest) =>
                uInterest.toLowerCase().includes(interest.toLowerCase()),
              ),
            ),
          );
        }

        if (filters.relationshipTypes && filters.relationshipTypes.length > 0) {
          filtered = filtered.filter((u) =>
            filters.relationshipTypes.some((type) =>
              u.relationshipTypes?.includes(type),
            ),
          );
        }

        // Apply reputation range filter
        if (
          filters.minReputation !== undefined ||
          filters.maxReputation !== undefined
        ) {
          const minRep = filters.minReputation ?? 0;
          const maxRep = filters.maxReputation ?? 2800;
          filtered = filtered.filter((u) => {
            const score = u.ethosScore || 0;
            return score >= minRep && score <= maxRep;
          });
        }

        setFilteredUsers(filtered);
      } catch (error) {
        console.error("Error loading profiles:", error);
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
      }

      setCurrentIndex(0);
    };

    loadProfiles();
  }, [filters, currentUserId]);

  const nextProfile = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredUsers.length);
  };

  const skipProfile = () => {
    // Could track skipped profiles here for analytics
    const profile = filteredUsers[currentIndex];
    // Profile skipped
  };

  return {
    currentProfile: filteredUsers[currentIndex],
    nextProfile,
    skipProfile,
    totalProfiles: filteredUsers.length,
    currentProfileIndex: currentIndex,
    isLoading,
  };
}
