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
          <div className="flex justify-center mb-4">
            <img
              src={user.profilePicture || '/default-avatar.png'}
              alt={user.displayName || user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-600 shadow-lg"
            />
          </div>

          {/* Basic Info */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-slate-100">
              {user.displayName || user.name || 'Anonymous'}
            </h2>
            {user.username && (
              <p className="text-sm text-slate-400 mt-1">@{user.username}</p>
            )}
          </div>

          {/* Ethos Score & Trust Level */}
          <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm font-medium">
              ⭐ Ethos Score: {user.ethosScore || 0}
            </span>
            {user.trustLevel && (
              <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm font-medium">
                {user.trustLevel.charAt(0).toUpperCase() + user.trustLevel.slice(1)}
              </span>
            )}
          </div>

          {/* XP Display */}
          {user.xpTotal > 0 && (
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm font-medium">
                🎯 XP: {user.xpTotal.toLocaleString()}
              </span>
            </div>
          )}

          {/* Description */}
          {user.description && (
            <div className="mb-4 text-center">
              <p className="text-sm text-slate-300">{user.description}</p>
            </div>
          )}

          {/* Address */}
          <div className="text-center mb-4">
            <p className="text-xs text-slate-500 font-mono">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </p>
          </div>

          {/* Location & Nationality */}
          {(user.location || user.nationality) && (
            <div className="flex justify-center gap-4 mb-4 text-slate-300 text-sm">
              {user.location && (
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{user.location}</span>
                </span>
              )}
              {user.nationality && (
                <span className="flex items-center gap-1">
                  <span>🌍</span>
                  <span>{user.nationality}</span>
                </span>
              )}
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-slate-200 mb-3 text-center">Interests</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {user.lookingFor && user.lookingFor.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-200 mb-3 text-center">Looking For</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {user.lookingFor.map((type, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

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