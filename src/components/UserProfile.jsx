import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Edit2, ExternalLink, Wallet } from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import { profileDB } from "../services/profileDatabase";

export default function UserProfile({ user, onClose, onLogout, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      await profileDB.saveProfile(updatedProfile);
      setCurrentUser(updatedProfile);
      setShowEditModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Calculate credibility percentage
  const credibilityPercent = Math.round(
    ((currentUser.ethosScore || 0) / 2800) * 100,
  );

  // Calculate total reviews received (positive + neutral + negative)
  const reviewsReceived = currentUser.stats?.review?.received
    ? (currentUser.stats.review.received.positive || 0) +
      (currentUser.stats.review.received.neutral || 0) +
      (currentUser.stats.review.received.negative || 0)
    : 0;

  // Get trust level label
  const getTrustLabel = (score) => {
    if (score >= 2000) return "Exceptional";
    if (score >= 1600) return "Reputable";
    if (score >= 1200) return "Neutral";
    if (score >= 800) return "Questionable";
    return "Untrusted";
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
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="px-4 py-3 flex items-center gap-3 max-w-lg mx-auto w-full">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-cyan-400">Profile</h1>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center text-sm font-medium"
            >
              Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
            {/* Profile Header Card */}
            <div className="flex flex-col items-center">
              {/* Profile Picture */}
              <div className="relative mb-3">
                <img
                  src={currentUser.profilePicture || "/default-avatar.png"}
                  alt={currentUser.displayName || currentUser.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-slate-700"
                />
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-900 hover:bg-slate-600 transition"
                >
                  <Edit2 className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              {/* Name and Location */}
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">
                  {currentUser.displayName || currentUser.name || "Anonymous"}
                </h2>
                <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {currentUser.location && (
                <p className="text-slate-400 text-sm">{currentUser.location}</p>
              )}
            </div>

            {/* Ethos Reputation Card */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Ethos Reputation</h3>
                <a
                  href={`https://www.ethos.network/profile/${currentUser.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 text-sm hover:text-cyan-400 transition"
                >
                  View on Ethos
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Score Badge */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                  <span className="text-yellow-400">★</span>
                  <span className="text-cyan-400 font-bold">
                    {currentUser.ethosScore || 0}
                  </span>
                  <span className="text-slate-300 text-sm">
                    {getTrustLabel(currentUser.ethosScore || 0)}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {credibilityPercent}%
                  </p>
                  <p className="text-xs text-slate-400">Credibility</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {reviewsReceived}
                  </p>
                  <p className="text-xs text-slate-400">Reviews</p>
                </div>
              </div>
            </div>

            {/* Connected Wallet Card */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      Connected Wallet
                    </p>
                    <p className="text-slate-400 text-xs font-mono">
                      {currentUser.address?.slice(0, 6)}...
                      {currentUser.address?.slice(-4)}
                    </p>
                  </div>
                </div>
                <button className="text-slate-400 text-sm hover:text-cyan-400 transition">
                  Change
                </button>
              </div>
            </div>

            {/* About Card */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold">About</h3>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1 text-slate-400 text-sm hover:text-cyan-400 transition"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                {currentUser.bio ||
                  currentUser.description ||
                  "No bio added yet."}
              </p>

              {/* Interests */}
              {currentUser.interests && currentUser.interests.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Edit Profile Button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition"
              >
                Edit Profile
              </button>

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-3 bg-slate-700 text-slate-200 rounded-xl font-medium hover:bg-slate-600 transition"
              >
                Logout
              </button>

              {/* Delete Account Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 text-red-400 text-sm font-medium hover:text-red-300 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
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
              className="bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-700"
            >
              <h3 className="text-xl font-bold text-red-400 mb-3">
                Delete Account?
              </h3>
              <p className="text-slate-300 mb-6 text-sm">
                Are you sure you want to delete your account? This action cannot
                be undone. All your data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
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
              className="bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-700"
            >
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                Disconnect Wallet?
              </h3>
              <p className="text-slate-300 mb-6 text-sm">
                Are you sure you want to disconnect your wallet and logout?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition font-medium"
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            user={currentUser}
            onSave={handleSaveProfile}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
