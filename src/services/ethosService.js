// Real Ethos API service
const ETHOS_API_BASE = "https://api.ethos.network/api/v2";

export const ethosService = {
  async getEthosProfile(address) {
    try {
      // Fetch user data and score in parallel
      const [userData, scoreData] = await Promise.all([
        this.getUserByAddress(address),
        this.getScoreByAddress(address),
      ]);

      if (!userData) {
        throw new Error("User not found on Ethos network");
      }

      const score = scoreData?.score || 0;
      const trustLevel = scoreData?.level || "untrusted"; // Use trust level from API
      return {
        address,
        profilePicture:
          userData.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        ethosScore: score,
        displayName: userData.displayName || null,
        username: userData.username || null,
        description: userData.description || null,
        trustLevel: trustLevel,
        trustLevelColor: scoreData?.color || null, // Get color from API if available
        stats: userData.stats || {},
        xpTotal: userData.xpTotal || 0,
      };
    } catch (error) {
      console.error("Error fetching Ethos profile:", error);
      // Return fallback data instead of throwing
      return {
        address,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        ethosScore: 0,
        displayName: null,
        username: null,
        description: null,
        trustLevel: "untrusted",
        stats: {},
        xpTotal: 0,
      };
    }
  },

  async getUserByAddress(address) {
    try {
      const response = await fetch(
        `${ETHOS_API_BASE}/user/by/address/${address}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user by address:", error);
      return null;
    }
  },

  async getScoreByAddress(address) {
    try {
      const response = await fetch(
        `${ETHOS_API_BASE}/score/address?address=${encodeURIComponent(address)}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { score: 0, level: "untrusted" };
        }
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching score by address:", error);
      return { score: 0, level: "untrusted" };
    }
  },

  async verifyAddress(address) {
    // Basic Ethereum address validation
    const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumRegex.test(address);
  },

  // Batch fetch multiple profiles (useful for optimization)
  async getBulkProfiles(addresses) {
    if (!addresses || addresses.length === 0) {
      return [];
    }

    try {
      // Limit to 500 addresses as per API documentation
      const limitedAddresses = addresses.slice(0, 500);

      const [usersResponse, scoresResponse] = await Promise.all([
        fetch(`${ETHOS_API_BASE}/users/by/address`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addresses: limitedAddresses }),
        }),
        fetch(`${ETHOS_API_BASE}/score/addresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addresses: limitedAddresses }),
        }),
      ]);

      const users = await usersResponse.json();
      const scores = await scoresResponse.json();

      // Map users with their scores
      return limitedAddresses.map((address) => {
        const user = users.find(
          (u) => u.address?.toLowerCase() === address.toLowerCase(),
        );
        const scoreData = scores[address] ||
          scores[address.toLowerCase()] || { score: 0, level: "untrusted" };

        if (!user) {
          return {
            address,
            profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
            ethosScore: 0,
            displayName: null,
            username: null,
            description: null,
            trustLevel: "untrusted",
          };
        }

        const score = scoreData.score || 0;
        return {
          address,
          profilePicture:
            user.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
          ethosScore: score,
          displayName: user.displayName || null,
          username: user.username || null,
          description: user.description || null,
          trustLevel: scoreData.level || "untrusted", // Use trust level from API
          trustLevelColor: scoreData.color || null, // Get color from API if available
          stats: user.stats || {},
          xpTotal: user.xpTotal || 0,
        };
      });
    } catch (error) {
      console.error("Error fetching bulk profiles:", error);
      // Return fallback data for all addresses
      return addresses.map((address) => ({
        address,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        ethosScore: 0,
        displayName: null,
        username: null,
        description: null,
        trustLevel: "untrusted",
      }));
    }
  },
};
