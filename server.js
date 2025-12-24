const express = require('express');
const pg = require('pg');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new pg.Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'wordle_db'
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check authentication
const checkAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
};

// Routes

// Home / Registration page
app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/game');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }

    try {
        // Check if user exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // Set session
        req.session.userId = result.rows[0].id;
        req.session.username = result.rows[0].username;

        res.json({ success: true, redirect: '/game' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint (alternative)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({ success: true, redirect: '/game' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// Game page (protected)
app.get('/game', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Dashboard page (protected)
app.get('/dashboard', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API: Get user session info
app.get('/api/session', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ userId: req.session.userId, username: req.session.username });
    } else {
        res.json({ userId: null });
    }
});

// API: Save game result
app.post('/api/game-result', checkAuth, async (req, res) => {
    const { word, score, time, attempts, result } = req.body;
    const userId = req.session.userId;

    try {
        const queryResult = await pool.query(
            'INSERT INTO game_history (user_id, word, score, time_taken, attempts, result) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [userId, word, score, time, attempts, result]
        );
        res.json({ success: true, gameId: queryResult.rows[0].id });
    } catch (err) {
        console.error('Save game error:', err);
        res.status(500).json({ error: 'Failed to save game' });
    }
});

// API: Get user stats
app.get('/api/stats', checkAuth, async (req, res) => {
    const userId = req.session.userId;

    try {
        // Get game history
        const history = await pool.query(
            'SELECT * FROM game_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
            [userId]
        );

        // Get stats
        const stats = await pool.query(
            `SELECT 
                COUNT(*) as total_games,
                SUM(CASE WHEN result = 'won' THEN 1 ELSE 0 END) as wins,
                AVG(score) as avg_score,
                MAX(score) as best_score,
                AVG(time_taken) as avg_time
            FROM game_history WHERE user_id = $1`,
            [userId]
        );

        // Get top 10 global scores
        const topScores = await pool.query(
            `SELECT u.username, gh.score, gh.created_at, gh.time_taken
            FROM game_history gh
            JOIN users u ON gh.user_id = u.id
            ORDER BY gh.score DESC LIMIT 10`
        );

        res.json({
            history: history.rows,
            stats: stats.rows[0],
            topScores: topScores.rows
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Initialize database
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS game_history (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                word VARCHAR(5) NOT NULL,
                score INT NOT NULL,
                time_taken INT NOT NULL,
                attempts INT NOT NULL,
                result VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Database initialized');
    } catch (err) {
        console.error('Database init error:', err);
    }
}

// Start server
app.listen(PORT, async () => {
    await initDB();
    console.log(`Server running on http://localhost:${PORT}`);
});
