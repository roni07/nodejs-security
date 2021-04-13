const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, // in 1 hour 1 ip can send 100 request (max: 100 -> 100 request, window -> 1 hour)
    message: 'Too many request from this IP, please try again in an hour!'
});