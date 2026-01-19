import { useState } from "react";
import { motion } from "framer-motion";
import { ethosService } from "../services/ethosService";
import { profileDB } from "../services/profileDatabase";
import {
  isValidContinent,
  isValidCountry,
  isCountryInContinent,
  getContinentForCountry,
  getSuggestions,
} from "../utils/continentsAndCountries";
import {
  INTERESTS,
  RELATIONSHIP_TYPES,
  filterInterests,
} from "../utils/filterOptions";

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ethosAddress: "",
    name: "",
    location: "",
    nationality: "",
    continent: "",
    interests: [],
    lookingFor: [],
    profilePicture: "",
    ethosScore: 0,
  });

  const [errors, setErrors] = useState({
    nationality: "",
    continent: "",
  });

  const [suggestions, setSuggestions] = useState({
    nationality: [],
    continent: [],
  });

  const [interestSearch, setInterestSearch] = useState("");
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);

  const handleEthosSubmit = async () => {
    setLoading(true);
    setError("");

    const isValid = await ethosService.verifyAddress(formData.ethosAddress);

    if (!isValid) {
      setError("Invalid Ethereum address. Please check and try again.");
      setLoading(false);
      return;
    }

    try {
      // Check if profile already exists in database
      const existingProfile = await profileDB.getProfileByAddress(
        formData.ethosAddress,
      );

      if (existingProfile) {
        // User already has a profile - log them in
        profileDB.setCurrentUser(formData.ethosAddress);
        onComplete(existingProfile);
        return;
      }

      // New user - fetch Ethos data and proceed to profile creation
      const ethosData = await ethosService.getEthosProfile(
        formData.ethosAddress,
      );
      setFormData({
        ...formData,
        profilePicture: ethosData.profilePicture,
        ethosScore: ethosData.ethosScore,
        name: ethosData.displayName || ethosData.username || "",
      });
      setStep(2);
    } catch (err) {
      setError("Failed to fetch Ethos profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });

    // Clear errors when typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }

    // Show autocomplete suggestions
    if (key === "nationality") {
      if (value.length >= 1) {
        // Filter suggestions based on selected continent
        const allSuggestions = getSuggestions(value, "country");

        if (formData.continent && isValidContinent(formData.continent)) {
          // Only show countries from the selected continent
          const filteredSuggestions = allSuggestions.filter((country) =>
            isCountryInContinent(country, formData.continent),
          );
          setSuggestions({ ...suggestions, nationality: filteredSuggestions });
        } else {
          // Show all country suggestions if no continent selected
          setSuggestions({ ...suggestions, nationality: allSuggestions });
        }
      } else {
        setSuggestions({ ...suggestions, nationality: [] });
      }
    } else if (key === "continent") {
      if (value.length >= 1) {
        setSuggestions({
          ...suggestions,
          continent: getSuggestions(value, "continent"),
        });
      } else {
        setSuggestions({ ...suggestions, continent: [] });
      }

      // Clear nationality when continent changes
      if (formData.nationality) {
        setFormData({ ...formData, [key]: value, nationality: "" });
        setErrors({ ...errors, nationality: "" });
      }
    }
  };

  const selectSuggestion = (key, value) => {
    handleFieldChange(key, value);
    setSuggestions({ ...suggestions, [key]: [] });
  };

  const toggleInterest = (interest) => {
    const updated = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: updated });
  };

  const toggleLookingFor = (type) => {
    const updated = formData.lookingFor.includes(type)
      ? formData.lookingFor.filter((t) => t !== type)
      : [...formData.lookingFor, type];
    setFormData({ ...formData, lookingFor: updated });
  };

  const validateProfile = () => {
    const newErrors = {
      nationality: "",
      continent: "",
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
      setError("Please fill in your name and location");
      return;
    }

    if (!validateProfile()) {
      return;
    }

    if (formData.interests.length === 0) {
      setError("Please select at least one interest");
      return;
    }

    if (formData.lookingFor.length === 0) {
      setError("Please select what you are looking for");
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
      setError("Failed to save profile. Please try again.");
      console.error("Error saving profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterestList = filterInterests(interestSearch);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome to Ethos Bond
          </h1>
          <p className="text-slate-400 text-center text-xs sm:text-sm md:text-base">
            Build meaningful connections through reputation
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-6 sm:mb-8 flex gap-2">
          {[1, 2].map((stepNum) => (
            <div
              key={stepNum}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                stepNum <= step
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                  : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Ethos Address */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-1 sm:mb-2 text-white">
                Step 1 of 2
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Connect your Ethos address to get started
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2 sm:mb-3">
                  Ethos Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={formData.ethosAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, ethosAddress: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm sm:text-base"
                />
                <p className="text-xs text-slate-500 mt-1.5 sm:mt-2">
                  Enter your Ethereum wallet address
                </p>
              </div>

              {error && (
                <div className="p-3 sm:p-4 bg-red-900/20 border border-red-800 rounded-lg sm:rounded-xl">
                  <p className="text-red-400 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleEthosSubmit}
                disabled={loading || !formData.ethosAddress}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50 text-sm sm:text-base"
              >
                {loading ? "Connecting..." : "Continue"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Profile Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-1 sm:mb-2 text-white">
                Step 2 of 2
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Complete your profile to get started
              </p>
            </div>

            {/* Profile Preview */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-center border border-slate-600">
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 rounded-full border-4 border-cyan-500 mx-auto mb-3 sm:mb-4 object-cover shadow-lg"
              />
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
                {formData.name || "Your Name"}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-cyan-400 text-base sm:text-lg">★</span>
                <span className="text-slate-300 text-xs sm:text-sm">
                  Ethos Score:{" "}
                  <span className="font-bold text-cyan-400">
                    {formData.ethosScore}
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2 sm:mb-3">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm sm:text-base"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2 sm:mb-3">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., San Francisco"
                  value={formData.location}
                  onChange={(e) =>
                    handleFieldChange("location", e.target.value)
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm sm:text-base"
                />
              </div>

              {/* Continent & Nationality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Continent */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2 sm:mb-3">
                    Continent
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Start typing..."
                      value={formData.continent}
                      onChange={(e) =>
                        handleFieldChange("continent", e.target.value)
                      }
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500 text-sm sm:text-base ${
                        errors.continent ? "border-red-500" : "border-slate-600"
                      }`}
                    />
                    {suggestions.continent.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.continent.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              selectSuggestion("continent", suggestion)
                            }
                            className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-600 transition text-xs sm:text-sm text-slate-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.continent && (
                    <p className="text-red-400 text-xs mt-1.5 sm:mt-2">
                      {errors.continent}
                    </p>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2 sm:mb-3">
                    Nationality
                    {!formData.continent && (
                      <span className="text-xs text-slate-500 ml-1 sm:ml-2">
                        (Select continent first)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={
                        formData.continent
                          ? "Start typing..."
                          : "Select continent first"
                      }
                      value={formData.nationality}
                      onChange={(e) =>
                        handleFieldChange("nationality", e.target.value)
                      }
                      disabled={
                        !formData.continent ||
                        !isValidContinent(formData.continent)
                      }
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500 text-sm sm:text-base ${
                        errors.nationality
                          ? "border-red-500"
                          : "border-slate-600"
                      } ${!formData.continent || !isValidContinent(formData.continent) ? "bg-slate-800 cursor-not-allowed opacity-50" : ""}`}
                    />
                    {suggestions.nationality.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.nationality.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              selectSuggestion("nationality", suggestion)
                            }
                            className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-600 transition text-xs sm:text-sm text-slate-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.nationality && (
                    <p className="text-red-400 text-xs mt-1.5 sm:mt-2">
                      {errors.nationality}
                    </p>
                  )}
                </div>
              </div>

              {/* What are you looking for? */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4">
                  What are you looking for?{" "}
                  <span className="text-red-400">*</span> (Select all that
                  apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {RELATIONSHIP_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleLookingFor(type.id)}
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition text-left ${
                        formData.lookingFor.includes(type.id)
                          ? "border-cyan-500 bg-slate-700/50"
                          : "border-slate-600 hover:border-cyan-500/50 bg-slate-700/20"
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-lg">{type.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-xs sm:text-sm">
                            {type.label}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {type.description}
                          </div>
                        </div>
                        {formData.lookingFor.includes(type.id) && (
                          <span className="text-cyan-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4">
                  Interests <span className="text-red-400">*</span> (Select all
                  that apply)
                </label>

                {/* Search interests */}
                <div className="relative mb-3 sm:mb-4">
                  <input
                    type="text"
                    placeholder="Search interests..."
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    onFocus={() => setShowInterestDropdown(true)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm sm:text-base"
                  />
                  {showInterestDropdown && interestSearch.length >= 1 && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg sm:rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredInterestList.map((interest, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            toggleInterest(interest);
                            setInterestSearch("");
                            setShowInterestDropdown(false);
                          }}
                          className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-600 transition text-xs sm:text-sm ${
                            formData.interests.includes(interest)
                              ? "bg-slate-600 text-cyan-300 font-medium"
                              : "text-slate-200"
                          }`}
                        >
                          {interest}{" "}
                          {formData.interests.includes(interest) && "✓"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected interests */}
                {formData.interests.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-700 text-cyan-400 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border border-slate-600"
                        >
                          {interest}
                          <button
                            onClick={() => toggleInterest(interest)}
                            className="hover:text-cyan-300"
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
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition ${
                        formData.interests.includes(interest)
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 sm:p-4 bg-red-900/20 border border-red-800 rounded-lg sm:rounded-xl mt-6">
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleProfileSubmit}
              disabled={loading}
              className="w-full mt-6 sm:mt-8 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50 text-sm sm:text-base"
            >
              {loading ? "Creating Profile..." : "Complete Profile"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
