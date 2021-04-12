const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
    photo: String,
    password: {
       type: String,
        required: [true, 'Password must not be empty'],
        minlength: [6, 'Password must be minimum 6 characters'],
        select: false
    },
    passwordConfirm: {
       type: String,
        required: [true, 'Please input password confirmation field'],
        validate: {
           validator: function (el) {
               return el === this.password;
           },
            message: 'Password not matched'
        }
    },
    passwordChangedAt: {
       type: Date
    }
});

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();

   this.password = await bcrypt.hash(this.password, 12);

   this.passwordConfirm = undefined;
   next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        console.log(this.passwordChangedAt, JWTTimestamp);
    }

    return false;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
