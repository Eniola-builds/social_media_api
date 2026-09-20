const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');


// Get following list
router.get('/following', authMiddleware, async (req, res) => {
    try {
  const user = await User.findById(req.user.id).populate('following', 'first_name last_name username');
 if(!user) return res.status(404).json({ error: 'user not found'});
  res.json(user.following);
}catch(err) {
    res.status(500).json({error: err.message});
}
});

// Get followers list
router.get('/followers', authMiddleware, async (req, res) => {
    try {
  const user = await User.findById(req.user.id).populate('followers', 'first_name last_name username');
if(!user) return res.status(404).json({ error: 'user not found'});
  res.json(user.followers);
    }catch (err) {
        res.status(500).json({ error: err.message})
    }
});


// Follow a user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = req.user.id;

    if (userToFollowId === currentUserId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }
 
    const currentUser = await User.findById(currentUserId);
    if (currentUser.following.includes(userToFollowId)) {
      return res.status(400).json({ error: 'You are already following this user' });
    }

    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userToFollowId } });
    await User.findByIdAndUpdate(userToFollowId, { $addToSet: { followers: currentUserId } });

    res.json({ message: 'User followed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfollow a user
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.user.id;

    await User.findByIdAndUpdate(currentUserId, { $pull: { following: userToUnfollowId } });
    await User.findByIdAndUpdate(userToUnfollowId, { $pull: { followers: currentUserId } });

    res.json({ message: 'User unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;