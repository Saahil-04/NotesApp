    const jwt = require('jsonwebtoken');

    function requireAuth(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.userId = decoded.sub;
            next()
        }
        catch (err) {
            console.error(err)
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }

    module.exports = requireAuth;