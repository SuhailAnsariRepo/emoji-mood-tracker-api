const Mood = require('../models/mood');
const User = require('../models/user');
const { ErrorHandler } = require('../middleware/authenticate');
const emojiRegex = require('emoji-regex');
const accessTokenSecret = process.env.JWT_SECRET || "secret";
const jwt = require('jsonwebtoken');

const moodSuggestions = {
    happy: '😄',
    sad: '😢',
    love: '❤️',
    excited: '🎉',
    happy: '😄',
    sad: '😢',
    love: '❤️',
    excited: '🎉',
    anger: '😡',
    surprise: '😲',
    cool: '😎',
    laughing: '😂',
    thumbsUp: '👍',
    thumbsDown: '👎',
    heartEyes: '😍',
    crying: '😭',
    sleeping: '😴',
    peace: '✌️',
    celebration: '🥳',
    thinking: '🤔',
    dancing: '💃',
    grinning: '😁',
    confused: '😕',
    nerd: '🤓',
    zippedMouth: '🤐',
    rainbow: '🌈',
    clown: '🤡',
    money: '💰',
    rocket: '🚀',
    fire: '🔥',
    heart: '❤️',
    star: '⭐',
    sun: '☀️',
    moon: '🌙',
    party: '🎉',
    thumbsUp2: '👍🏼',
    thumbsDown2: '👎🏼',
};

const containsOnlyEmoji = (text) => {
    const characters = [...text];

    const emojiPattern = emojiRegex();

    for (const character of characters) {
        if (!emojiPattern.test(character)) {
            return false;
        }
    }

    return true;
};
const add = async (req, res, next) => {
    try {
        const user = req.user;
        let { emoji, note } = req.body;
        if (!emoji || !note) {
            return res.status(400).json('Missing required field(s). Please provide all required data.');
        }

        if (!containsOnlyEmoji(emoji)) {
            return res.status(400).json('Invalid emoji, it should consist of only one valid emoji character.');
        }

        let mood = new Mood({
            ...req.body,
            userId: user._id
        });
        mood = await mood.save();

        return res.json(mood);
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

const update = async (req, res, next) => {
    try {
        const user = req.user;
        let { emoji, note } = req.body;
        if (!emoji && !note) {
            return res.status(400).json('Missing required field(s). Please provide all required data.');
        }

        if (emoji) {
            if (!containsOnlyEmoji(emoji)) {
                return res.status(400).json('Invalid emoji, it should consist of only one valid emoji character.');
            }
        }

        if (!req.params.id) {
            return res.status(400).json('Missing required field(s). Please provide all required data.');
        }

        let mood = await Mood.findOne({ "_id": req.params.id, userId: user._id });
        if (!mood) {
            return res.status(400).json("Invalid id, or you don't have access to modify this.");
        }

        if (emoji) {
            mood.emoji = emoji;
        }

        if (note) {
            mood.note = note;
        }

        mode = await mood.save();
        return res.json(mood);
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

const deleteMood = async (req, res, next) => {
    try {
        const user = req.user;
        if (!req.params.id) {
            return res.status(400).json('Missing required field(s). Please provide all required data.');
        }

        let mood = await Mood.findOne({ "_id": req.params.id, userId: user._id });
        if (!mood) {
            return res.status(400).json("Invalid id, or you don't have access to modify this.");
        }

        await Mood.deleteOne({ _id: req.params.id });
        return res.json('Mood entry deleted successfully.');
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

const getMonthlySummary = async (req, res, next) => {
    try {
        const userId = req.user._id;

        if (!req.query.month || !req.query.year) {
            return res.status(400).json('Missing required query field(s). Please provide all required data.');
        }

        const month = Number(req.query.month);
        const year = Number(req.query.year);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const monthlyMoods = await Mood.find({
            userId,
            timestamp: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        const emojiSummary = {};
        const noteSummary = [];

        monthlyMoods.forEach((mood) => {
            if (emojiSummary[mood.emoji]) {
                emojiSummary[mood.emoji]++;
            } else {
                emojiSummary[mood.emoji] = 1;
            }
            noteSummary.push(mood.note);
        });

        return res.json({
            emojiSummary,
            noteSummary,
            monthlyMoods,
        });
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

const getByFilter = async (req, res, next) => {
    try {
        const userId = req.user._id;
        let query = { userId };
        let order = -1;
        if (req.query.chronologicalOrder === "true") {
            order = 1;
        }

        if (req.query.startDate || req.query.endDate) {
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);

            if ((!startDate instanceof Date || isNaN(startDate)) || (!endDate instanceof Date || isNaN(endDate))) {
                return res.status(400).json('Invalid date range.');
            }
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            query.timestamp = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        const data = await Mood.find(query).sort({ timestamp: order });
        return res.json(data);
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

const share = async (req, res, next) => {
    try {
        let user = req.user;
        user = user.toObject();
        delete user.password;

        let accessToken = jwt.sign(user, accessTokenSecret);

        return res.json({
            link: `${req.protocol}://${req.get('host')}/mood/share/${accessToken}`
        });
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

const shareData = async (req, res, next) => {
    try {
        let jwtPayload = await jwt.verify(req.params.token, accessTokenSecret);
        if (!jwtPayload || !jwtPayload.username) {
            throw Error;
        }

        let user = await User.findOne({ username: jwtPayload.username });
        if (!user) {
            throw Error;
        }

        if (!user.sharingEnabled) {
            return res.status(403).json('User has disabled sharing.');
        }

        const data = await Mood.find({ userId: user._id });
        return res.json(data);
    } catch (error) {
        return res.status(400).json('Invalid url.');
    }
};

const suggestEmojis = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { moodNote } = req.body;
        if (!moodNote) {
            return res.status(400).json('Missing required field(s). Please provide all required data.');
        }
        const suggestions = { ...moodSuggestions };

        const recentMoods = await Mood.find({ userId })
            .sort({ timestamp: -1 }) // Sort in descending order by timestamp
            .limit(10); // Limit to the last 10 records

        // Extract mood keywords and emojis from the recent mood records
        recentMoods.forEach((mood) => {
            suggestions[mood.note] = mood.emoji;
        });

        let suggestedEmojis = [];

        // Loop through mood keywords and check if they are present in the mood note
        for (const keyword in suggestions) {
            if (keyword.toLowerCase().includes(moodNote.toLowerCase())) {
                suggestedEmojis.push(suggestions[keyword]);
            }
        }

        res.json({ emojis: suggestedEmojis });
    } catch (error) {
        return ErrorHandler(req, res, next, error);
    }
};

const getEmojiStatistics = async (req, res, next) => {
  try {
      const emojiStatisticsData = await Mood.aggregate([
          {
              $group: {
                  _id: '$emoji',
                  count: { $sum: 1 }, // Count occurrences of each emoji
              },
          },
          {
              $project: {
                  _id: 0, // Exclude the _id field from the result
                  emoji: '$_id', // Rename _id to emoji
                  count: 1, // Include the count field
              },
          },
      ]).exec();

      return res.json(emojiStatisticsData);
  } catch (error) {
      return ErrorHandler(req, res, next, error);
  }
};

const getMoodTrends = async (req, res, next) => {
  try {
      // Get mood trends data
      const moodTrends = await Mood.aggregate([
          {
              $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                  count: { $sum: 1 },
              },
          },
          { $sort: { _id: 1 } }, // Sort by date in ascending order
      ]);

      // Extract dates and mood counts from the result
      const dates = moodTrends.map((trend) => trend._id);
      const moodCounts = moodTrends.map((trend) => trend.count);

      res.json({ dates, moodCounts });
  } catch (error) {
      return ErrorHandler(req, res, next, error);
  }
};

const getPublicMoodBoardData = async (req, res, next) => {
  try {
      const moodData = await Mood.find();

      const formattedData = moodData.map((entry) => ({
          emoji: entry.emoji,
          note: entry.note,
          timestamp: entry.timestamp,
      }));

      res.json(formattedData);
  } catch (error) {
      return ErrorHandler(req, res, next, error);
  }
};

module.exports = {
    add,
    update,
    deleteMood,
    getMonthlySummary,
    getByFilter,
    share,
    shareData,
    suggestEmojis,
    getEmojiStatistics,
    getMoodTrends,
    getPublicMoodBoardData
};