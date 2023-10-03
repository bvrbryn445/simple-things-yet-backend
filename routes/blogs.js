const express = require('express');
const {
	authenticateUser,
	upload
} = require('../utils/middleware');
const {
	blogCreate,
	blogFetch,
	blogs,
	publishedBlogListFetch,
	blogImageUpdate,
	blogUpdate,
	blogDelete,
} = require('../controllers/blog');
const Author = require('../models/author');
const Viewer = require('../models/viewer');
const { resourceImageFetch } = require('../controllers/reusables');

const router = express.Router();

// Get all the blogs
router.get('/', blogs);

// Get all published blogs
router.get('/published', publishedBlogListFetch);

// Get specific blog by ID
router.get('/:id', blogFetch);

// Get the preview image of a specific blog using image ID
router.get('/:id/image', resourceImageFetch);

// Save/publish a new blog
router.post('/:publishAction',
	authenticateUser(Author),
	upload.single('blogImage'),
	blogCreate
); // for creating a new draft blog

// Update an existing blog image by author
router.put('/:id/image-update/authors-only',
	authenticateUser(Author),
	upload.single('blogImage'),
	blogImageUpdate
);

// Update an existing blog by author
router.put('/:id/:publishAction/authors-only',
	authenticateUser(Author),
	blogUpdate
);

// Indirect update of an existing blog based on user's interactions
router.put('/:id', authenticateUser(Viewer), blogUpdate);

// Delete a blog
router.delete('/:id', authenticateUser(Author), blogDelete);

module.exports = router;