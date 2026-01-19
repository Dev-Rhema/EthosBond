// Comprehensive list of continents and their countries
export const CONTINENTS_AND_COUNTRIES = {
  Africa: [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros',
    'Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt',
    'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia',
    'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho',
    'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania',
    'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria',
    'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone',
    'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo',
    'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ],
  Asia: [
    'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan',
    'Brunei', 'Cambodia', 'China', 'Cyprus', 'Georgia', 'India', 'Indonesia',
    'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait',
    'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia',
    'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine',
    'Philippines', 'Qatar', 'Russia', 'Saudi Arabia', 'Singapore', 'South Korea',
    'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste',
    'Turkey', 'Turkmenistan', 'United Arab Emirates', 'UAE', 'Uzbekistan',
    'Vietnam', 'Yemen'
  ],
  Europe: [
    'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
    'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
    'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy',
    'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
    'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway',
    'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom',
    'UK', 'Vatican City'
  ],
  'North America': [
    'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica',
    'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala',
    'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Trinidad and Tobago', 'United States', 'USA', 'US'
  ],
  'South America': [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana',
    'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'
  ],
  Oceania: [
    'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru',
    'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands',
    'Tonga', 'Tuvalu', 'Vanuatu'
  ],
  Antarctica: [
    'Antarctica'
  ]
};

// List of valid continents
export const CONTINENTS = Object.keys(CONTINENTS_AND_COUNTRIES);

// Flatten all countries for quick lookup
export const ALL_COUNTRIES = Object.values(CONTINENTS_AND_COUNTRIES).flat();

/**
 * Validates if a continent exists
 * @param {string} continent - The continent to validate
 * @returns {boolean} - True if valid continent
 */
export const isValidContinent = (continent) => {
  if (!continent) return true; // Empty is valid
  const normalized = continent.trim();
  return CONTINENTS.some(c => c.toLowerCase() === normalized.toLowerCase());
};

/**
 * Validates if a country exists
 * @param {string} country - The country to validate
 * @returns {boolean} - True if valid country
 */
export const isValidCountry = (country) => {
  if (!country) return true; // Empty is valid
  const normalized = country.trim();
  return ALL_COUNTRIES.some(c => c.toLowerCase() === normalized.toLowerCase());
};

/**
 * Validates if a country exists in a specific continent
 * @param {string} country - The country to validate
 * @param {string} continent - The continent to check against
 * @returns {boolean} - True if country is in the continent
 */
export const isCountryInContinent = (country, continent) => {
  if (!country || !continent) return true; // Empty is valid

  const normalizedCountry = country.trim();
  const normalizedContinent = continent.trim();

  const continentKey = CONTINENTS.find(c => c.toLowerCase() === normalizedContinent.toLowerCase());
  if (!continentKey) return false;

  const countries = CONTINENTS_AND_COUNTRIES[continentKey];
  return countries.some(c => c.toLowerCase() === normalizedCountry.toLowerCase());
};

/**
 * Gets the continent for a given country
 * @param {string} country - The country to find
 * @returns {string|null} - The continent name or null if not found
 */
export const getContinentForCountry = (country) => {
  if (!country) return null;
  const normalized = country.trim().toLowerCase();

  for (const [continent, countries] of Object.entries(CONTINENTS_AND_COUNTRIES)) {
    if (countries.some(c => c.toLowerCase() === normalized)) {
      return continent;
    }
  }
  return null;
};

/**
 * Get suggestions for a partial continent/country name
 * @param {string} input - The partial input
 * @param {string} type - 'continent' or 'country'
 * @returns {string[]} - Array of suggestions
 */
export const getSuggestions = (input, type = 'country') => {
  if (!input || input.length < 2) return [];

  const normalized = input.trim().toLowerCase();

  if (type === 'continent') {
    return CONTINENTS.filter(c => c.toLowerCase().includes(normalized));
  }

  return ALL_COUNTRIES.filter(c => c.toLowerCase().includes(normalized)).slice(0, 10);
};
