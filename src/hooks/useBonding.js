import { useState, useEffect } from 'react';
import { profileDB } from '../services/profileDatabase';

export default function useBonding(currentUserAddress) {
  const [activeBonds, setActiveBonds] = useState([]);
  const [pastBonds] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Load data on mount and when currentUserAddress changes
  useEffect(() => {
    if (!currentUserAddress) return;

    loadBondingData();
  }, [currentUserAddress]);

  const loadBondingData = async () => {
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

      // Load active bonds
      const bonds = await profileDB.getUserActivePairs(currentUserAddress);
      // Populate with full profile data
      const bondsWithProfiles = await Promise.all(
        bonds.map(async (bond) => {
          const otherAddress = bond.user1_address.toLowerCase() === currentUserAddress.toLowerCase()
            ? bond.user2_address
            : bond.user1_address;
          const otherProfile = await profileDB.getProfileByAddress(otherAddress);
          return {
            ...bond,
            profile: otherProfile,
          };
        })
      );
      setActiveBonds(bondsWithProfiles);
    } catch (error) {
      console.error('Error loading bonding data:', error);
    }
  };

  const sendBondRequest = async (toProfile) => {
    try {
      await profileDB.sendPairRequest(currentUserAddress, toProfile);
      await loadBondingData(); // Reload data
      console.log('Sent bond request to:', toProfile.name || toProfile.displayName || toProfile.display_name);
    } catch (error) {
      console.error('Error sending bond request:', error);
    }
  };

  const acceptBondRequest = async (requestId) => {
    try {
      await profileDB.acceptPairRequest(requestId);
      await loadBondingData(); // Reload data
      console.log('Accepted bond request');
    } catch (error) {
      console.error('Error accepting bond request:', error);
    }
  };

  const declineBondRequest = async (requestId) => {
    try {
      await profileDB.declinePairRequest(requestId);
      await loadBondingData(); // Reload data
      console.log('Declined bond request');
    } catch (error) {
      console.error('Error declining bond request:', error);
    }
  };

  const unbond = async (bondId) => {
    try {
      await profileDB.removeActivePair(bondId);
      await loadBondingData(); // Reload data
      console.log('Unbonded successfully');
    } catch (error) {
      console.error('Error unbonding:', error);
    }
  };

  return {
    activeBonds,
    pastBonds,
    receivedRequests,
    sentRequests,
    sendBondRequest,
    acceptBondRequest,
    declineBondRequest,
    unbond,
    refreshData: loadBondingData,
  };
}
