import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from 'dotenv'
dotenv.config()
import getUser from "../utils/getUser.js";
import OrderModel from "../models/orderModel.js"; // Your orders collection
import UserModel from "../models/userModel.js"; // Users collection
import VideoModel from "../models/videoModel.js"; // Videos collection
import videoModel from "../models/videoModel.js";


const razorpay = new Razorpay({
    key_id: process.env.RP_ID_KEY,
    key_secret: process.env.RP_SECRET_KEY
});

async function paymentConfirmPost(req, res){
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, messageByClient, clientVideoLink } = req.body;

    // console.log(req.body)
    try {
        // 1️⃣ Fetch the original order details from Razorpay
        const order = await razorpay.orders.fetch(razorpay_order_id);

        // console.log("pporder", order)

        const token=req.cookies?.token
        req.user=await getUser(token)


        // 2️⃣ Verify the Razorpay signature (security check)
        const hmac = crypto.createHmac("sha256", process.env.RP_SECRET_KEY);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");

        // console.log("ppsignature", generated_signature)

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        // 3️⃣ Store Order in Database
        const orderDoc = await OrderModel.create({
            amount: order.amount / 100, // Convert from paise to INR
            userId: req.user._id,  // Get user from token middleware
            editorId: order.notes.editorId, // Video creator
            videoId: order.notes.videoId, // Store which video was purchased
            paymentId: razorpay_payment_id,
            messageByClient: messageByClient,
            clientVideoLink: clientVideoLink,
            paymentStatus: "Paid",
        });

        await orderDoc.save();

        // 4️⃣ Update video analytics (Increase sales count)
        await VideoModel.findByIdAndUpdate(order.notes.videoId, { $inc: { soldCount: 1 } });

        res.json({ message: "Payment verified and order stored successfully." });
    } catch (error) {
        console.error("Payment verification failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    // res.send("payment hiiii")
}

async function handlePODPost(req,res){
    const {messageByClient, clientVideoLink,videoId, amount } = req.body;
    // console.log(req.body)
    req.user=await getUser(req.cookies?.token)
    const editor=await videoModel.findById(videoId).populate('owner')
    // console.log("eeedddiiitttooorr: ", editor.owner._id)

    try {
        const orderDoc = await OrderModel.create({
            amount: amount, 
            userId: req.user._id,  // Get user from token middleware
            editorId: editor.owner._id, // Video creator
            videoId: videoId, // Store which video was purchased
            paymentId: "pod",
            messageByClient: messageByClient,
            clientVideoLink: clientVideoLink,
            paymentStatus: "POD",
        });

        await orderDoc.save();

        await VideoModel.findByIdAndUpdate(videoId, { $inc: { soldCount: 1 } });

        res.json({ message: "POD order placed successfully" });

    } catch (error) {
        console.error("POD order failed", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default {paymentConfirmPost, handlePODPost};