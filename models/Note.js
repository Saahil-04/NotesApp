const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

}, {
    timestamps: true,
})

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;