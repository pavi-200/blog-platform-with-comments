const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getPosts = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    };

    const posts = await Post.find(query).sort({ createdAt: -1 }).populate('author', 'name');
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user._id,
      authorName: req.user.name,
      image,
      category: category || 'General'
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own posts.' });
    }

    const { title, content, category } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (req.file) post.image = `/uploads/${req.file.filename}`;

    await post.save();
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await Comment.deleteMany({ postId: post._id });
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    const postIds = posts.map((post) => post._id);
    const totalComments = await Comment.countDocuments({ postId: { $in: postIds } });

    res.json({ posts, totalPosts: posts.length, totalComments });
  } catch (error) {
    next(error);
  }
};
