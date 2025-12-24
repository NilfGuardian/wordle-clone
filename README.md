# Wordle Clone - Full Stack Game

A fully-featured Wordle-inspired game with user authentication, game history tracking, and a professional dashboard with leaderboards and statistics.

## Features

✅ **User Registration & Authentication** - Secure signup with bcrypt password hashing
✅ **Wordle Game** - Classic 5-letter word guessing with 6 attempts
✅ **Game History** - Track all your games with scores and results
✅ **Dashboard** - View personal stats, win rate, best scores, and game history
✅ **Leaderboard** - Top 10 global scores with visual ranking
✅ **Statistics** - Average score, time taken, win/loss analytics
✅ **Professional Animations** - Smooth flip reveals, shake feedback, fade-ins
✅ **Responsive Design** - Works seamlessly on desktop and mobile
✅ **Dark Theme** - Eye-friendly dark UI with green accents

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla + Chart.js)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Authentication**: bcrypt + Express Sessions
- **Animations**: Animate.css + Custom CSS animations

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/wordle-clone.git
cd wordle-clone
```

### Step 2: Install PostgreSQL

**On Windows:**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Note the password you set for the `postgres` user
4. Accept default port 5432

**On macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**On Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Step 3: Create Database

Open PostgreSQL command line:

**Windows:**
```bash
psql -U postgres
```

**macOS/Linux:**
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE wordle_db;
\q
```

### Step 4: Install Node Dependencies

```bash
npm install
```

### Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wordle_db
PORT=3000
SESSION_SECRET=your-secret-key-change-this
```

**Important:** Replace `your_postgres_password` with the password you set during PostgreSQL installation.

### Step 6: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

1. **Register** - Go to the home page and create an account
2. **Play** - Guess the 5-letter word in 6 tries
   - Green = correct letter, correct position
   - Yellow = correct letter, wrong position
   - Grey = letter not in word
3. **View Dashboard** - Click the "Dashboard" button to see your stats
4. **Check Leaderboard** - See top 10 global scores on the dashboard

## File Structure

```
wordle-clone/
├── server.js              # Express server & routes
├── package.json          # Dependencies
├── .env                  # Environment variables
├── public/               # Frontend files
│   ├── index.html        # Home/Registration page
│   ├── game.html         # Game page
│   ├── dashboard.html    # Stats & leaderboard page
│   └── words.js          # Word list
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login (alternative to registration)
- `POST /api/logout` - Logout
- `GET /api/session` - Get current session info

### Game
- `POST /api/game-result` - Save game result
- `GET /api/stats` - Get user stats and leaderboard

### Pages
- `GET /` - Home/Registration page
- `GET /game` - Game page (requires auth)
- `GET /dashboard` - Dashboard page (requires auth)

## Database Schema

### users table
```sql
- id (PRIMARY KEY)
- username (VARCHAR)
- email (UNIQUE)
- password (HASHED)
- created_at (TIMESTAMP)
```

### game_history table
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- word (VARCHAR 5)
- score (INT)
- time_taken (INT - seconds)
- attempts (INT)
- result (VARCHAR - 'won' or 'lost')
- created_at (TIMESTAMP)
```

## Scoring System

- **Win**: 100 - (attempts × 15) points
  - 6 attempts = 10 points
  - 1 attempt = 85 points
- **Loss**: 0 points

## Troubleshooting

**"Cannot connect to database"**
- Ensure PostgreSQL is running
- Check `.env` file for correct credentials
- Verify database `wordle_db` exists

**"Port 3000 already in use"**
- Change `PORT` in `.env` to an unused port
- Or kill the process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)

**"Module not found"**
- Run `npm install` to ensure all dependencies are installed

**Authentication redirect loop**
- Clear browser cookies
- Restart the server

## Development

To run in development mode with auto-reload:

```bash
npm run dev
```

(Requires `nodemon` - installed with dev dependencies)

## Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku account and app
3. Add PostgreSQL add-on to Heroku app
4. Set environment variables in Heroku settings
5. Deploy:

```bash
git push heroku main
```

### Deploy to Other Platforms

Update the database connection string to your provider's PostgreSQL instance and set environment variables accordingly.

## Future Enhancements

- 🎨 Multiplayer mode
- 📱 Mobile app (React Native)
- 🎮 Difficulty levels
- 🌍 Multiple languages
- 🏆 Seasonal leaderboards
- 🔊 Sound effects
- 📊 Advanced analytics

## License

MIT License - feel free to use and modify for personal or commercial projects.

## Contributing

Pull requests are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy Guessing! 🎮**
