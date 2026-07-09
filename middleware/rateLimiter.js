const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

const signupLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = [ loginLimiter, signupLimiter ];
