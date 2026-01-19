import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function UserProfile({ user, onClose, onLogout, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Full Screen Profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="px-4 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-100">My Profile</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8">

          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <img
              src={user.profilePicture || '/default-avatar.png'}
              alt={user.displayName || user.name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-cyan-500 shadow-xl"
            />
          </div>

          {/* Basic Info */}
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
              {user.displayName || user.name || 'Anonymous'}
            </h2>
            {user.username && (
              <p className="text-base text-slate-400">@{user.username}</p>
            )}
          </div>

          {/* Ethos Score & Trust Level */}
          <div className="flex justify-center items-center gap-3 mb-8 flex-wrap">
            <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 rounded-xl font-semibold shadow-md">
              <span className="text-yellow-400">⭐</span>
              <span>{user.ethosScore || 0}</span>
            </div>
            {user.trustLevel && (
              <div className="px-5 py-3 bg-slate-700 text-slate-100 rounded-xl font-semibold shadow-md border border-slate-600">
                {user.trustLevel.charAt(0).toUpperCase() + user.trustLevel.slice(1)}
              </div>
            )}
          </div>

          {/* XP Display */}
          {user.xpTotal > 0 && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 rounded-xl font-semibold shadow-md">
                <span>🎯</span>
                <span>{user.xpTotal.toLocaleString()} XP</span>
              </div>
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <div className="mb-8 p-6 bg-slate-700/30 rounded-xl border border-slate-600">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">About</h3>
              <p className="text-slate-200 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Description */}
          {user.description && (
            <div className="mb-8 p-6 bg-slate-700/30 rounded-xl border border-slate-600">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Description</h3>
              <p className="text-slate-200 leading-relaxed">{user.description}</p>
            </div>
          )}

          {/* Location & Nationality */}
          {(user.location || user.nationality) && (
            <div className="flex justify-center gap-6 mb-8 text-slate-300 flex-wrap">
              {user.location && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600">
                  <span>📍</span>
                  <span className="font-medium">{user.location}</span>
                </div>
              )}
              {user.nationality && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600">
                  <span>🌍</span>
                  <span className="font-medium">{user.nationality}</span>
                </div>
              )}
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4 text-center">Interests</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 rounded-lg border border-slate-600 font-medium shadow-sm hover:shadow-md transition"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {user.lookingFor && user.lookingFor.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4 text-center">Looking For</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {user.lookingFor.map((type, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg font-medium shadow-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          <div className="mt-8 pt-6 border-t border-slate-700 mb-6">
            <div className="text-center">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Ethos Address
              </h3>
              <p className="text-xs text-slate-400 font-mono bg-slate-900/50 p-3 rounded-lg break-all border border-slate-700">
                {user.address}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <button
              onClick={() => alert('Edit functionality coming soon!')}
              className="w-full px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition font-medium"
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full px-4 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition font-medium"
            >
              🚪 Logout
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-3 bg-red-900 bg-opacity-50 text-red-300 rounded-lg hover:bg-opacity-70 transition font-medium"
            >
              🗑️ Delete Account
            </button>
          </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-xl font-bold text-red-400 mb-3">Delete Account?</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-xl font-bold text-slate-100 mb-3">Logout?</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition font-medium"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}