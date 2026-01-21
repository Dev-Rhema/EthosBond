# Gender-Based Matching System

## How It Works

The app now uses the "I am..." selection during onboarding to handle all gender-based matching. Users select one option from:

- **Man looking for Woman** 👨‍❤️‍👩
- **Woman looking for Man** 👩‍❤️‍👨
- **Man looking for Man** 👨‍❤️‍👨
- **Woman looking for Woman** 👩‍❤️‍👩
- **Man looking for Everyone** 👨💫
- **Woman looking for Everyone** 👩💫

## Matching Logic

The system ensures **mutual matching**:

1. **Man looking for Woman** → Sees only women who are looking for men OR everyone
2. **Woman looking for Man** → Sees only men who are looking for women OR everyone
3. **Man looking for Man** → Sees only men who are looking for men OR everyone
4. **Woman looking for Woman** → Sees only women who are looking for women OR everyone
5. **Anyone looking for Everyone** → Sees everyone and is visible to everyone

### Examples:

- ✅ Man looking for Woman + Woman looking for Man = **Match** (both see each other)
- ✅ Man looking for Woman + Woman looking for Everyone = **Match** (both see each other)
- ❌ Man looking for Woman + Woman looking for Woman = **No Match** (won't see each other)
- ✅ Man looking for Everyone + Woman looking for Man = **Match** (both see each other)

## Code Implementation

The matching logic is in `src/services/profileDatabase.js` in the `getProfilesForDiscovery()` function:

```javascript
// Extract gender identities and looking-for from preferences
const [currentUserGender, currentUserLookingFor] = currentUserPref.split('-');
const [profileGender, profileLookingFor] = profilePref.split('-');

// Check mutual matching
const currentUserMatchesProfilePreference =
  profileLookingFor === 'everyone' ||
  profileLookingFor === currentUserGender;

const profileMatchesCurrentUserPreference =
  currentUserLookingFor === 'everyone' ||
  currentUserLookingFor === profileGender;

return currentUserMatchesProfilePreference && profileMatchesCurrentUserPreference;
```

## What Was Removed

- The "What are you looking for?" section (relationship types: serious relationship, casual dating, hookup, etc.) has been removed from both the onboarding flow and filter panel
- Users can still filter by interests, location, nationality, and continent
- The `lookingFor` database field is kept for backwards compatibility but no longer used

## Database Field

The gender preference is stored in the `gender_preference` column as:
- `man-woman`
- `woman-man`
- `man-man`
- `woman-woman`
- `man-everyone`
- `woman-everyone`
