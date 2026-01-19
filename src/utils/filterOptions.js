// Predefined list of interests for users to select from
export const INTERESTS = [
  'Crypto',
  'Web3',
  'DeFi',
  'NFTs',
  'Gaming',
  'Football',
  'Basketball',
  'Soccer',
  'Music',
  'Movies',
  'Books',
  'Art',
  'Design',
  'Photography',
  'Travel',
  'Fitness',
  'Yoga',
  'Cooking',
  'Technology',
  'AI',
  'Blockchain',
  'Entrepreneurship',
  'Business',
  'Investing',
  'Trading',
  'Anime',
  'Manga',
  'K-pop',
  'Fashion',
  'Beauty',
  'Sustainability',
  'Environment',
  'Politics',
  'Science',
  'History',
  'Philosophy',
  'Psychology',
  'Meditation',
  'Spirituality',
  'Volunteering',
  'Charity',
  'Pets',
  'Gardening',
  'DIY',
  'Crafts',
  'Writing',
  'Poetry',
  'Dancing',
  'Theater',
  'Comedy',
  'Podcasts',
  'Hiking',
  'Camping',
  'Cycling',
  'Running',
  'Swimming',
  'Martial Arts',
  'Chess',
  'Board Games',
  'Video Games',
  'Esports',
  'Streaming',
  'Content Creation',
].sort();

// Gender preferences
export const GENDER_PREFERENCES = [
  {
    id: 'man-woman',
    label: 'Man looking for Woman',
    icon: '👨‍❤️‍👩',
  },
  {
    id: 'woman-man',
    label: 'Woman looking for Man',
    icon: '👩‍❤️‍👨',
  },
  {
    id: 'man-man',
    label: 'Man looking for Man',
    icon: '👨‍❤️‍👨',
  },
  {
    id: 'woman-woman',
    label: 'Woman looking for Woman',
    icon: '👩‍❤️‍👩',
  },
  {
    id: 'man-everyone',
    label: 'Man looking for Everyone',
    icon: '👨💫',
  },
  {
    id: 'woman-everyone',
    label: 'Woman looking for Everyone',
    icon: '👩💫',
  },
];

// Relationship types users are looking for
export const RELATIONSHIP_TYPES = [
  {
    id: 'serious-relationship',
    label: 'Serious Relationship',
    icon: '💑',
    description: 'Looking for a long-term committed relationship'
  },
  {
    id: 'casual-dating',
    label: 'Casual Dating',
    icon: '💕',
    description: 'Open to dating without serious commitment'
  },
  {
    id: 'hookup',
    label: 'Hookup',
    icon: '🔥',
    description: 'Seeking casual encounters and fun'
  },
  {
    id: 'friends-with-benefits',
    label: 'Friends with Benefits',
    icon: '😏',
    description: 'Looking for friendship with physical intimacy'
  },
  {
    id: 'open-relationship',
    label: 'Open Relationship',
    icon: '💫',
    description: 'Interested in non-monogamous connections'
  },
  {
    id: 'exploring',
    label: 'Just Exploring',
    icon: '💭',
    description: 'Figuring out what I want'
  },
];

/**
 * Filter interests based on search query
 * @param {string} query - Search query
 * @returns {string[]} - Filtered interests
 */
export const filterInterests = (query) => {
  if (!query || query.length < 2) return INTERESTS;
  const normalized = query.toLowerCase().trim();
  return INTERESTS.filter(interest =>
    interest.toLowerCase().includes(normalized)
  );
};
