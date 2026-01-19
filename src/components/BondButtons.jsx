import { motion } from "framer-motion";
import { SkipForward, UserPlus } from "lucide-react";

export default function BondButtons({ onBond, onSkip, disabled }) {
  return (
    <div className="flex gap-4 sm:gap-6 mt-6 sm:mt-8">
      {/* Skip Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onSkip}
        disabled={disabled}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 shadow-lg transition ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-slate-600 cursor-pointer"
        }`}
        title="Skip"
      >
        <SkipForward className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.button>

      {/* Bond Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onBond}
        disabled={disabled}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xl transition ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:from-cyan-500 hover:to-blue-500 cursor-pointer"
        }`}
        title="Send Bond Request"
      >
        <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.button>
    </div>
  );
}
