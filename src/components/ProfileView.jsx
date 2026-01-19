import { motion } from "framer-motion";
import { X, Star, Target, MapPin, Globe } from "lucide-react";

export default function ProfileView({ profile, onClose }) {
  const displayName = profile.displayName || profile.name || "Anonymous";
  const username = profile.username;
  const ethosScore = profile.ethosScore || 0;
  const trustLevel = profile.trustLevel || "untrusted";
  const trustLevelColor = profile.trustLevelColor;
  const description = profile.description;
  const xpTotal = profile.xpTotal || 0;

  const getTrustLevelColor = (level) => {
    switch (level) {
      case "renowned":
        return "border-purple-800 text-purple-800";
      case "revered":
        return "border-purple-700 text-purple-700";
      case "distinguished":
        return "border-indigo-700 text-indigo-700";
      case "exemplary":
        return "border-blue-700 text-blue-700";
      case "reputable":
        return "border-cyan-700 text-cyan-700";
      case "established":
        return "border-teal-700 text-teal-700";
      case "known":
        return "border-green-700 text-green-700";
      case "neutral":
        return "border-yellow-700 text-yellow-700";
      case "questionable":
        return "border-orange-700 text-orange-700";
      case "untrusted":
        return "border-red-700 text-red-700";
      default:
        return "border-gray-700 text-gray-700";
    }
  };

  const colorClass = trustLevelColor || getTrustLevelColor(trustLevel);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Profile</h2>
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
                src={profile.profilePicture || "/default-avatar.png"}
                alt={displayName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-cyan-500 shadow-xl"
              />
            </div>

            {/* Basic Info */}
            <div className="text-center mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                {displayName}
              </h2>
              {username && (
                <p className="text-sm text-slate-400 mt-1">@{username}</p>
              )}
            </div>

            {/* Ethos Score & Trust Level */}
            <div className="flex justify-center items-center gap-3 mb-6 flex-wrap">
              <span className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 rounded-full font-medium">
                <Star className="w-5 h-5 text-yellow-400" />
                {ethosScore}
              </span>
              <span
                className={`px-4 py-2 rounded-full font-medium border-2 ${colorClass}`}
              >
                {trustLevel.charAt(0).toUpperCase() + trustLevel.slice(1)}
              </span>
            </div>

            {/* XP Display */}
            {xpTotal > 0 && (
              <div className="flex justify-center mb-6">
                <span className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 rounded-full font-medium">
                  <Target className="w-5 h-5 text-cyan-400" />
                  {xpTotal.toLocaleString()} XP
                </span>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="mb-6 text-center">
                <p className="text-slate-300">{description}</p>
              </div>
            )}

            {/* Address */}
            <div className="text-center mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                Ethos Address
              </h3>
              <p className="text-xs text-slate-500 font-mono bg-slate-900 p-3 rounded break-all">
                {profile.address}
              </p>
            </div>

            {/* Location & Nationality */}
            {(profile.location || profile.nationality) && (
              <div className="flex justify-center gap-6 mb-6 text-slate-300 flex-wrap">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.nationality && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span>{profile.nationality}</span>
                  </div>
                )}
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-200 mb-3 text-center">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 rounded-full border border-slate-600"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {profile.stats && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {profile.stats.reviewsReceived !== undefined && (
                    <div>
                      <p className="text-slate-400 text-sm">Reviews</p>
                      <p className="font-semibold text-slate-200 text-lg">
                        {profile.stats.reviewsReceived}
                      </p>
                    </div>
                  )}
                  {profile.stats.vouchesReceived !== undefined && (
                    <div>
                      <p className="text-slate-400 text-sm">Vouches</p>
                      <p className="font-semibold text-slate-200 text-lg">
                        {profile.stats.vouchesReceived}
                      </p>
                    </div>
                  )}
                  {profile.stats.vouchesGiven !== undefined && (
                    <div>
                      <p className="text-slate-400 text-sm">Given</p>
                      <p className="font-semibold text-slate-200 text-lg">
                        {profile.stats.vouchesGiven}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
