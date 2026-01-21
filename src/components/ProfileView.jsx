import { motion } from "framer-motion";
import { ArrowLeft, Star, Target, MapPin, Globe } from "lucide-react";

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
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="px-4 py-3 flex items-center gap-3 max-w-lg mx-auto w-full">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-cyan-400">Profile</h2>
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
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
                {displayName}
              </h2>
              {username && (
                <p className="text-base text-slate-400">@{username}</p>
              )}
            </div>

            {/* Ethos Score & Trust Level */}
            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap">
              <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 rounded-xl font-semibold shadow-md">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{ethosScore}</span>
              </div>
              <div
                className={`px-5 py-3 rounded-xl font-semibold border-2 shadow-md ${colorClass}`}
              >
                {trustLevel.charAt(0).toUpperCase() + trustLevel.slice(1)}
              </div>
            </div>

            {/* XP Display */}
            {xpTotal > 0 && (
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 rounded-xl font-semibold shadow-md">
                  <Target className="w-5 h-5" />
                  <span>{xpTotal.toLocaleString()} XP</span>
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="mb-8 p-6 bg-slate-700/30 rounded-xl border border-slate-600">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">About</h3>
                <p className="text-slate-200 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="mb-8 p-6 bg-slate-700/30 rounded-xl border border-slate-600">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Description</h3>
                <p className="text-slate-200 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Location & Nationality */}
            {(profile.location || profile.nationality) && (
              <div className="flex justify-center gap-6 mb-8 text-slate-300 flex-wrap">
                {profile.location && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium">{profile.location}</span>
                  </div>
                )}
                {profile.nationality && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium">{profile.nationality}</span>
                  </div>
                )}
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4 text-center">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.interests.map((interest, idx) => (
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

            {/* Address */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="text-center">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Ethos Address
                </h3>
                <p className="text-xs text-slate-400 font-mono bg-slate-900/50 p-3 rounded-lg break-all border border-slate-700">
                  {profile.address}
                </p>
              </div>
            </div>

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
