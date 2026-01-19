import { motion, AnimatePresence } from 'framer-motion';

export default function PairRequestNotifications({
  requests,
  onAccept,
  onDecline,
  onClose
}) {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-2xl text-gray-100">Pair Requests</h3>
            <p className="text-sm text-gray-400 mt-1">
              {requests.length} {requests.length === 1 ? 'person wants' : 'people want'} to connect with you
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-gray-700 rounded-xl p-4 flex items-center gap-4"
              >
                {/* Profile Picture */}
                <img
                  src={request.fromProfile?.profilePicture || '/default-avatar.png'}
                  alt={request.fromProfile?.displayName || request.fromProfile?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                />

                {/* Profile Info */}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-100">
                    {request.fromProfile?.displayName || request.fromProfile?.name || 'Anonymous'}
                  </h4>
                  {request.fromProfile?.username && (
                    <p className="text-sm text-gray-400">@{request.fromProfile.username}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-gray-600 text-gray-200 rounded-full text-xs">
                      ⭐ {request.fromProfile?.ethosScore || 0}
                    </span>
                    {request.fromProfile?.location && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-200 rounded-full text-xs">
                        📍 {request.fromProfile.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onAccept(request.id)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium text-sm"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => onDecline(request.id)}
                    className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition font-medium text-sm"
                  >
                    ✕ Decline
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}