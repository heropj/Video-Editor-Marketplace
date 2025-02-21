import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    amount:{
        type: Number,
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    editorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    videoId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'video',
        required: true
    },
    paymentId:{
        type: String,
        required: true
    },
    messageByClient:{
        type: String,
    },
    clientVideoLink:{
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['placed', 'processing', 'completed', 'cancelled'],
        default: 'placed'
    },
    paymentStatus: {
        type: String,
        enum: ['POD', 'Paid'],
    }   

}, {timestamps: true})

const orderModel = mongoose.model('order', orderSchema)

export default orderModel;