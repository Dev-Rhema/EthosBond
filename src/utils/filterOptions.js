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

// Relationship types users are looking for
export const RELATIONSHIP_TYPES = [
  {
    id: 'friendship',
    label: 'Friendship',
    icon: '🤝',
    description: 'Looking for new friends and connections'
  },
  {
    id: 'relationship',
    label: 'Romantic Relationship',
    icon: '💕',
    description: 'Seeking a romantic partner'
  },
  {
    id: 'networking',
    label: 'Professional Networking',
    icon: '💼',
    description: 'Building professional connections'
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    icon: '🤝',
    description: 'Looking for project partners or collaborators'
  },
  {
    id: 'mentorship',
    label: 'Mentorship',
    icon: '🎓',
    description: 'Seeking a mentor or willing to mentor others'
  },
  {
    id: 'casual',
    label: 'Casual Hangouts',
    icon: '☕',
    description: 'Just looking to meet people casually'
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
