const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');

const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/messages/conversations — list conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // Aggregate messages to find latest communication per user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender_id: userId }, { receiver_id: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender_id', userId] },
              '$receiver_id',
              '$sender_id'
            ]
          },
          last_message: { $first: '$content' },
          last_at: { $first: '$createdAt' },
          unread_count: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver_id', userId] }, { $eq: ['$is_read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'other_user'
        }
      },
      {
        $unwind: '$other_user'
      },
      {
        $project: {
          other_user_id: '$_id',
          other_name: '$other_user.name',
          other_image: '$other_user.profile_image',
          other_role: '$other_user.role',
          last_message: 1,
          last_at: 1,
          unread_count: 1,
          _id: 0
        }
      },
      {
        $sort: { last_at: -1 }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/:userId — messages with a user
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.user.id, receiver_id: req.params.userId },
        { sender_id: req.params.userId, receiver_id: req.user.id }
      ]
    })
    .populate('sender_id', 'name profile_image')
    .sort({ createdAt: 1 })
    .lean();

    // Mark as read
    await Message.updateMany(
      { receiver_id: req.user.id, sender_id: req.params.userId, is_read: false },
      { $set: { is_read: true } }
    );

    const formatted = messages.map(m => ({
      ...m,
      sender_name: m.sender_id?.name,
      sender_image: m.sender_id?.profile_image,
      sender_id: m.sender_id?._id || m.sender_id
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/messages — send message
router.post('/', authMiddleware, async (req, res) => {
  const { receiver_id, content, message } = req.body;
  const msgText = content || message;
  if (!receiver_id || !msgText) return res.status(400).json({ message: 'receiver_id and content required' });
  
  try {
    const msg = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      content: msgText
    });
    
    res.status(201).json({ message_id: msg._id, message: 'Message sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
