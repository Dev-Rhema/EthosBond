import { motion } from "framer-motion";

export default function ProfileCard({ profile }) {
  if (!profile) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md h-[500px] flex items-center justify-center">
        <p className="text-gray-400">No more profiles to show</p>
      </div>
    );
  }

  // Support both real Ethos data and legacy mock data
  const displayName = profile.displayName || profile.name || "Anonymous";
  const username = profile.username;
  const ethosScore = profile.ethosScore || 0;
  const trustLevel = profile.trustLevel || "untrusted";
  const trustLevelColor = profile.trustLevelColor; // Color from API
  const description = profile.description;
  const xpTotal = profile.xpTotal || 0;

  // Get trust level color based on score ranges (fallback if API doesn't provide color)
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

  // Use API color if available, otherwise use calculated color
  const colorClass = trustLevelColor || getTrustLevelColor(trustLevel);

  return (
    <motion.div
      className="bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Profile Picture */}
      <div className="flex justify-center mb-4">
        <img
          src={profile.profilePicture || "/default-avatar.png"}
          alt={displayName}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 shadow-lg"
        />
      </div>

      {/* Basic Info */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-100">{displayName}</h2>
        {username && <p className="text-sm text-gray-400 mt-1">@{username}</p>}
      </div>

      {/* Ethos Score & Trust Level */}
      <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
        <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm font-medium">
          ⭐ Ethos Score: {ethosScore}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${colorClass}`}
        >
          {trustLevel.charAt(0).toUpperCase() + trustLevel.slice(1)}
        </span>
      </div>

      {/* XP Display (if available) */}
      {xpTotal > 0 && (
        <div className="flex justify-center mb-4">
          <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm font-medium">
            🎯 XP: {xpTotal.toLocaleString()}
          </span>
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-300 line-clamp-3">{description}</p>
        </div>
      )}

      {/* Address (shortened) */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 font-mono">
          {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
        </p>
      </div>

      {/* Legacy fields (Location, Nationality, Interests) - only show if available */}
      {(profile.location || profile.nationality) && (
        <div className="flex justify-center gap-4 mb-4 text-gray-300 text-sm">
          {profile.location && (
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span>{profile.location}</span>
            </span>
          )}
          {profile.nationality && (
            <span className="flex items-center gap-1">
              <span>🌍</span>
              <span>{profile.nationality}</span>
            </span>
          )}
        </div>
      )}

      {/* Interests - only show if available */}
      {profile.interests && profile.interests.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-200 mb-3 text-center">
            Interests
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {profile.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats (if available from real Ethos data) */}
      {profile.stats && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {profile.stats.reviewsReceived !== undefined && (
              <div>
                <p className="text-gray-400">Reviews</p>
                <p className="font-semibold text-gray-200">
                  {profile.stats.reviewsReceived}
                </p>
              </div>
            )}
            {profile.stats.vouchesReceived !== undefined && (
              <div>
                <p className="text-gray-400">Vouches</p>
                <p className="font-semibold text-gray-200">
                  {profile.stats.vouchesReceived}
                </p>
              </div>
            )}
            {profile.stats.vouchesGiven !== undefined && (
              <div>
                <p className="text-gray-400">Given</p>
                <p className="font-semibold text-gray-200">
                  {profile.stats.vouchesGiven}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
