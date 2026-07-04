const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(11);
    this.password = await bcrypt.hash(this.password, salt);

});

const User = mongoose.model('User', userSchema)

module.exports = User;
