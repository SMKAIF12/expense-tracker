require('dotenv').config()
const bcrypt = require('bcrypt');
const user = require('../models/User')
const jwt = require('jsonwebtoken');
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // check if the user already exists.
        const existingUser = await user.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this username/email. Please try with different username/email' })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await user.create({ username: username, email: email, password: hashedPassword });
        if (!newUser) {
            res.status(500).json({ success: false, message: `unable to register: ${error}` })
        }
        return res.status(200).json({ success: true, message: 'User registered successfully', data: newUser })
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occured: ${error}` })
    }
}
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const currentUser = await user.findOne({ username });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'Invalid Credentials' });
        }
        const isPasswordMatched = await bcrypt.compare(password, currentUser.password);
        if (!isPasswordMatched) {
            return res.status(404).json({ success: false, message: 'Invalid Credentials' });
        }
        const webToken = jwt.sign({
            userid: currentUser._id,
            username: currentUser.username,
            role: currentUser.role
        }, process.env.JWT_SECRET_KEY, { expiresIn: '5m' })

        return res.status(200).json({ success: true, message: 'Login successful', token: webToken })
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occured: ${error}` })
    }
}

module.exports = { register, login }