const express = require('express');
const protect = require('../middleware/authMiddleware');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.get('/:postId', getComments);
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
