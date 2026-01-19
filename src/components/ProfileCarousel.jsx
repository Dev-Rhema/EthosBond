import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileCard from './ProfileCard';
import BondButtons from './BondButtons';
import useCarousel from '../hooks/useCarousel';
import useTimer from '../hooks/useTimer';

export default function ProfileCarousel({ filters, currentUser, onBondRequest }) {
  const { currentProfile, nextProfile, skipProfile } = useCarousel(filters, currentUser?.address);
  const { timeLeft, resetTimer } = useTimer(15);

  const handleBond = () => {
    if (!currentProfile) return;
    onBondRequest(currentProfile);
    nextProfile();
    resetTimer();
  };

  const handleSkip = () => {
    skipProfile();
    nextProfile();
    resetTimer();
  };

  // Auto-advance after 15 seconds
  useEffect(() => {
    if (timeLeft === 0 && currentProfile) {
      handleSkip();
    }
  }, [timeLeft]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      {/* Timer Bar */}
      <div className="w-full max-w-md mb-4 sm:mb-6">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 15) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center text-sm text-slate-300 mt-2 font-medium">
          {timeLeft}s remaining
        </p>
      </div>

      {/* Profile Card */}
      <AnimatePresence mode="wait">
        {currentProfile && (
          <motion.div
            key={currentProfile.address}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileCard profile={currentProfile} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <BondButtons
        onBond={handleBond}
        onSkip={handleSkip}
        disabled={!currentProfile}
      />
    </div>
  );
}
