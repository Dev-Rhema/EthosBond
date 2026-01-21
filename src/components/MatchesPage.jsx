import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MessageCircle,
  MoreVertical,
  User,
  Link2Off,
  Ban,
  AlertCircle,
} from "lucide-react";
import { profileDB } from "../services/profileDatabase";
import ConfirmationModal from "./ConfirmationModal";

export default function MatchesPage({
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
      await profileDB.blockUser(currentUser.address, bond.profile.address);
      onUnbond(bond);
      setOpenMenuId(null);
      setBlockConfirmation(null);
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    } finally {
      setIsBlockingLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* New Matches Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            New Matches
          </h2>
          {bonds.length > 0 && (
            <span className="bg-cyan-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {bonds.filter((b) => !b.lastMessage).length}
            </span>
          )}
        </div>

        {bonds.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700/50">
            <p className="text-slate-400 text-sm">
              No matches yet. Keep discovering!
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {bonds
              .filter((b) => !b.lastMessage)
              .map((bond, index) => {
                const profile = bond.profile;
                if (!profile) return null;

                return (
                  <motion.button
                    key={bond.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onViewProfile(profile)}
                    className="flex flex-col items-center flex-shrink-0"
                  >
                    <div className="relative">
                      <img
                        src={profile.profilePicture || "/default-avatar.png"}
                        alt={profile.displayName || profile.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500"
                      />
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                    </div>
                    <p className="text-white text-sm mt-2 font-medium truncate max-w-[70px]">
                      {profile.displayName || profile.name || "Anonymous"}
                    </p>
                    <p className="text-cyan-400 text-xs">
                      {profile.ethosScore || 0}
                    </p>
                  </motion.button>
                );
              })}
          </div>
        )}
      </div>

      {/* Messages Section */}
      <div>
        <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-slate-400" />
          Messages
        </h2>

        {bonds.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700/50">
            <p className="text-slate-400 text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bonds.map((bond, index) => {
              const profile = bond.profile;
              if (!profile) return null;

              const isMenuOpen = openMenuId === bond.id;

              return (
                <motion.div
                  key={bond.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChat(bond)}
                      className="flex-1 flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/70 transition"
                    >
                      {/* Profile Picture */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={profile.profilePicture || "/default-avatar.png"}
                          alt={profile.displayName || profile.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-700"
                        />
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900" />
                      </div>

                      {/* Message Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium truncate">
                            {profile.displayName || profile.name || "Anonymous"}
                          </h3>
                          <span className="text-slate-500 text-xs flex-shrink-0 ml-2">
                            {bond.lastMessageTime
                              ? new Date(
                                  bond.lastMessageTime,
                                ).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm truncate mt-0.5">
                          {bond.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </button>

                    {/* Unread Badge */}
                    {bond.unreadCount > 0 && (
                      <div className="flex items-center gap-2 flex-shrink-0 pr-2">
                        <span className="flex items-center gap-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          {bond.unreadCount}
                        </span>
                      </div>
                    )}

                    {/* 3-Dot Menu Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : bond.id);
                      }}
                      className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition flex-shrink-0 relative"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 bg-slate-700 rounded-xl shadow-xl z-10 min-w-44 overflow-hidden border border-slate-600"
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
                            const ethosUrl = `https://www.ethos.network/profile/${profile.address}`;
                            window.open(ethosUrl, "_blank");
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-3 text-cyan-300 hover:bg-slate-600 transition flex items-center gap-2 text-sm border-t border-slate-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.343a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.343 15.657a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM5 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.343 5.343a1 1 0 011.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM10 5a1 1 0 01-1-1V3a1 1 0 012 0v1a1 1 0 01-1 1z" />
                          </svg>
                          Leave a Review
                        </button>
                        <button
                          onClick={() => {
                            onUnbond(bond);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-3 text-orange-300 hover:bg-slate-600 transition flex items-center gap-2 text-sm border-t border-slate-600"
                        >
                          <Link2Off className="w-4 h-4" />
                          Unmatch
                        </button>
                        <button
                          onClick={() => {
                            handleBlockClick(bond);
                          }}
                          className="w-full text-left px-4 py-3 text-red-300 hover:bg-slate-600 transition flex items-center gap-2 text-sm border-t border-slate-600"
                        >
                          <Ban className="w-4 h-4" />
                          Block
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

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
