import { motion } from 'framer-motion';

export default function ProfileView({ profile, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src={profile.profilePicture}
            alt={profile.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-700 shadow-lg"
          />
        </div>

        {/* Name */}
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {profile.name}
        </h2>

        {/* Ethos Score */}
        <div className="flex justify-center mb-6">
          <span className="px-4 py-2 bg-blue-100 text-blue-900 rounded-full font-medium">
            ⭐ Ethos Score: {profile.ethosScore}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
            <p className="text-gray-600">📍 {profile.location}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Nationality</h3>
            <p className="text-gray-600">🌍 {profile.nationality}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Ethos Address</h3>
            <p className="text-gray-600 text-xs font-mono bg-gray-100 p-2 rounded break-all">
              {profile.address}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-300 text-gray-900 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
