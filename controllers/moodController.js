const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Mood = require('../models/mood');
const User = require('../models/user');
const { CanvasRenderService } = require('chartjs-node-canvas');

const JWT_SECRET = process.env.JWT_SECRET;

exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.logMood = async (req, res) => {
  try {
    const { emoji, note } = req.body;
    const moodEntry = await Mood.create({ emoji, note, userId: req.user.userId });
    res.json(moodEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log mood entry' });
  }
};

exports.getMoodEntries = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user.userId });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get mood entries' });
  }
};

exports.updateMood = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji, note } = req.body;
    const updatedMood = await Mood.findOneAndUpdate({ _id: id, userId: req.user.userId }, { emoji, note }, { new: true });
    if (!updatedMood) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }
    res.json(updatedMood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mood entry' });
  }
};

exports.deleteMood = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMood = await Mood.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!deletedMood) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }
    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
};


/* 
In this code, Mood.aggregate is used to perform the aggregation. 
The $match stage filters the mood entries by user ID and date. 
The $group stage groups the entries by emoji and uses $sum to count the number of entries for each emoji and $push to collect all notes for each emoji. 
The $sort stage sorts the results by count in descending order.
*/
exports.getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the user ID from the authenticated user's token
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    // Check if year and month parameters are valid
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Invalid year or month' });
      return;
    }

    // Query the database for all mood entries of the user for the specified month, grouped by emoji
    const moods = await Mood.aggregate([
      { $match: {
          userId,
          createdAt: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month % 12, 1)
          }
        }
      },
      { $group: {
          _id: '$emoji',
          count: { $sum: 1 },
          notes: { $push: '$note' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Check if there are any mood entries for the specified month
    if (moods.length === 0) {
      res.status(404).json({ error: 'No mood entries found for the specified month' });
      return;
    }

    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve monthly summary' });
  }
};

/*
In this code, Mood.aggregate is used to perform the aggregation. 
The $match stage filters the mood entries by user ID. 
The $group stage groups the entries by emoji and date ($year, $month, and $dayOfMonth are used to extract the year, month, and day from the createdAt date), 
and $sum is used to count the number of entries in each group. The $sort stage sorts the results by date.
*/

exports.getEmojiStatistics = async (req, res) => {
  try {
     // Get the user ID from the authenticated user's token
     const userId = req.user.userId;

     // Query the database for all mood entries of the user, grouped by emoji and date
     const stats = await Mood.aggregate([
       { $match: { userId } },
       { $group: {
           _id: {
             emoji: '$emoji',
             year: { $year: '$createdAt' },
             month: { $month: '$createdAt' },
             day: { $dayOfMonth: '$createdAt' },
           },
           count: { $sum: 1 }
         }
       },
       { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
     ]);
 
     res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve emoji statistics' });
  }
};

exports.generateShareLink = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the user ID from the authenticated user's token

    // Generate a random string to use as the unique part of the share link
    const shareId = crypto.randomBytes(16).toString('hex');

    // Find the user in the database and update their 'shareId'
    const user = await User.findOneAndUpdate({ _id: userId }, { shareId }, { new: true });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Construct the share link
    const shareLink = `https://emojimoodtracker.com/moods/share/${shareId}`;

    res.json({ shareLink });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

exports.disableSharing = async (req, res) => {
    try {
      const userId = req.user.userId; // Get the user ID from the authenticated user's token
      
      // Find the user in the database and update the 'sharingEnabled' flag to false
      const user = await User.findOneAndUpdate({ _id: userId }, { sharingEnabled: false }, { new: true });
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      res.json({ message: 'Mood history sharing disabled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to disable mood history sharing' });
    }
  };
 
  /* 
  Mood.aggregate is used to group mood entries by date and calculate the average mood for each day.
  The CanvasRenderService from chartjs-node-canvas is used to render a Chart.js chart as an image. 
  The image is then sent as a response with the content type set to 'image/png'.
  */
exports.getMoodInsights = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the user ID from the authenticated user's token

    // Query the database for all mood entries of the user, grouped by date
    const moods = await Mood.aggregate([
      { $match: { userId } },
      { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          averageMood: { $avg: '$mood' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Prepare the data for Chart.js
    const labels = moods.map(mood => `${mood._id.day}-${mood._id.month}-${mood._id.year}`);
    const data = moods.map(mood => mood.averageMood);

    // Create a Chart.js configuration
    const configuration = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Average Mood',
          data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      }
    };

    // Render the chart using Chart.js and chartjs-node-canvas
    const canvasRenderService = new CanvasRenderService(800, 600);
    const image = await canvasRenderService.renderToBuffer(configuration);

    // Send the image as a response
    res.set('Content-Type', 'image/png');
    res.send(image);  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve mood insights' });
  }
};

exports.getEmojiSuggestions = async (req, res) => {
  try {
    const { note } = req.body;
    let emojiSuggestions = [];
    if (note.includes('happy')) {
      emojiSuggestions.push('😊', '😃', '😄', '😁');
    } else if (note.includes('sad')) {
      emojiSuggestions.push('😢', '😭', '😞', '😔');
    } else if (note.includes('angry')) {
      emojiSuggestions.push('🤬', '😠', '👿', '💢');
    } else if (note.includes('excited')) {
      emojiSuggestions.push('🤩', '🥳', '🎉', '🎊');
    } else {
      emojiSuggestions.push('🤔', '😐', '🤷‍♀️', '🤷‍♂️');
    }
    res.json({ emojiSuggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve emoji suggestions' });
  }
};

exports.getPublicMoodBoard = async (req, res) => {
  try {
    // Query the database for all mood entries, grouped by emoji
    const moods = await Mood.aggregate([
      { $group: {
          _id: '$emoji',
          count: { $sum: 1 },
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve public mood board data' });
  }
};
