// Tests dataset

const { default: mongoose } = require('mongoose');

// For more context: test data objects that has 1 in its name are the default ones
// Sample data for author populate
const generateMongoObjectId = () => new mongoose.Types.ObjectId();

const authorDetails = {
	name: 'Random Author',
	bio: 'This is a random author bio.',
	email: 'first.author@gmail.com',
	password: 'testpassword456',
	imageFile: generateMongoObjectId(),
};

const baseBlogDetails = {
	category: null,
	likes: [],
	tags: [],
	isPrivate: true
};

exports.sampleImageCredit = {
	authorName: 'First Author',
	authorURL: 'https://github.com/firztauthor',
	sourceName: 'Unsplash',
	sourceURL: 'https://unsplash.com'
};

exports.sampleInvalidImageCredit = {
	sourceName: 12345,
	authorName: 67890,
	sourceURL: 'hi mom',
	authorURL: 'bye mom'
};

exports.sampleAuthor1 = {
	username: 'randauthor1',
	...authorDetails
};
exports.sampleAuthor2 = {
	username: 'randauthor2',
	...authorDetails
};

// Sample data for viewer populate
const viewerDetails = {
	name: 'testviewer',
	password: 'testpassword123'
};

exports.sampleViewer1 = {
	username: 'testusername1',
	...viewerDetails
};
exports.sampleViewer2 = {
	username: 'testusername2',
	...viewerDetails
};

// Sample data for categorie populate
exports.sampleCategory1 = {
	name: 'Technology',
	description: 'This area is about technologies and AIs',
	imageFile: generateMongoObjectId()
};
exports.sampleCategory2 = {
	name: 'Mental Health',
	description: 'This area is about mental health maintenance',
	imageFile: generateMongoObjectId()
};

// Sample data for categorie populate
exports.sampleTag1 = {
	name: 'reverse engineering',
};

exports.sampleTag2 = {
	name: 'hardcore diet',
};

// Sample data for blog populate
exports.sampleBlog1 = {
	...baseBlogDetails,
	title: 'Test Blog',
	content: 'This is a test blog content',
	imageFile: generateMongoObjectId()
};

exports.sampleBlog2 = {
	...baseBlogDetails,
	title: 'Hey Ya!',
	content: 'contentconentcotnenttentcon',
	imageFile: generateMongoObjectId()
};

exports.sampleBlog3 = {
	...baseBlogDetails,
	title: 'blog 3 title',
	content: '<p>blog 3 content</p>',
	imageFile: generateMongoObjectId()
};

// Sample data for comment populate
exports.sampleComment1 = {
	content: 'What is the hidden meaning of this article?'
};

exports.sampleComment2 = {
	content: 'So far, what\'s your main opinion on the latest major changes of that technology?',
};