import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Heart, User as UserIcon, ArrowLeft } from "lucide-react";
import OnboardingFlow from "./components/OnboardingFlow";
import ProfileCarousel from "./components/ProfileCarousel";
import MatchesPage from "./components/MatchesPage";
import Chat from "./components/Chat";
import ProfileView from "./components/ProfileView";
import UserProfile from "./components/UserProfile";
import FilterPanel from "./components/FilterPanel";
import ConfirmationModal from "./components/ConfirmationModal";
import NotificationsPanel from "./components/NotificationsPanel";
import useBonding from "./hooks/useBonding";
import { profileDB } from "./services/profileDatabase";
import { messageService } from "./services/messageService";
import "./index.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentView, setCurrentView] = useState("discover"); // discover, bonds
  const [showFilters, setShowFilters] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBond, setSelectedBond] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newMessageNotification, setNewMessageNotification] = useState(null);
  const [bondRequestNotification, setBondRequestNotification] = useState(null);
  const [unbondConfirmation, setUnbondConfirmation] = useState(null);
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [filters, setFilters] = useState({
    interests: [],
    location: "",
    nationality: "",
  });

  const {
    activeBonds,
    receivedRequests,
    sendBondRequest,
    acceptBondRequest,
    declineBondRequest,
    unbond,
    refreshData: refreshBondsData,
  } = useBonding(currentUser?.address);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedAddress = profileDB.getCurrentUser();
      if (savedAddress) {
        // Fetch the full profile from database
        const profile = await profileDB.getProfileByAddress(savedAddress);
        if (profile) {
          setCurrentUser(profile);
        } else {
          // Profile not found, clear the saved address
          profileDB.logout();
        }
      }
      setIsLoadingSession(false);
    };

    restoreSession();
  }, []);

  // Subscribe to real-time messages for notifications
  useEffect(() => {
    if (!currentUser?.address) return;

    const unsubscribe = messageService.subscribeToUserMessages(
      currentUser.address,
      async (newMessage) => {
        // Get sender profile info
        const senderProfile = await profileDB.getProfileByAddress(newMessage.sender_address);

        // Add to message notifications list
        const notification = {
          id: `msg-${Date.now()}`,
          bondId: newMessage.pair_id,
          senderAddress: newMessage.sender_address,
          senderProfile: senderProfile,
          message: newMessage.message,
          timestamp: new Date().toISOString(),
        };

        setMessageNotifications((prev) => [notification, ...prev]);

        // Show toast notification for new message
        setNewMessageNotification({
          bondId: newMessage.pair_id,
          senderAddress: newMessage.sender_address,
          message: newMessage.message,
        });

        // Auto-hide toast after 5 seconds
        setTimeout(() => {
          setNewMessageNotification(null);
        }, 5000);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.address]);

  const handleOnboardingComplete = (user) => {
    setCurrentUser(user);
    setCurrentView("discover");
  };

  const handleBondRequest = (profile) => {
    sendBondRequest(profile);

    // Show success notification toast
    setBondRequestNotification({
      name: profile.displayName || profile.name,
      message: "Bond request sent successfully!"
    });

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setBondRequestNotification(null);
    }, 3000);
  };

  const handleOpenChat = (bond) => {
    setSelectedBond(bond);
    setShowChat(true);
  };

  const handleViewProfile = (profile) => {
    setSelectedProfile(profile);
    setShowProfile(true);
  };

  const handleUnbond = (bond) => {
    setUnbondConfirmation(bond);
  };

  const confirmUnbond = async () => {
    if (unbondConfirmation) {
      unbond(unbondConfirmation.id);
      setUnbondConfirmation(null);
    }
  };

  const handleAcceptRequest = (requestId) => {
    acceptBondRequest(requestId);
  };

  const handleDeclineRequest = (requestId) => {
    declineBondRequest(requestId);
  };

  const handleLogout = () => {
    profileDB.logout();
    setCurrentUser(null);
    setShowUserProfile(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await profileDB.deleteProfile(currentUser.address);
      profileDB.logout();
      setCurrentUser(null);
      setShowUserProfile(false);
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleClickBondRequest = (request) => {
    // Close notifications panel
    setShowNotifications(false);
    // Navigate to bonds page
    setCurrentView("bonds");
  };

  const handleClickMessage = (messageNotif) => {
    // Find the bond for this message
    const bond = activeBonds.find(
      (b) =>
        b.profile.address.toLowerCase() === messageNotif.senderAddress.toLowerCase()
    );

    if (bond) {
      // Close notifications panel
      setShowNotifications(false);
      // Navigate to bonds page
      setCurrentView("bonds");
      // Open chat with this bond
      setTimeout(() => {
        handleOpenChat(bond);
      }, 100);
    }
  };

  // Show loading while checking for saved session
  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading...</div>
      </div>
    );
  }

  // Show onboarding if no user
  if (!currentUser) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 md:pb-0">
      {/* Top Header - Logo and Notification Bell */}
      <nav className="bg-slate-900 sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Back Button - shown when on matches/bonds view */}
            <div className="flex items-center gap-3">
              {currentView === "bonds" && (
                <button
                  onClick={() => setCurrentView("discover")}
                  className="p-2 -ml-2 text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              {/* Logo */}
              <h1 className="text-lg font-semibold text-cyan-400">
                Ethos Bond
              </h1>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-slate-400 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {(receivedRequests.length > 0 || messageNotifications.length > 0) && (
                <span className="absolute top-1 right-1 bg-cyan-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {receivedRequests.length + messageNotifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === "discover" && (
          <ProfileCarousel
            filters={filters}
            currentUser={currentUser}
            onBondRequest={handleBondRequest}
          />
        )}

        {currentView === "bonds" && (
          <MatchesPage
            bonds={activeBonds}
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
            onUnbond={handleUnbond}
            onViewProfile={handleViewProfile}
          />
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            onFilterChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {showNotifications && (
          <NotificationsPanel
            bondRequests={receivedRequests}
            messageNotifications={messageNotifications}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onClickBondRequest={handleClickBondRequest}
            onClickMessage={handleClickMessage}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {showChat && selectedBond && (
          <Chat
            bond={selectedBond}
            currentUser={currentUser}
            onClose={() => {
              setShowChat(false);
              // Refresh bonds to update unread counts after chat closes
              setTimeout(() => {
                refreshBondsData();
              }, 100);
            }}
          />
        )}

        {showProfile && selectedProfile && (
          <ProfileView
            profile={selectedProfile}
            onClose={() => setShowProfile(false)}
          />
        )}

        {showUserProfile && (
          <UserProfile
            user={currentUser}
            onClose={() => setShowUserProfile(false)}
            onLogout={handleLogout}
            onDelete={handleDeleteAccount}
          />
        )}
      </AnimatePresence>

      {/* New Message Notification Toast */}
      <AnimatePresence>
        {newMessageNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-gradient-to-r from-slate-800 to-blue-900 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm z-50 border border-slate-600"
          >
            <p className="font-semibold">New Message</p>
            <p className="text-sm mt-1">{newMessageNotification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bond Request Success Toast */}
      <AnimatePresence>
        {bondRequestNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-20 right-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm z-50 border-2 border-cyan-400"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Success!</p>
                <p className="text-sm mt-1">
                  Bond request sent to {bondRequestNotification.name}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unbond Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!unbondConfirmation}
        title="Unbond Confirmation"
        message={`Are you sure you want to unbond with ${unbondConfirmation?.profile?.displayName || unbondConfirmation?.profile?.name}?`}
        confirmText="Unbond"
        cancelText="Cancel"
        confirmButtonClass="bg-blue-700 hover:bg-blue-800"
        onConfirm={confirmUnbond}
        onCancel={() => setUnbondConfirmation(null)}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
          {/* Discover */}
          <button
            onClick={() => setCurrentView("discover")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              currentView === "discover"
                ? "text-cyan-400"
                : "text-slate-500"
            }`}
          >
            <Compass className="w-6 h-6" />
            <span className="text-xs mt-1">Discover</span>
          </button>

          {/* Bonds */}
          <button
            onClick={() => setCurrentView("bonds")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
              currentView === "bonds"
                ? "text-cyan-400"
                : "text-slate-500"
            }`}
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs mt-1">Bonds</span>
            {activeBonds.some(bond => bond.unreadCount > 0) && (
              <span className="absolute top-2 right-3 bg-cyan-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                •
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => setShowUserProfile(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-slate-500 transition-all"
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
