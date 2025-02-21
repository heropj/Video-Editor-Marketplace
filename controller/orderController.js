import orderModel from "../models/orderModel.js";
import getUser  from "../utils/getUser.js";

async function handleOrderGet (req, res){
    let orders;
    req.user=await getUser(req.cookies?.token)
    try {
        if(req.user.role=="editor"){
            // console.log("if")
            orders = await orderModel.find({editorId:req.user._id}).populate("videoId").populate("editorId").populate("userId");
        }
        else{
            // console.log("else")
            console.log(req.user)
            orders = await orderModel.find({userId:req.user._id}).populate("videoId").populate("editorId").populate("userId"); // Fetch all orders
        }
        // console.log("orders: ", orders);
        // console.log(vid)
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export default {handleOrderGet}