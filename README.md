# Ethos Pair - Reputation-Based Discovery Platform

A dating/networking platform that uses Ethos Network reputation scores for trusted connections.

## Features

- Real Ethos Network integration for reputation verification
- Profile creation with interests, location, and relationship preferences
- Pair request system with accept/decline notifications
- Active pairs management
- Real-time cloud database with Supabase

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Quick steps:**
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL script from `SUPABASE_SETUP.md` in the SQL Editor
4. Get your Project URL and API keys

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual Supabase credentials from Project Settings → API

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How It Works

### Authentication Flow
1. Enter your Ethereum address (Ethos Network)
2. If you have a profile → Auto-login
3. If new user → Create profile with interests and preferences
4. All data is saved to Supabase cloud database

### Pairing System
1. Browse profiles in Discovery feed
2. Send pair requests to users you want to connect with
3. Receive notifications (🔔 bell icon) when others request to pair
4. Accept or decline requests
5. Chat with active pairs

### Database Schema

- **profiles**: User profiles with Ethos data
- **pair_requests**: Pending/accepted/declined pair requests
- **active_pairs**: Currently connected users

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Ethos Network (Ethereum)

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Note**: Never commit your `.env` file to version control!

## Supabase Free Tier

The free tier includes:
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth per month
- 50,000 monthly active users

Perfect for development and small-scale applications!

## Future Enhancements

- [ ] Real-time messaging system
- [ ] Push notifications
- [ ] Profile photo uploads
- [ ] Advanced filtering
- [ ] Ethos score-based matching algorithm
- [ ] Mobile app (React Native)

## License

MIT
