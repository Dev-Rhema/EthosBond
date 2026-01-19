import { useState } from "react";
import { motion } from "framer-motion";
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

export default function FilterPanel({ onFilterChange, onClose }) {
  const [filters, setFilters] = useState({
    interests: [],
    location: "",
    nationality: "",
    continent: "",
    lookingFor: [],
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

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);

    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }

    // Show suggestions for nationality and continent as user types
    if (key === "nationality") {
      if (value.length >= 1) {
        // Filter suggestions based on selected continent
        const allSuggestions = getSuggestions(value, "country");

        if (filters.continent && isValidContinent(filters.continent)) {
          // Only show countries from the selected continent
          const filteredSuggestions = allSuggestions.filter((country) =>
            isCountryInContinent(country, filters.continent),
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
      if (filters.nationality) {
        setFilters({ ...filters, [key]: value, nationality: "" });
        setErrors({ ...errors, nationality: "" });
      }
    }
  };

  const validateFilters = () => {
    const newErrors = {
      nationality: "",
      continent: "",
    };

    // Validate continent
    if (filters.continent && !isValidContinent(filters.continent)) {
      newErrors.continent = `"${filters.continent}" is not a valid continent. Please choose from: Africa, Asia, Europe, North America, South America, Oceania, or Antarctica.`;
    }

    // Validate nationality (country)
    if (filters.nationality && !isValidCountry(filters.nationality)) {
      newErrors.nationality = `"${filters.nationality}" is not a valid country.`;
    }

    // Validate that country is in the specified continent
    if (
      filters.nationality &&
      filters.continent &&
      !newErrors.nationality &&
      !newErrors.continent
    ) {
      if (!isCountryInContinent(filters.nationality, filters.continent)) {
        const actualContinent = getContinentForCountry(filters.nationality);
        newErrors.nationality = `"${filters.nationality}" is not in ${filters.continent}. It is in ${actualContinent || "an unknown continent"}.`;
      }
    }

    setErrors(newErrors);
    return !newErrors.nationality && !newErrors.continent;
  };

  const applyFilters = () => {
    if (!validateFilters()) {
      return; // Don't apply if validation fails
    }
    onFilterChange(filters);
    onClose();
  };

  const clearFilters = () => {
    const emptyFilters = {
      interests: [],
      location: "",
      nationality: "",
      continent: "",
      lookingFor: [],
    };
    setFilters(emptyFilters);
    setErrors({ nationality: "", continent: "" });
    setSuggestions({ nationality: [], continent: [] });
    setInterestSearch("");
    onFilterChange(emptyFilters);
  };

  const selectSuggestion = (key, value) => {
    handleChange(key, value);
    setSuggestions({ ...suggestions, [key]: [] });
  };

  const toggleInterest = (interest) => {
    const updated = filters.interests.includes(interest)
      ? filters.interests.filter((i) => i !== interest)
      : [...filters.interests, interest];
    setFilters({ ...filters, interests: updated });
  };

  const toggleLookingFor = (type) => {
    const updated = filters.lookingFor.includes(type)
      ? filters.lookingFor.filter((t) => t !== type)
      : [...filters.lookingFor, type];
    setFilters({ ...filters, lookingFor: updated });
  };

  const filteredInterestList = filterInterests(interestSearch);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl text-gray-800">Filter Profiles</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* What are you looking for? */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are you looking for? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RELATIONSHIP_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleLookingFor(type.id)}
                className={`p-3 rounded-lg border-2 transition text-left ${
                  filters.lookingFor.includes(type.id)
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </div>
                  </div>
                  {filters.lookingFor.includes(type.id) && (
                    <span className="text-purple-500">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g., San Francisco"
            value={filters.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 focus:outline-none hover:border-blue-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Continent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Continent
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Start typing..."
                value={filters.continent}
                onChange={(e) => handleChange("continent", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 focus:outline-none transition ${
                  errors.continent
                    ? "border-red-500"
                    : "border-gray-300 hover:border-blue-500"
                }`}
              />
              {/* Autocomplete suggestions */}
              {suggestions.continent.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.continent.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSuggestion("continent", suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-gray-900 transition text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.continent && (
              <p className="text-pink-500 text-xs mt-1">{errors.continent}</p>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality (Country)
              {!filters.continent && (
                <span className="text-xs text-gray-500 ml-2">
                  (Select continent first)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={
                  filters.continent
                    ? "Start typing..."
                    : "Select continent first"
                }
                value={filters.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
                disabled={
                  !filters.continent || !isValidContinent(filters.continent)
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 focus:outline-none transition ${
                  errors.nationality
                    ? "border-red-500"
                    : "border-gray-300 hover:border-blue-500"
                } ${!filters.continent || !isValidContinent(filters.continent) ? "bg-gray-50 cursor-not-allowed" : ""}`}
              />
              {/* Autocomplete suggestions */}
              {suggestions.nationality.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.nationality.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        selectSuggestion("nationality", suggestion)
                      }
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-gray-900 transition text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.nationality && (
              <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests (Select all that apply)
          </label>

          {/* Search interests */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search interests..."
              value={interestSearch}
              onChange={(e) => setInterestSearch(e.target.value)}
              onFocus={() => setShowInterestDropdown(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 focus:outline-none transition hover:border-blue-500"
            />
            {showInterestDropdown && interestSearch.length >= 1 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredInterestList.map((interest, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      toggleInterest(interest);
                      setInterestSearch("");
                      setShowInterestDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm ${
                      filters.interests.includes(interest)
                        ? "bg-gray-200 text-gray-900 font-medium"
                        : ""
                    }`}
                  >
                    {interest} {filters.interests.includes(interest) && "✓"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected interests */}
          {filters.interests.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {filters.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-300 text-gray-900 rounded-full text-sm flex items-center gap-2"
                  >
                    {interest}
                    <button
                      onClick={() => toggleInterest(interest)}
                      className="hover:text-purple-900"
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
                  filters.interests.includes(interest)
                    ? "bg-gradient-to-r from-blue-700 to-blue-900 text-white"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-white pt-4">
          <button
            onClick={clearFilters}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300 hover:border-gray-400"
          >
            Clear All
          </button>
          <button
            onClick={applyFilters}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg hover:from-blue-800 hover:to-gray-900 transition font-medium"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
