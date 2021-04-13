const jwt = require('jsonwebtoken');

module.exports = (user, statusCode, res) => {
    const id = user._id;
    const token = jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true // cookies can not be accessed or modified by the browser (prevent cross scripting attack)
    }

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //only https connection allowed

    res.cookie('jwt', token, cookieOptions);

    return res.status(statusCode).send({
        token
    });
}