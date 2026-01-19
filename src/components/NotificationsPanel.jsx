import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, MessageCircle, Clock } from "lucide-react";

export default function NotificationsPanel({
  bondRequests,
  messageNotifications,
  onAcceptRequest,
  onDeclineRequest,
  onClickBondRequest,
  onClickMessage,
  onClose,
}) {
  const allNotifications = [
    ...bondRequests.map((req) => ({
      type: "bond_request",
      id: req.id,
      data: req,
      timestamp: req.created_at,
    })),
    ...messageNotifications.map((msg) => ({
      type: "message",
      id: msg.id,
      data: msg,
      timestamp: msg.timestamp,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMs = now - then;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-700 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-2xl text-slate-100">Notifications</h3>
              <p className="text-sm text-slate-400 mt-1">
                {allNotifications.length}{" "}
                {allNotifications.length === 1 ? "notification" : "notifications"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          {allNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 text-center">No notifications yet</p>
              <p className="text-slate-500 text-sm text-center mt-2">
                You'll see pair requests and messages here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {allNotifications.map((notification) => {
                  if (notification.type === "bond_request") {
                    const request = notification.data;
                    return (
                      <motion.div
                        key={`bond-${notification.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-cyan-600 transition cursor-pointer"
                        onClick={() => onClickBondRequest(request)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-full bg-cyan-600/20 flex items-center justify-center flex-shrink-0">
                            <UserPlus className="w-5 h-5 text-cyan-400" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={
                                  request.fromProfile?.profilePicture ||
                                  "/default-avatar.png"
                                }
                                alt={
                                  request.fromProfile?.displayName ||
                                  request.fromProfile?.name
                                }
                                className="w-8 h-8 rounded-full object-cover border-2 border-slate-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-200 font-medium text-sm">
                                  <span className="font-semibold">
                                    {request.fromProfile?.displayName ||
                                      request.fromProfile?.name ||
                                      "Someone"}
                                  </span>{" "}
                                  sent you a bond request
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <p className="text-xs text-slate-500">
                                    {formatTimeAgo(notification.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAcceptRequest(request.id);
                                }}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition font-medium text-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeclineRequest(request.id);
                                }}
                                className="flex-1 px-3 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition font-medium text-sm"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  } else if (notification.type === "message") {
                    const msg = notification.data;
                    return (
                      <motion.div
                        key={`msg-${notification.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-blue-600 transition cursor-pointer"
                        onClick={() => onClickMessage(msg)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-5 h-5 text-blue-400" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={msg.senderProfile?.profilePicture || "/default-avatar.png"}
                                alt={msg.senderProfile?.displayName || msg.senderProfile?.name}
                                className="w-8 h-8 rounded-full object-cover border-2 border-slate-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-200 font-medium text-sm">
                                  <span className="font-semibold">
                                    {msg.senderProfile?.displayName ||
                                      msg.senderProfile?.name ||
                                      "Someone"}
                                  </span>{" "}
                                  sent you a message
                                </p>
                                <p className="text-xs text-slate-400 mt-1 truncate">
                                  {msg.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <p className="text-xs text-slate-500">
                                    {formatTimeAgo(notification.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                  return null;
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
