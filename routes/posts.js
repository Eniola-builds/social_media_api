const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// 1. CREATE A POST 
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const post = await Post.create({
      title,
      content,
      tags,
      author: req.user.id,
      state: 'draft'
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. GET PUBLISHED POSTS 
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, state = 'published', sort = 'createdAt' } = req.query;

    let query = { state };

    // Search by title, tags, or author username
    if (search) {
      const matchingAuthors = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const authorIds = matchingAuthors.map(user => user._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { author: { $in: authorIds } }
      ];
    }

    // Dynamic Sorting (timestamp, like_count, comment_count)
    let sortOptions = {};
    if (sort === 'like_count') sortOptions = { like_count: -1 };
    else if (sort === 'comment_count') sortOptions = { comment_count: -1 };
    else sortOptions = { createdAt: -1 };

    const posts = await Post.find(query)
      .populate('author', 'first_name last_name username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET LOGGED-IN USER'S POSTS
router.get('/me/all', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET SINGLE PUBLISHED POST
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, state: 'published' })
      .populate('author', 'first_name last_name username email');

    if (!post) return res.status(404).json({ error: 'Post not found or is a draft' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE POST CONTENT OR STATE (Owner only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this post' });
    }

    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.tags) post.tags = req.body.tags;
    if (req.body.state) post.state = req.body.state;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. DELETE A POST
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. LIKE A POST 
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already liked this post' });
    }

    post.likes.push(req.user.id);
    post.like_count = post.likes.length;
    await post.save();

    res.json({ message: 'Post liked', like_count: post.like_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. UNLIKE A POST
router.post('/:id/unlike', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have not liked this post' });
    }

    post.likes = post.likes.filter(userId => userId.toString() !== req.user.id);
    post.like_count = post.likes.length;
    await post.save();

    res.json({ message: 'Post unliked', like_count: post.like_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;