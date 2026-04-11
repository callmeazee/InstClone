const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    user: {
        type: String,
        required: [true, "user is required"]
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
        required: [true, "post id is required"]
    },
    text: {
        type: String,
        required: [true, "comment text is required"],
        trim: true
    }
}, {
    timestamps: true
})

const commentModel = mongoose.model('comments', commentSchema)

module.exports = commentModel
