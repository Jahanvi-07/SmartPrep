const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate XP needed for next level (simple static formula: level * 100)
    const nextLevelXp = user.level * 100;

    res.json({
      name: user.name,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lastPracticeDate: user.lastPracticeDate,
      practiceHistory: user.practiceHistory.slice(-10), // return last 10 entries
      nextLevelXp,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Record a practice session and update streak/xp
// @route   POST /api/dashboard/practice
// @access  Private
const recordPractice = async (req, res) => {
  const { score, topic } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = user.streak;
    const gainedXp = 20 + Math.floor((score || 80) / 5); // Base XP + score bonus

    if (user.lastPracticeDate) {
      const lastDate = new Date(user.lastPracticeDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1; // Practiced yesterday! Streak continues
      } else if (diffDays > 1) {
        newStreak = 1; // Missed a day. Streak resets
      } 
      // If diffDays === 0, they already practiced today, keep current streak
    } else {
      newStreak = 1; // First time practice
    }

    // Update user properties
    user.streak = newStreak;
    user.lastPracticeDate = new Date(); // right now
    user.xp += gainedXp;

    // Check level up (level * 100 = required XP)
    const nextLevelXp = user.level * 100;
    if (user.xp >= nextLevelXp) {
      user.level += 1;
      // Optional: carry over remaining xp -> user.xp = user.xp - nextLevelXp
    }

    // Add to history
    user.practiceHistory.push({
      date: new Date(),
      score: score || 85,
      topic: topic || 'General Practice',
    });

    await user.save();

    res.json({
      message: 'Practice recorded!',
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      gainedXp,
      historyLength: user.practiceHistory.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardData,
  recordPractice,
};
