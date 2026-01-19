import { useState } from 'react';
import { motion } from 'framer-motion';
import { ethosService } from '../services/ethosService';
import { profileDB } from '../services/profileDatabase';
import {
  isValidContinent,
  isValidCountry,
  isCountryInContinent,
  getContinentForCountry,
  getSuggestions,
} from '../utils/continentsAndCountries';
import { INTERESTS, RELATIONSHIP_TYPES, filterInterests } from '../utils/filterOptions';

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    ethosAddress: '',
    name: '',
    location: '',
    nationality: '',
    continent: '',
    interests: [],
    lookingFor: [],
    profilePicture: '',
    ethosScore: 0,
  });

  const [errors, setErrors] = useState({
    nationality: '',
    continent: '',
  });

  const [suggestions, setSuggestions] = useState({
    nationality: [],
    continent: [],
  });

  const [interestSearch, setInterestSearch] = useState('');
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);

  const handleEthosSubmit = async () => {
    setLoading(true);
    setError('');

    const isValid = await ethosService.verifyAddress(formData.ethosAddress);

    if (!isValid) {
      setError('Invalid Ethereum address. Please check and try again.');
      setLoading(false);
      return;
    }

    try {
      // Check if profile already exists in database
      const existingProfile = await profileDB.getProfileByAddress(formData.ethosAddress);

      if (existingProfile) {
        // User already has a profile - log them in
        profileDB.setCurrentUser(formData.ethosAddress);
        onComplete(existingProfile);
        return;
      }

      // New user - fetch Ethos data and proceed to profile creation
      const ethosData = await ethosService.getEthosProfile(formData.ethosAddress);
      setFormData({
        ...formData,
        profilePicture: ethosData.profilePicture,
        ethosScore: ethosData.ethosScore,
        name: ethosData.displayName || ethosData.username || '',
      });
      setStep(2);
    } catch (err) {
      setError('Failed to fetch Ethos profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });

    // Clear errors when typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' });
    }

    // Show autocomplete suggestions
    if (key === 'nationality') {
      if (value.length >= 1) {
        // Filter suggestions based on selected continent
        const allSuggestions = getSuggestions(value, 'country');

        if (formData.continent && isValidContinent(formData.continent)) {
          // Only show countries from the selected continent
          const filteredSuggestions = allSuggestions.filter(country =>
            isCountryInContinent(country, formData.continent)
          );
          setSuggestions({ ...suggestions, nationality: filteredSuggestions });
        } else {
          // Show all country suggestions if no continent selected
          setSuggestions({ ...suggestions, nationality: allSuggestions });
        }
      } else {
        setSuggestions({ ...suggestions, nationality: [] });
      }
    } else if (key === 'continent') {
      if (value.length >= 1) {
        setSuggestions({ ...suggestions, continent: getSuggestions(value, 'continent') });
      } else {
        setSuggestions({ ...suggestions, continent: [] });
      }

      // Clear nationality when continent changes
      if (formData.nationality) {
        setFormData({ ...formData, [key]: value, nationality: '' });
        setErrors({ ...errors, nationality: '' });
      }
    }
  };

  const selectSuggestion = (key, value) => {
    handleFieldChange(key, value);
    setSuggestions({ ...suggestions, [key]: [] });
  };

  const toggleInterest = (interest) => {
    const updated = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: updated });
  };

  const toggleLookingFor = (type) => {
    const updated = formData.lookingFor.includes(type)
      ? formData.lookingFor.filter(t => t !== type)
      : [...formData.lookingFor, type];
    setFormData({ ...formData, lookingFor: updated });
  };

  const validateProfile = () => {
    const newErrors = {
      nationality: '',
      continent: '',
    };

    // Validate continent
    if (formData.continent && !isValidContinent(formData.continent)) {
      newErrors.continent = `"${formData.continent}" is not a valid continent.`;
    }

    // Validate nationality
    if (formData.nationality && !isValidCountry(formData.nationality)) {
      newErrors.nationality = `"${formData.nationality}" is not a valid country.`;
    }

    // Validate country is in continent
    if (
      formData.nationality &&
      formData.continent &&
      !newErrors.nationality &&
      !newErrors.continent
    ) {
      if (!isCountryInContinent(formData.nationality, formData.continent)) {
        const actualContinent = getContinentForCountry(formData.nationality);
        newErrors.nationality = `"${formData.nationality}" is not in ${formData.continent}. It is in ${actualContinent}.`;
      }
    }

    setErrors(newErrors);
    return !newErrors.nationality && !newErrors.continent;
  };

  const handleProfileSubmit = async () => {
    if (!formData.name || !formData.location) {
      setError('Please fill in your name and location');
      return;
    }

    if (!validateProfile()) {
      return;
    }

    if (formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    if (formData.lookingFor.length === 0) {
      setError('Please select what you are looking for');
      return;
    }

    setLoading(true);
    const user = {
      ...formData,
      address: formData.ethosAddress,
    };

    // Save profile to database
    try {
      await profileDB.saveProfile(user);
      profileDB.setCurrentUser(user.address);
      onComplete(user);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterestList = filterInterests(interestSearch);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
          Welcome to Ethos Pair
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Reputation-based discovery
        </p>

        {/* Step 1: Ethos Address */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Step 1: Enter Your Ethos Address</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ethos Address (Ethereum)
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={formData.ethosAddress}
                onChange={(e) => setFormData({ ...formData, ethosAddress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              onClick={handleEthosSubmit}
              disabled={loading || !formData.ethosAddress}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </motion.div>
        )}

        {/* Step 2: Profile Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Step 2: Complete Your Profile</h2>

            {/* Preview */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-blue-700 mb-2"
              />
              <span className="text-sm text-gray-600">
                ⭐ Ethos Score: {formData.ethosScore}
              </span>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g., San Francisco"
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Continent & Nationality */}
              <div className="grid grid-cols-2 gap-4">
                {/* Continent */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Continent
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Start typing..."
                      value={formData.continent}
                      onChange={(e) => handleFieldChange('continent', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg bg-gray-700 text-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-transparent placeholder-gray-400 ${
                        errors.continent ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                    {suggestions.continent.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.continent.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectSuggestion('continent', suggestion)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-600 transition text-sm text-gray-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.continent && (
                    <p className="text-red-400 text-xs mt-1">{errors.continent}</p>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nationality
                    {!formData.continent && (
                      <span className="text-xs text-gray-400 ml-2">(Select continent first)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={formData.continent ? "Start typing..." : "Select continent first"}
                      value={formData.nationality}
                      onChange={(e) => handleFieldChange('nationality', e.target.value)}
                      disabled={!formData.continent || !isValidContinent(formData.continent)}
                      className={`w-full px-4 py-2 border rounded-lg bg-gray-700 text-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-transparent placeholder-gray-400 ${
                        errors.nationality ? 'border-red-500' : 'border-gray-600'
                      } ${(!formData.continent || !isValidContinent(formData.continent)) ? 'bg-gray-900 cursor-not-allowed' : ''}`}
                    />
                    {suggestions.nationality.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.nationality.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectSuggestion('nationality', suggestion)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-600 transition text-sm text-gray-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.nationality && (
                    <p className="text-red-400 text-xs mt-1">{errors.nationality}</p>
                  )}
                </div>
              </div>

              {/* What are you looking for? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are you looking for? * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {RELATIONSHIP_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleLookingFor(type.id)}
                      className={`p-3 rounded-lg border-2 transition text-left ${
                        formData.lookingFor.includes(type.id)
                          ? 'border-blue-700 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{type.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm">{type.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                        </div>
                        {formData.lookingFor.includes(type.id) && (
                          <span className="text-blue-700">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests * (Select all that apply)
                </label>

                {/* Search interests */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search interests..."
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    onFocus={() => setShowInterestDropdown(true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {showInterestDropdown && interestSearch.length >= 1 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredInterestList.map((interest, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            toggleInterest(interest);
                            setInterestSearch('');
                            setShowInterestDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm ${
                            formData.interests.includes(interest) ? 'bg-gray-200 text-gray-900 font-medium' : ''
                          }`}
                        >
                          {interest} {formData.interests.includes(interest) && '✓'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected interests */}
                {formData.interests.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-300 text-gray-900 rounded-full text-sm flex items-center gap-2"
                        >
                          {interest}
                          <button
                            onClick={() => toggleInterest(interest)}
                            className="hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular interests quick select */}
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.slice(0, 12).map((interest, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        formData.interests.includes(interest)
                          ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <button
              onClick={handleProfileSubmit}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg hover:from-blue-800 hover:to-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Profile
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
