import { useState } from "react";
import { motion } from "framer-motion";
import { profileDB } from "../services/profileDatabase";

export default function PastPairsList({
  pastPairs,
  currentUser,
  onViewProfile,
  onPairRequest,
}) {
  const [blockedUsers, setBlockedUsers] = useState({});
  const [loading, setLoading] = useState({});

  // Load blocked status for all past pairs on mount
  const loadBlockedStatus = async () => {
    if (!currentUser?.address) return;

    const blocked = {};
    for (const pair of pastPairs) {
      const isBlocked = await profileDB.isUserBlocked(
        currentUser.address,
        pair.address,
      );
      blocked[pair.address] = isBlocked;
    }
    setBlockedUsers(blocked);
  };

  // Load blocked status once
  if (Object.keys(blockedUsers).length === 0 && pastPairs.length > 0) {
    loadBlockedStatus();
  }

  const handleUnblock = async (pair) => {
    try {
      setLoading((prev) => ({ ...prev, [pair.address]: true }));
      await profileDB.unblockUser(currentUser.address, pair.address);
      setBlockedUsers((prev) => ({ ...prev, [pair.address]: false }));
      console.log("User unblocked:", pair.address);
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user");
    } finally {
      setLoading((prev) => ({ ...prev, [pair.address]: false }));
    }
  };

  const handlePairRequest = (pair) => {
    onPairRequest(pair);
  };

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">🕘 Past Pairs</h2>
      {pastPairs.length === 0 ? (
        <div className="bg-white bg-opacity-20 rounded-lg p-8 text-center">
          <p className="text-white">No past pairs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pastPairs.map((pair, index) => {
            const isBlocked = blockedUsers[pair.address];
            const isLoadingAction = loading[pair.address];

            return (
              <motion.div
                key={pair.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg p-4 flex items-center justify-between ${
                  isBlocked
                    ? "bg-red-100 bg-opacity-20 border border-red-300"
                    : "bg-white bg-opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={pair.profilePicture}
                    alt={pair.name}
                    className={`w-14 h-14 rounded-full ${isBlocked ? "opacity-50" : "grayscale opacity-75"}`}
                  />
                  <div>
                    <h3
                      className={`font-semibold ${isBlocked ? "text-red-600" : "text-gray-700"}`}
                    >
                      {pair.name}
                    </h3>
                    <p
                      className={`text-sm ${isBlocked ? "text-red-500" : "text-gray-500"}`}
                    >
                      {isBlocked ? "🚫 Blocked" : "Previously paired"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isBlocked ? (
                    // Blocked user - show unblock button
                    <button
                      onClick={() => handleUnblock(pair)}
                      disabled={isLoadingAction}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50"
                    >
                      {isLoadingAction ? "..." : "🔓 Unblock"}
                    </button>
                  ) : (
                    // Unpaired user - show pair and view profile buttons
                    <>
                      <button
                        onClick={() => handlePairRequest(pair)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                      >
                        💜 Pair Again
                      </button>
                      <button
                        onClick={() => onViewProfile(pair)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                      >
                        View Profile
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
