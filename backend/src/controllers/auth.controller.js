import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import { client } from "../lib/streamClient.js";

export const signup = async (req, res) => {
    const { fullName, email, password, username } = req.body;
    try {
        if(!fullName || !email || !password || !username) {
            return res.status(400).json({ message: "All fields are required"});
        }
        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters"});
        }

        const user = await User.findOne({email});
        if (user) return res.status(400).json({ message: "Email already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            username,
            password: hashedPassword
        });

        if(newUser){
            //generate jwt token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                username: newUser.username,
                profilePic: newUser.profilePic
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT for your app
    generateToken(user._id, res);

    // Ensure user exists in Stream system
    await client.upsertUsers([
    {
        id: user.username,      // required
        name: user.fullName,
        username: user.username,
        image: user.profilePic || null,
    },
    ]);
    // Generate Stream token
    const expiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24h expiry
    const streamToken = client.createToken(user.username, expiry);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      profilePic: user.profilePic,
      serverToken: streamToken,
      serverTokenExpiry: expiry,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({ message: "Logged out succesfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error"});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new:true})//new na kthen userin e fundit
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try{
        const { username, fullName, profilePic, _id, role, email, createdAt } = req.user;

        // Generate new Stream token
        const expiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
        const serverToken = client.createToken(username, expiry);

        res.status(200).json({
        _id,
        username,
        fullName,
        profilePic,
        serverToken,
        serverTokenExpiry: expiry,
        role,
        email,
        createdAt,
        });
    } catch (error) {
        console.log("Error in checkAuth controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getStreamToken = async (req, res) => {
  try {
    const token = serverClient.createToken(req.user._id.toString());
    res.json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
};