import User from '../models/User.js';
import bcrypt from 'bcrypt';
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        req.session.isLoggedIn = true;
        req.session.userId = newUser._id;
        return res.json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
    catch (error) {
        console.log('Error');
        res.status(500).json({ message: 'Internal server error' });
    }
};
// For User Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        req.session.isLoggedIn = true;
        req.session.userId = user._id;
        return res.json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.log('Error');
        res.status(500).json({ message: 'Internal server error' });
    }
};
// For User Logout
export const logoutUser = async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: error.message });
        }
    });
    return res.json({ message: 'Logout Successful' });
};
// For Verify User Session
export const verifyUser = async (req, res) => {
    try {
        const { userId } = req.session;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid User' });
        }
        return res.json({ user });
    }
    catch (error) {
        console.log('Error');
        res.status(500).json({ message: 'Internal server error' });
    }
};
