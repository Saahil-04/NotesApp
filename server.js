require('dotenv').config()

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Note = require('./models/Note')
const User = require('./models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const requireAuth = require('./middleware/auth');
const [loginLimiter, signupLimiter] = require('./middleware/rateLimiter')



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

app.get('/notes', requireAuth, async (req, res, next) => {
    try {
        const notes = await Note.find({ userId: req.userId });
        res.status(200).json({ message: 'Notes Fetched', data: notes })
    } catch (err) {
        next(err)
    }
});

app.post('/notes', requireAuth, async (req, res, next) => {
    try {
        const note = new Note({
            userId: req.userId,
            title: req.body.title,
            description: req.body.description
        });

        const savedNote = await note.save();
        res.status(201).json({ message: 'Note Saved', data: savedNote })
    } catch (err) {
        next(err)
    }
})

app.put('/notes/:id', requireAuth, async (req, res, next) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body;

        const note = await Note.findById(id);

        if (!note || note.userId.toString() !== req.userId) {
            return res.status(404).json({ message: 'Note not Found' });
        }

        const updatedNote = await Note.findByIdAndUpdate(id, { title, description }, { returnDocument: 'after', runValidators: true });

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note Updated', data: updatedNote });

    } catch (err) {
        next(err)
    }
})

app.delete('/notes/:id', requireAuth, async (req, res, next) => {
    try {
        const id = req.params.id;
        const note = await Note.findById(id);
        if (!note || note.userId.toString() !== req.userId) {
            return res.status(404).json({ message: "Note not found" })
        }
        const deleteNote = await Note.findByIdAndDelete(id);
        if (!deleteNote) {
            return res.status(404).json({ message: 'Note not found' })
        }
        res.status(200).json({ message: 'Note Deleted', data: deleteNote._id });
    } catch (err) {
        next(err)
    }
})

app.post('/auth/signup', signupLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = new User({ email, password });
        const savedUser = await user.save()

        res.status(201).json({ message: 'User Created', data: savedUser.email })
    } catch (err) {
        next(err)
    }
})

app.post('/auth/login', loginLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        const token = jwt.sign(
            { sub: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        )
        return res.status(200).json({ message: "Login Successful", token })

    } catch (err) {
        next(err)
    }
})
const customMessages = {
    email: {
        required: "Email is required",
        regexp: "Please enter a valid email"
    },
    password: {
        required: "Password is required",
        minlength: "Password should be atleast 8 characters"
    },
    title: {
        required: "Title is required",
        maxlength: "Title cannot exceed 100 characters"
    },
    description: {
        required: "Description is required",
        maxlength: "Description cannot exceed 2000 characters"
    }

}
app.use((err, req, res, next) => {
    if (err.code === 11000) {
        return res.status(409).json({ message: 'Resource already Exists' });
    }
    if (err.name === 'ValidationError') {

        const fields = Object.keys(err.errors).map(field => {
            const kind = err.errors[field].kind;
            return customMessages[field]?.[kind] || 'Invalid Input';
        })
        console.log(err);
        return res.status(400).json({ message: "Validation Error", errors: fields })
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    console.error(err)
    return res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(3000, () => {
    console.log("Server running on Port 3000")
});