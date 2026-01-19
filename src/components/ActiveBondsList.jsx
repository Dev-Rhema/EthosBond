import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, MoreVertical, User, Link2Off, Ban, CheckCircle, Star } from "lucide-react";
import { profileDB } from "../services/profileDatabase";
import ConfirmationModal from "./ConfirmationModal";

export default function ActiveBondsList({
  bonds,
  currentUser,
  onOpenChat,
  onUnbond,
  onViewProfile,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [blockConfirmation, setBlockConfirmation] = useState(null);
  const [isBlockingLoading, setIsBlockingLoading] = useState(false);

  const handleBlockClick = (bond) => {
    setBlockConfirmation(bond);
  };

  const handleBlock = async (bond) => {
    try {
      setIsBlockingLoading(true);
      // Block the user
      await profileDB.blockUser(currentUser.address, bond.profile.address);
      // Unbond them
      onUnbond(bond);
      setOpenMenuId(null);
      setBlockConfirmation(null);
      console.log("User blocked:", bond.profile.address);
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    } finally {
      setIsBlockingLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-100 flex items-center gap-2">
        <CheckCircle className="w-6 h-6 text-cyan-400" />
        Active Bonds
      </h2>
      {bonds.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-300">No active bonds yet. Start discovering!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bonds.map((bond, index) => {
            const profile = bond.profile;
            if (!profile) return null;

            const isMenuOpen = openMenuId === bond.id;

            return (
              <motion.div
                key={bond.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <img
                    src={profile.profilePicture || "/default-avatar.png"}
                    alt={profile.displayName || profile.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-slate-600 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-100 truncate text-sm sm:text-base">
                      {profile.displayName || profile.name || "Anonymous"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      {profile.ethosScore || 0}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  {/* Message Icon Button */}
                  <button
                    onClick={() => onOpenChat(bond)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                    title="Send message"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>

                  {/* 3-Dot Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(isMenuOpen ? null : bond.id)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                      title="More options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 bg-slate-700 rounded-lg shadow-xl z-10 min-w-48 overflow-hidden border border-slate-600"
                      >
                        <button
                          onClick={() => {
                            onViewProfile(profile);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-600 transition flex items-center gap-2 text-sm"
                        >
                          <User className="w-4 h-4" />
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            onUnbond(bond);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-3 text-orange-300 hover:bg-slate-600 transition flex items-center gap-2 text-sm"
                        >
                          <Link2Off className="w-4 h-4" />
                          Unbond
                        </button>
                        <button
                          onClick={() => {
                            handleBlockClick(bond);
                          }}
                          className="w-full text-left px-4 py-3 text-red-300 hover:bg-slate-600 transition flex items-center gap-2 text-sm"
                        >
                          <Ban className="w-4 h-4" />
                          Block
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
