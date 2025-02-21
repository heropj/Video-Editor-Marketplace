import mongoose from "mongoose";

const likedVidSchema=mongoose.Schema({
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    videoId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'video',
        required: true
    }
},{timestamps: true})

const likedVidModel=mongoose.model('likedVid', likedVidSchema)

export default likedVidModel;