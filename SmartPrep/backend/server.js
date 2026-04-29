const express = require('express');
const dotenv = require('dotenv');

// Load env vars FIRST
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const generatorRoutes = require('./routes/generatorRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const notesRoutes = require('./routes/notesRoutes');
const chatRoutes = require('./routes/chatRoutes');
const compilerRoutes = require('./routes/compilerRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/generator', generatorRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/compiler', compilerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
