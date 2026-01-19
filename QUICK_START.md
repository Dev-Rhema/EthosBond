# 🚀 Quick Start Guide - Ethos Pair

Get up and running in 5 minutes!

## ⚡ Installation

```bash
# 1. Navigate to project
cd ethos-pair

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open browser
# Visit: http://localhost:5173
```

---

## 🎯 First Time Setup

### Step 1: Onboarding
1. Enter any Ethereum-style address (e.g., `0x1234567890123456789012345678901234567890`)
2. Fill in your profile:
   - **Name**: Your display name
   - **Location**: City or region
   - **Nationality**: Your country
   - **Interests**: Comma-separated (e.g., `Web3, Gaming, Music`)

### Step 2: Discovery
1. View profiles one at a time (15-second timer)
2. Click **✅ Pair** to send a connection request
3. Click **⏭ Skip** to see the next profile
4. Use **🔧 Filters** to narrow down matches

### Step 3: Connect
1. Go to **👥 Pairs** tab
2. View your **Active Pairs**
3. Click **Chat** to message
4. Click **Profile** to view full details
5. Click **Unpair** to end connection (moves to Past Pairs)

---

## 🎨 Demo Mode (Default)

The app runs in **demo mode** with mock data by default:
- ✅ No backend needed
- ✅ No database setup
- ✅ Perfect for testing & hackathons
- ✅ Works immediately after `npm install`

### Mock Users
8 pre-loaded users with different:
- Locations (San Francisco, Tokyo, London, etc.)
- Interests (Web3, Gaming, DeFi, Art, etc.)
- Ethos scores (700-900)

---

## 🔧 Optional: Connect to Supabase

Want persistence? Follow these steps:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project (free tier)
3. Wait for database to provision (~2 mins)

### 2. Run Schema
1. Open Supabase SQL Editor
2. Copy contents from `SUPABASE_SCHEMA.sql`
3. Run the SQL

### 3. Add Credentials
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

---

## 📱 Using the App

### Discover Page
- **Timer**: 15 seconds per profile
- **Buttons**:
  - ✅ = Send pair request
  - ⏭ = Skip to next
- **Filters**: Click 🔧 to filter by location/nationality/interests

### Pairs Page
- **Active Pairs**: Current connections (can chat)
- **Past Pairs**: Previous connections (view-only)

### Chat
- Only available for active pairs
- Real-time in Supabase mode
- Mock messages in demo mode

---

## 🎯 Tips for Hackathons

1. **Demo Mode is Perfect**
   - No setup time wasted
   - Focus on frontend polish
   - Add your own mock users in `src/services/mockData.js`

2. **Customize Quickly**
   - Change colors in `tailwind.config.js`
   - Adjust timer in `ProfileCarousel.jsx`
   - Add interests in mock data

3. **Show, Don't Tell**
   - Create 2 browser windows
   - Simulate two users pairing
   - Demo the chat feature live

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

**Module not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Changes not showing?**
```bash
# Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

---

## 📦 Build for Production

```bash
npm run build
```

Output goes to `dist/` folder - ready to deploy!

---

## 🚀 Deploy Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
1. Drag `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Done!

---

**Questions?** Check the main `README.md` or review the code comments! 🎉
