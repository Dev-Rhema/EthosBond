import { motion } from "framer-motion";

export default function PairButtons({ onPair, onSkip, disabled }) {
  return (
    <div className="flex gap-6 mt-8">
      {/* Skip Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onSkip}
        disabled={disabled}
        className={`w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-lg transition ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100 cursor-pointer"
        }`}
        title="Skip"
      >
        ⏭
      </motion.button>

      {/* Pair Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onPair}
        disabled={disabled}
        className={`w-16 h-16 rounded-full bg-gradient-to-r from-blue-700 to-blue-900 flex items-center justify-center text-3xl text-white shadow-xl transition ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:from-blue-800 hover:to-gray-900 cursor-pointer"
        }`}
        title="Send Pair Request"
      >
        ✅
      </motion.button>
    </div>
  );
}
