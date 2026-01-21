import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

export default function ProfileCard({ profile }) {
  if (!profile) {
    return (
      <div className="bg-slate-800 rounded-3xl shadow-xl w-full max-w-sm h-[520px] flex items-center justify-center">
        <p className="text-slate-400">No more profiles to show</p>
      </div>
    );
  }

  const displayName = profile.displayName || profile.name || "Anonymous";
  const ethosScore = profile.ethosScore || 0;
  const description = profile.description || profile.bio;

  // Calculate credibility percentage (score out of 2800)
  const credibilityPercent = Math.round((ethosScore / 2800) * 100);

  // Calculate total reviews received (positive + neutral + negative)
  const reviewsReceived = profile.stats?.review?.received
    ? (profile.stats.review.received.positive || 0) +
      (profile.stats.review.received.neutral || 0) +
      (profile.stats.review.received.negative || 0)
    : 0;

  return (
    <motion.div
      className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile Image - Large */}
      <div className="relative h-64 w-full">
        <img
          src={profile.profilePicture || "/default-avatar.png"}
          alt={displayName}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-transparent to-transparent" />

        {/* Name and location overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            {displayName}
          </h2>
          <div className="flex items-center gap-4 mt-1">
            {profile.location && (
              <span className="flex items-center gap-1 text-slate-300 text-sm">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-400 text-sm">
              <Clock className="w-4 h-4" />
              19h ago
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Bio/Description */}
        {description && (
          <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Interests Tags */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {profile.interests.slice(0, 4).map((interest, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-slate-700/80 text-slate-200 rounded-full text-xs font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex justify-between items-center py-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-100">{credibilityPercent}%</p>
            <p className="text-xs text-slate-400">Credibility</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-100">
              {reviewsReceived}
            </p>
            <p className="text-xs text-slate-400">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-cyan-400">{ethosScore}</p>
            <p className="text-xs text-slate-400">Score</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
