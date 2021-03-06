const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please input your name']
    },
    email: {
        type: String,
        required: [true, 'Please input your email'],
        unique: [true, 'Email address already exist. Please try another email'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Password must not be empty'],
        minlength: [6, 'Password must be minimum 6 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please input password confirm field'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password not matched'
        }
    },
    passwordChangedAt: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordResetToken: String,
    passwordResetExpire: Date
});


//this query middleware only retrieve active user from database
userSchema.pre(/^find/, function (next) {
    this.find({active: {$ne: false}});
    next();
});

//this middleware hashing the password when only the password is modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined; //this will remove the passwordConfirm field
    next();
});

//this function will compare the bcrypt password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {//instance method
    return await bcrypt.compare(candidatePassword, userPassword);
};

//this function will compare between the token creation and password change time
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {//instance method
    if (this.passwordChangedAt) {
        const changedTimeStamp = this.passwordChangedAt.getTime() / 1000;
        return jwtTimestamp < changedTimeStamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () { //instance method
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
