const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const authorSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		default: 'Unnamed Author'
	},
	bio: {
		type: String,
		required: true,
		default: 'Write something here'
	},
	imageFile: {
		type: Schema.Types.ObjectId,
		ref: 'ImageFile',
		default: null
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		validate: {
			validator: validator.isEmail,
			message: 'Invalid email',
			isAsync: false
		}
	},
	username: {
		type: String,
		required: true,
		min: 4,
		max: 20,
		match: /^[a-zA-Z0-9]+$/,
	},
	passwordHash: {
		type: String,
		required: true,
		minlength: 8
	},
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Comment'
		}
	],
}, {
	timestamps: true
});

// Transform output after converting it to JSON
authorSchema.set('toJSON', {
	transform: function (_, returnedObject) {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
		delete returnedObject.passwordHash;
	},
});

const Author = mongoose.model('Author', authorSchema);
module.exports = Author;