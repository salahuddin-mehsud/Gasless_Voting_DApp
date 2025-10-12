import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';
import { validateEmail, validatePassword, validateUsername } from '../utils/validators.js';
import { validateWalletAddress } from '../utils/helpers.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, username, walletAddress } = req.body;

    // Validation
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores'
      });
    }

    if (!validateWalletAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Ethereum wallet address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username },
        { walletAddress: walletAddress.toLowerCase() }
      ]
    });

    if (existingUser) {
      let field = 'email';
      if (existingUser.username === username) field = 'username';
      if (existingUser.walletAddress === walletAddress.toLowerCase()) field = 'wallet address';
      
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      username,
      walletAddress: walletAddress.toLowerCase()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: await User.findById(user._id), // Get user without password
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = req.user._id;

    if (username && !validateUsername(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores'
      });
    }

    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: userId } 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};