import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
        },
        fullName:{
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 20,
        },
        password:{
            type: String,
            required: true,
            minlength: 6
        },
        profilePic:{
            type: String,
            default: ""
        },
        spotify: {
            accessToken: { type: String },
            refreshToken: { type: String },
            expiresAt: { type: Date },
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
