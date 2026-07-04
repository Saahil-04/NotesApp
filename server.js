require('dotenv').config()

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Note = require('./models/Note')
const User = require('./models/User')

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

app.get('/notes', async (req, res, next) => {
    try {
        const notes = await Note.find({});
        res.status(200).json({ message: 'Notes Fetched', data: notes })
    } catch (err) {
        next(err)
    }
});

app.post('/notes', async (req, res, next) => {
    try {
        const note = new Note(req.body);
        const savedNote = await note.save();
        res.status(201).json({ message: 'Note Saved', data: savedNote })
    } catch (err) {
        next(err)
    }
})

app.put('/notes/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const update = req.body;

        const updatedNote = await Note.findByIdAndUpdate(id, update, { returnDocument: 'after', runValidators: true });

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note Updated', data: updatedNote });

    } catch (err) {
        next(err)
    }
})

app.delete('/notes/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleteNote = await Note.findByIdAndDelete(id);
        if (!deleteNote) {
            return res.status(404).json({ message: 'Note not found' })
        }
        res.status(200).json({ message: 'Note Deleted', data: deleteNote._id });
    } catch (err) {
        next(err)
    }
})

app.post('/auth/signup', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = new User({ email, password });
        const savedUser = await user.save()

        res.status(201).json({ message: 'User Created', data: savedUser.email })
    } catch (err) {
        next(err)
    }
})

app.use((err, req, res, next) => {
    if (err.code === 11000) {
        return res.status(409).json('Resource already Exists');
    }
    if (err.name === 'ValidationError') {
        const fields = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: 'Validation Error', errors: fields });
    }
    if (err.name === 'CastError') {
        return res.status(400).json('Invalid ID format');
    }
    console.error(err)
    return res.status(500).json('Something went wrong!');
});

app.listen(3000, () => {
    console.log("Server running on Port 3000")
});