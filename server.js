require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Note = require('./models/Note')

app.use(express.json());
app.use(express.static('.'))

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected " + conn.connection.host);
    }
    catch (error) {
        console.log("Error  " + error.message);
        process.exit();
    }
}

connectDB();

app.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find({});
        res.status(200).json({ message: 'Notes Fetched', data: notes })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

app.post('/notes', async (req, res) => {
    try {
        const note = new Note(req.body);
        const savedNote = await note.save();
        res.status(201).json({ message: 'Note Saved', data: savedNote })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.put('/notes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const update = req.body;

        const updatedNote = await Note.findByIdAndUpdate(id, update, { returnDocument: 'after', runValidators: true });

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note Updated', data: updatedNote });

    } catch (error) {

        if (error.name == 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format' })
        }
        if (error.name == 'ValidationError') {
            return res.status(400).json({ message: error.message })
        }
        console.error(error)
        res.status(500).json({ message: 'Something Went Wrong!' });
    }
})

app.delete('/notes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deleteNote = await Note.findByIdAndDelete(id);
        if (!deleteNote) {
            return res.status(404).json({ message: 'Note not found' })
        }
        res.status(200).json({ message: 'Note Deleted', data: deleteNote._id });
    } catch (error) {
        if (error.name == 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format' })
        }
        console.error(error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
})



app.listen(3000, () => {
    console.log("Server running on Port 3000")
});