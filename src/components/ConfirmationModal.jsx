import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-blue-700 hover:bg-blue-800",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
          >
            <div className="bg-gradient-to-r from-gray-800 to-blue-900 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50 border border-gray-300 hover:border-gray-400"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-6 py-2 text-white rounded-lg transition font-medium disabled:opacity-50 ${confirmButtonClass}`}
                >
                  {isLoading ? "..." : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
