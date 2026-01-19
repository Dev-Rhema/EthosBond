import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OnboardingFlow from "./components/OnboardingFlow";
import ProfileCarousel from "./components/ProfileCarousel";
import ActivePairsList from "./components/ActivePairsList";
import PastPairsList from "./components/PastPairsList";
import Chat from "./components/Chat";
import ProfileView from "./components/ProfileView";
import UserProfile from "./components/UserProfile";
import FilterPanel from "./components/FilterPanel";
import ConfirmationModal from "./components/ConfirmationModal";
import PairRequestNotifications from "./components/PairRequestNotifications";
import usePairing from "./hooks/usePairing";
import { profileDB } from "./services/profileDatabase";
import { messageService } from "./services/messageService";
import "./index.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentView, setCurrentView] = useState("discover"); // discover, pairs
  const [showFilters, setShowFilters] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPair, setSelectedPair] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessageNotification, setNewMessageNotification] = useState(null);
  const [unpairConfirmation, setUnpairConfirmation] = useState(null);
  const [filters, setFilters] = useState({
    interests: [],
    location: "",
    nationality: "",
  });

  const {
    activePairs,
    pastPairs,
    receivedRequests,
    sendPairRequest,
    acceptPairRequest,
    declinePairRequest,
    unpair,
  } = usePairing(currentUser?.address);

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
      (newMessage) => {
        // Show notification for new message
        setNewMessageNotification({
          pairId: newMessage.pair_id,
          senderAddress: newMessage.sender_address,
          message: newMessage.message,
        });

        // Auto-hide notification after 5 seconds
        const timeout = setTimeout(() => {
          setNewMessageNotification(null);
        }, 5000);

        return () => clearTimeout(timeout);
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

  const handlePairRequest = (profile) => {
    sendPairRequest(profile);
    // Show success notification (could add toast here)
    console.log("Pair request sent to:", profile.name);
  };

  const handleOpenChat = (pair) => {
    setSelectedPair(pair);
    setShowChat(true);
  };

  const handleViewProfile = (profile) => {
    setSelectedProfile(profile);
    setShowProfile(true);
  };

  const handleUnpair = (pair) => {
    setUnpairConfirmation(pair);
  };

  const confirmUnpair = async () => {
    if (unpairConfirmation) {
      unpair(unpairConfirmation.id);
      setUnpairConfirmation(null);
    }
  };

  const handleAcceptRequest = (requestId) => {
    acceptPairRequest(requestId);
  };

  const handleDeclineRequest = (requestId) => {
    declinePairRequest(requestId);
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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
              Ethos Pair
            </h1>

            <div className="flex gap-4 items-center">
              <button
                onClick={() => setCurrentView("discover")}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === "discover"
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                🔍 Discover
              </button>
              <button
                onClick={() => setCurrentView("pairs")}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === "pairs"
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                👥 Pairs ({activePairs.length})
              </button>
              {currentView === "discover" && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition"
                >
                  🔧 Filters
                </button>
              )}
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition"
              >
                🔔
                {receivedRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {receivedRequests.length}
                  </span>
                )}
              </button>
              {/* User Profile Icon */}
              <button
                onClick={() => setShowUserProfile(true)}
                className="p-1 rounded-full hover:ring-2 hover:ring-gray-600 transition"
              >
                <img
                  src={currentUser.profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === "discover" && (
          <ProfileCarousel
            filters={filters}
            currentUser={currentUser}
            onPairRequest={handlePairRequest}
          />
        )}

        {currentView === "pairs" && (
          <div className="max-w-4xl mx-auto">
            <ActivePairsList
              pairs={activePairs}
              currentUser={currentUser}
              onOpenChat={handleOpenChat}
              onUnpair={handleUnpair}
              onViewProfile={handleViewProfile}
            />
            <PastPairsList
              pastPairs={pastPairs}
              currentUser={currentUser}
              onViewProfile={handleViewProfile}
              onPairRequest={handlePairRequest}
            />
          </div>
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
          <PairRequestNotifications
            requests={receivedRequests}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {showChat && selectedPair && (
          <Chat
            pair={selectedPair}
            currentUser={currentUser}
            onClose={() => setShowChat(false)}
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
            className="fixed top-4 right-4 bg-gradient-to-r from-gray-800 to-blue-900 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm z-40"
          >
            <p className="font-semibold">New Message</p>
            <p className="text-sm mt-1">{newMessageNotification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unpair Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!unpairConfirmation}
        title="Unpair Confirmation"
        message={`Are you sure you want to unpair with ${unpairConfirmation?.profile?.displayName || unpairConfirmation?.profile?.name}?`}
        confirmText="Unpair"
        cancelText="Cancel"
        confirmButtonClass="bg-blue-700 hover:bg-blue-800"
        onConfirm={confirmUnpair}
        onCancel={() => setUnpairConfirmation(null)}
      />
    </div>
  );
}

export default App;
