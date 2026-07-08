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
    },
    description: {
        type: String,
        required: true,
    },

}, {
    timestamps: true,
})

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;