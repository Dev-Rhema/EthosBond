import { useState } from "react";
import { motion } from "framer-motion";
import { profileDB } from "../services/profileDatabase";
import ConfirmationModal from "./ConfirmationModal";

export default function ActivePairsList({
  pairs,
  currentUser,
  onOpenChat,
  onUnpair,
  onViewProfile,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [blockConfirmation, setBlockConfirmation] = useState(null);
  const [isBlockingLoading, setIsBlockingLoading] = useState(false);

  const handleBlockClick = (pair) => {
    setBlockConfirmation(pair);
  };

  const handleBlock = async (pair) => {
    try {
      setIsBlockingLoading(true);
      // Block the user
      await profileDB.blockUser(currentUser.address, pair.profile.address);
      // Unpair them
      onUnpair(pair);
      setOpenMenuId(null);
      setBlockConfirmation(null);
      console.log("User blocked:", pair.profile.address);
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    } finally {
      setIsBlockingLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-white">✅ Active Pairs</h2>
      {pairs.length === 0 ? (
        <div className="bg-white bg-opacity-20 rounded-lg p-8 text-center">
          <p className="text-white">No active pairs yet. Start discovering!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pairs.map((pair, index) => {
            const profile = pair.profile;
            if (!profile) return null;

            const isMenuOpen = openMenuId === pair.id;

            return (
              <motion.div
                key={pair.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={profile.profilePicture || "/default-avatar.png"}
                    alt={profile.displayName || profile.name}
                    className="w-14 h-14 rounded-full border-2 border-gray-600 object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-100">
                      {profile.displayName || profile.name || "Anonymous"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      ⭐ Ethos: {profile.ethosScore || 0}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  {/* Message Icon Button */}
                  <button
                    onClick={() => onOpenChat(pair)}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
                    title="Send message"
                  >
                    ✉️
                  </button>

                  {/* 3-Dot Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(isMenuOpen ? null : pair.id)}
                      className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
                      title="More options"
                    >
                      ⋮
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 bg-gray-700 rounded-lg shadow-lg z-10 min-w-48 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            onViewProfile(profile);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-200 hover:bg-gray-600 transition flex items-center gap-2"
                        >
                          👤 View Profile
                        </button>
                        <button
                          onClick={() => {
                            onUnpair(pair);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-3 text-orange-300 hover:bg-gray-600 transition flex items-center gap-2"
                        >
                          🔗 Unpair
                        </button>
                        <button
                          onClick={() => {
                            handleBlockClick(pair);
                          }}
                          className="w-full text-left px-4 py-3 text-red-300 hover:bg-gray-600 transition flex items-center gap-2"
                        >
                          🚫 Block
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Block Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!blockConfirmation}
        title="Block User"
        message={`Are you sure you want to block ${blockConfirmation?.profile?.displayName || blockConfirmation?.profile?.name}? You won't see them in your feed anymore.`}
        confirmText="Block"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={() => handleBlock(blockConfirmation)}
        onCancel={() => setBlockConfirmation(null)}
        isLoading={isBlockingLoading}
      />
    </div>
  );
}
