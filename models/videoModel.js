import mongoose from "mongoose";    

const videoSchema=mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    videoUrl:{
        type: String,
        required: true
    },
    thumbUrl:{
        type: String,
    },
    category:{
        type: String,
        required: true
    },
    tags:{
        type: Array,
    },
    soldCount:{
        type: Number,
        default: 0
    },
},{timestamps: true})


const videoModel=mongoose.model('video', videoSchema)

export default videoModel;