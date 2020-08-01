const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('Email is invalid');
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0)
                throw new Error('Age must be a positive number');
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password'))
                throw new Error('Cannot contain password');
        }
    },
    tokens: [{
        token: {
            required: true,
            type: String
        }
    }]
});

userSchema.methods.generateToken = async function () {
    const token = jwt.sign({
        _id: this._id
    }, 'token');

    this.tokens = this.tokens.concat({
        token
    });

    await this.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({
        email
    });

    if (!user)
        throw new Error('Unable to login');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
        throw new Error('Unable to login');

    return user;
};

//Hash the password
userSchema.pre('save', async function (next) {
    if (this.isModified('password'))
        this.password = await bcrypt.hash(this.password, 8);

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;