import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true,
        default: `user${Date.now()}`
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    avatarurl:{
        type: String, 
        default: "/images/batman.jpg"
    }, 
    role: {
        type: String,
        enum: ['admin', 'editor', 'client'],
        default: 'client'
    }
},{timestamps: true})


const userModel=mongoose.model('user', userSchema)

export default userModel;