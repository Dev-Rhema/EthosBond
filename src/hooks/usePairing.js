import { useState, useEffect } from 'react';
import { profileDB } from '../services/profileDatabase';

export default function usePairing(currentUserAddress) {
  const [activePairs, setActivePairs] = useState([]);
  const [pastPairs] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Load data on mount and when currentUserAddress changes
  useEffect(() => {
    if (!currentUserAddress) return;

    loadPairingData();
  }, [currentUserAddress]);

  const loadPairingData = async () => {
    if (!currentUserAddress) return;

    try {
      // Load received requests
      const received = await profileDB.getReceivedRequests(currentUserAddress);
      // Populate with full profile data
      const receivedWithProfiles = await Promise.all(
        received.map(async (req) => {
          const fromProfile = await profileDB.getProfileByAddress(req.from_address);
          return {
            ...req,
            fromAddress: req.from_address,
            toAddress: req.to_address,
            fromProfile,
          };
        })
      );
      setReceivedRequests(receivedWithProfiles);

      // Load sent requests
      const sent = await profileDB.getSentRequests(currentUserAddress);
      setSentRequests(sent);

      // Load active pairs
      const pairs = await profileDB.getUserActivePairs(currentUserAddress);
      // Populate with full profile data
      const pairsWithProfiles = await Promise.all(
        pairs.map(async (pair) => {
          const otherAddress = pair.user1_address.toLowerCase() === currentUserAddress.toLowerCase()
            ? pair.user2_address
            : pair.user1_address;
          const otherProfile = await profileDB.getProfileByAddress(otherAddress);
          return {
            ...pair,
            profile: otherProfile,
          };
        })
      );
      setActivePairs(pairsWithProfiles);
    } catch (error) {
      console.error('Error loading pairing data:', error);
    }
  };

  const sendPairRequest = async (toProfile) => {
    try {
      await profileDB.sendPairRequest(currentUserAddress, toProfile);
      await loadPairingData(); // Reload data
      console.log('Sent pair request to:', toProfile.name || toProfile.displayName || toProfile.display_name);
    } catch (error) {
      console.error('Error sending pair request:', error);
    }
  };

  const acceptPairRequest = async (requestId) => {
    try {
      await profileDB.acceptPairRequest(requestId);
      await loadPairingData(); // Reload data
      console.log('Accepted pair request');
    } catch (error) {
      console.error('Error accepting pair request:', error);
    }
  };

  const declinePairRequest = async (requestId) => {
    try {
      await profileDB.declinePairRequest(requestId);
      await loadPairingData(); // Reload data
      console.log('Declined pair request');
    } catch (error) {
      console.error('Error declining pair request:', error);
    }
  };

  const unpair = async (pairId) => {
    try {
      await profileDB.removeActivePair(pairId);
      await loadPairingData(); // Reload data
      console.log('Unpaired successfully');
    } catch (error) {
      console.error('Error unpairing:', error);
    }
  };

  return {
    activePairs,
    pastPairs,
    receivedRequests,
    sentRequests,
    sendPairRequest,
    acceptPairRequest,
    declinePairRequest,
    unpair,
    refreshData: loadPairingData,
  };
}
