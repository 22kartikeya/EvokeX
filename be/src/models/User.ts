import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    email: {
        type: String
    }
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);