import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Unlock, UserPlus, Eye, Ban } from "lucide-react";
import { profileDB } from "../services/profileDatabase";

export default function PastBondsList({
  pastBonds,
  currentUser,
  onViewProfile,
  onBondRequest,
}) {
  const [blockedUsers, setBlockedUsers] = useState({});
  const [loading, setLoading] = useState({});

  // Load blocked status for all past bonds on mount
  const loadBlockedStatus = async () => {
    if (!currentUser?.address) return;

    const blocked = {};
    for (const bond of pastBonds) {
      const isBlocked = await profileDB.isUserBlocked(
        currentUser.address,
        bond.address,
      );
      blocked[bond.address] = isBlocked;
    }
    setBlockedUsers(blocked);
  };

  // Load blocked status once
  if (Object.keys(blockedUsers).length === 0 && pastBonds.length > 0) {
    loadBlockedStatus();
  }

  const handleUnblock = async (bond) => {
    try {
      setLoading((prev) => ({ ...prev, [bond.address]: true }));
      await profileDB.unblockUser(currentUser.address, bond.address);
      setBlockedUsers((prev) => ({ ...prev, [bond.address]: false }));
      console.log("User unblocked:", bond.address);
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user");
    } finally {
      setLoading((prev) => ({ ...prev, [bond.address]: false }));
    }
  };

  const handleBondRequest = (bond) => {
    onBondRequest(bond);
  };

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-100 flex items-center gap-2">
        <Clock className="w-6 h-6 text-slate-400" />
        Past Bonds
      </h2>
      {pastBonds.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-300">No past bonds</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pastBonds.map((bond, index) => {
            const isBlocked = blockedUsers[bond.address];
            const isLoadingAction = loading[bond.address];

            return (
              <motion.div
                key={bond.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 ${
                  isBlocked
                    ? "bg-red-900/20 border border-red-800"
                    : "bg-slate-800 border border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <img
                    src={bond.profilePicture}
                    alt={bond.name}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 ${isBlocked ? "opacity-50" : "grayscale opacity-75"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`font-semibold truncate text-sm sm:text-base ${isBlocked ? "text-red-400" : "text-slate-200"}`}
                    >
                      {bond.name}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm flex items-center gap-1.5 ${isBlocked ? "text-red-400" : "text-slate-400"}`}
                    >
                      {isBlocked ? (
                        <>
                          <Ban className="w-3 h-3" />
                          Blocked
                        </>
                      ) : (
                        "Previously bonded"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {isBlocked ? (
                    // Blocked user - show unblock button
                    <button
                      onClick={() => handleUnblock(bond)}
                      disabled={isLoadingAction}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm disabled:opacity-50"
                    >
                      <Unlock className="w-4 h-4" />
                      {isLoadingAction ? "..." : "Unblock"}
                    </button>
                  ) : (
                    // Unbonded user - show bond and view profile buttons
                    <>
                      <button
                        onClick={() => handleBondRequest(bond)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition text-xs sm:text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Bond Again</span>
                        <span className="sm:hidden">Bond</span>
                      </button>
                      <button
                        onClick={() => onViewProfile(bond)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition text-xs sm:text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
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
