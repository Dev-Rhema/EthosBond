import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  isValidContinent,
  isValidCountry,
  isCountryInContinent,
  getContinentForCountry,
  getSuggestions,
} from "../utils/continentsAndCountries";
import {
  INTERESTS,
  GENDER_PREFERENCES,
  ETHOS_VISIBILITY_LEVELS,
  filterInterests,
} from "../utils/filterOptions";

export default function EditProfileModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.description || "",
    genderPreference: user.genderPreference || "",
    location: user.location || "",
    nationality: user.nationality || "",
    continent: user.continent || "",
    interests: user.interests || [],
    minVisibleToEthosScore: user.minVisibleToEthosScore || 0,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });

    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }

    // Handle suggestions for nationality and continent
    if (key === "nationality") {
      if (value.length >= 1) {
        const allSuggestions = getSuggestions(value, "country");
        if (formData.continent && isValidContinent(formData.continent)) {
          const filteredSuggestions = allSuggestions.filter((country) =>
            isCountryInContinent(country, formData.continent),
          );
          setSuggestions({ ...suggestions, nationality: filteredSuggestions });
        } else {
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

  const validateProfile = () => {
    const newErrors = {
      nationality: "",
      continent: "",
    };

    if (formData.continent && !isValidContinent(formData.continent)) {
      newErrors.continent = `"${formData.continent}" is not a valid continent.`;
    }

    if (formData.nationality && !isValidCountry(formData.nationality)) {
      newErrors.nationality = `"${formData.nationality}" is not a valid country.`;
    }

    if (
      formData.nationality &&
      formData.continent &&
      !newErrors.nationality &&
      !newErrors.continent
    ) {
      if (!isCountryInContinent(formData.nationality, formData.continent)) {
        const actualContinent = getContinentForCountry(formData.nationality);
        newErrors.nationality = `"${formData.nationality}" is not in ${formData.continent}. It is in ${actualContinent || "an unknown continent"}.`;
      }
    }

    setErrors(newErrors);
    return !newErrors.nationality && !newErrors.continent;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.location) {
      setError("Please fill in your name and location");
      return;
    }

    if (!formData.genderPreference) {
      setError("Please select your gender preference");
      return;
    }

    if (!validateProfile()) {
      return;
    }

    if (formData.interests.length === 0) {
      setError("Please select at least one interest");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave({
        ...user,
        ...formData,
        description: formData.bio,
        displayName: formData.name,
      });
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      setLoading(false);
    }
  };

  const filteredInterestList = filterInterests(interestSearch);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Bio
            </label>
            <textarea
              placeholder="More about yourself"
              value={formData.bio}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
              rows="3"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              I am... <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GENDER_PREFERENCES.map((pref) => (
                <button
                  key={pref.id}
                  onClick={() => handleFieldChange("genderPreference", pref.id)}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    formData.genderPreference === pref.id
                      ? "border-cyan-500 bg-slate-700/50"
                      : "border-slate-600 hover:border-cyan-500/50 bg-slate-700/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{pref.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">
                        {pref.label}
                      </div>
                    </div>
                    {formData.genderPreference === pref.id && (
                      <span className="text-cyan-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., San Francisco"
              value={formData.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            />
          </div>

          {/* Continent & Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Continent */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Continent
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Start typing..."
                  value={formData.continent}
                  onChange={(e) => handleFieldChange("continent", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500 ${
                    errors.continent ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {suggestions.continent.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                    {suggestions.continent.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion("continent", suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-600 transition text-sm text-slate-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.continent && (
                <p className="text-red-400 text-xs mt-2">{errors.continent}</p>
              )}
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nationality (Country)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Start typing..."
                  value={formData.nationality}
                  onChange={(e) => handleFieldChange("nationality", e.target.value)}
                  disabled={!formData.continent || !isValidContinent(formData.continent)}
                  className={`w-full px-4 py-3 border rounded-xl bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500 ${
                    errors.nationality ? "border-red-500" : "border-slate-600"
                  } ${!formData.continent || !isValidContinent(formData.continent) ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {suggestions.nationality.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                    {suggestions.nationality.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion("nationality", suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-600 transition text-sm text-slate-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.nationality && (
                <p className="text-red-400 text-xs mt-2">{errors.nationality}</p>
              )}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Interests <span className="text-red-400">*</span>
            </label>

            {/* Search interests */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search interests..."
                value={interestSearch}
                onChange={(e) => setInterestSearch(e.target.value)}
                onFocus={() => setShowInterestDropdown(true)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              />
              {showInterestDropdown && interestSearch.length >= 1 && (
                <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredInterestList.map((interest, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        toggleInterest(interest);
                        setInterestSearch("");
                        setShowInterestDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-600 transition text-sm ${
                        formData.interests.includes(interest)
                          ? "bg-slate-600 text-cyan-300 font-medium"
                          : "text-slate-200"
                      }`}
                    >
                      {interest} {formData.interests.includes(interest) && "✓"}
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
                      className="px-3 py-1.5 bg-slate-700 text-cyan-400 rounded-full text-sm flex items-center gap-2 border border-slate-600"
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

            {/* Popular interests */}
            <div className="flex flex-wrap gap-2">
              {INTERESTS.slice(0, 12).map((interest, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-2 rounded-full text-sm transition ${
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

          {/* Profile Visibility */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Profile Visibility <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Choose minimum Ethos score required for others to see your profile
            </p>
            <div className="grid grid-cols-1 gap-2">
              {ETHOS_VISIBILITY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleFieldChange("minVisibleToEthosScore", level.minScore)}
                  className={`p-3 rounded-xl border-2 transition text-left ${
                    formData.minVisibleToEthosScore === level.minScore
                      ? "border-cyan-500 bg-slate-700/50"
                      : "border-slate-600 hover:border-cyan-500/50 bg-slate-700/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">
                        {level.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {level.description}
                      </div>
                    </div>
                    {formData.minVisibleToEthosScore === level.minScore && (
                      <span className="text-cyan-400 ml-2">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition font-medium border border-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50 font-medium"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
