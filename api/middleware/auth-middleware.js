const jwt = require('jsonwebtoken');
const authMiddleWare = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied, Invalid Token. Please login to continue' })
    }
    try {
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!verifiedUser) {
            return res.status(401).json({ success: false, message: 'Access denied, Invalid Token. Please login to continue' })
        }
        req.userInfo = verifiedUser;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error })
    }
}
module.exports = authMiddleWare;