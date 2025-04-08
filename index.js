import express from 'express'
import dotenv from 'dotenv'
import Razorpay from 'razorpay'

import jwtAuthCookie from './middlewares/jwtAuth.js'
import connectdb from './models/dbConnect.js'
dotenv.config()
import path from 'path'
const app = express()
app.set('view engine', 'ejs');
import jwtAuth from './middlewares/jwtAuth.js';
import cookieParser from 'cookie-parser';
app.use(cookieParser())

import fileUpload from 'express-fileupload'
app.use(fileUpload({useTempFiles: true}));

import userController from './controller/userController.js'
import videoController from './controller/videoController.js'
import paymentController from './controller/paymentController.js'
import getUser from './utils/getUser.js'
import videoModel from './models/videoModel.js'
import userModel from './models/userModel.js'
import orderModel from './models/orderModel.js'
import orderController from './controller/orderController.js'
import likedVidModel from './models/likedVidModel.js'
import { resourceLimits } from 'worker_threads'
import checkDomain from './middlewares/checkDomain.js'
connectdb(process.env.DB_URL);

app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req,res)=>{
  res.redirect('/user')
})

app.get('/reel', (req,res)=>{
  res.render('reels')
})

app.get('/user',checkDomain, jwtAuth.jwtAuthCookie, (req, res) => {
  if(req.user[0].role=='editor'){
    res.redirect('/userve')
  }
  else if(req.user[0].role=='admin'){
    res.redirect('/adminuser')
  }
  else{
    res.redirect('/client')
  }
})

app.get('/client', jwtAuth.jwtAuthCookie, (req,res)=>{
  if(req.user[0].role=='client'){
    res.render('home', {user: req.user[0]})
  }
  else{
    res.json({message: "You are not a client"})
  }
})

app.get('/adminuser', jwtAuth.jwtAuthCookie, (req,res)=>{
  if(req.user[0].role=='admin'){
    res.render('adminhome', {user: req.user[0]})
  }
  else{
    res.json({message: "You are not an admin"})
  }
})

app.get('/userve', jwtAuth.jwtAuthCookie, (req,res)=>{
  if(req.user[0].role!='editor'){
    res.json({message: "You are not an editor"})
  }
  else{
    res.render('homeve', {user: req.user[0]});
  }
})

app.post('/upload', videoController.handleVideoUploadPost)
app.get('/api/videos', videoController.handleVideoGet)

app.get('/api/like', videoController.handleVideoLikeGet)
app.post('/api/like', videoController.handleVideoLikePost)

app.get('/user/login', (req,res)=>{
  if(req.cookies?.token){
    res.redirect('/user')
  }
    res.render('login')
})

app.get('/user/signup', (req,res)=>{
  if(req.cookies?.token){
    res.redirect('/user')
  }
  res.render('signup')
})

app.get('/user/logout', (req,res)=>{
  res.clearCookie('token');
  res.redirect('/user');
})

app.get('/user/forgotpass', (req,res)=>{
  res.render('forgotpass');
})

app.post('/user/login', userController.handleUserLoginPost);

app.post('/user/signup', userController.handleUserSignUpPost);

app.post('/user/sendresetotp', userController.handleUserResetOTPPost)

app.post('/user/forgotpass', userController.handleUserForgotPost)

app.post('/user/updateinfo', userController.handleUserUpdatePost);

app.post('/user/updateavatar', userController.handleUserAvatarPost)



const razorpay = new Razorpay({
    key_id: process.env.RP_ID_KEY,
    key_secret: process.env.RP_SECRET_KEY
});


app.post("/create-order", async (req, res) => {
  const token=req.cookies?.token
  // console.log(token)
  const user=await getUser(token)
  // console.log(user)
  const {videoId, amount}=req.body;
  //amount, editorId, ye nikalp..(amount checkout page pe decide hoga, db me base price hai only)
  const video=await videoModel.findById(videoId).populate('owner')
  const editorId=video.owner._id
  const prod_name=video.title
  const prod_desc=video.description
  console.log(video)
    try {
        const order = await razorpay.orders.create({
          amount: amount*100, // Amount in paise (500 INR)
          currency: "INR",
          payment_capture: 1,
          notes: { // Pass custom data here
            editorId: editorId,
            videoId: videoId,
            prod_name: prod_name,
            prod_desc:prod_desc
          }
        });
        console.log("success: ", order)
        res.json(order);
    } catch (error) {
      console.log(error)
        res.status(500).send(error);
    }
});



app.post('/payment-confirmed', paymentController.paymentConfirmPost)

app.post('/payment-pod', paymentController.handlePODPost)


app.get('/orders', orderController.handleOrderGet)


app.listen(process.env.PORT, console.log(`listening on PORT: ${process.env.PORT}`))
// app.listen(3000, () => console.log("Server running on port 3000"));


app.get('/checkout', (req,res)=>{
  res.render('checkoutpage')
})


app.get('/editor', (req,res)=>{
  res.render('editorprofile')
})

app.post('/api/userinfo', async (req,res)=>{
  // const userId= await getUser(req.cookies?.token)
  //ye nahi, jo req me aega us user ka nikalenge na bro..
  let userId=req.body.userId
  if(!userId){
    const uid=await getUser(req.cookies?.token)
    if(!uid){
      return res.status(401).json({message: "Unauthorized"})
    }
    userId=uid._id
  }
  console.log("uuussseeerrriiiddd:",userId)
  const user=await userModel.find({_id: userId})
  // console.log("user api/userinfo", user)
  res.send(user)
})


app.post('/api/acceptorder', async (req,res)=>{
  const {orderId}=req.body
  const order= await orderModel.findByIdAndUpdate(orderId, {orderStatus: 'processing'})
  // console.log("woohoo: ", order)
  res.send(order)
})


app.get('/api/getallve',jwtAuth.jwtAuthCookie, async(req,res)=>{
  if(req.user[0].role!='admin'){
    return res.status(401).json({message: "Unauthorized"})
  }
  const ve= await userModel.find({role: 'editor'})
  console.log("ve: ", ve)
  res.send(ve);
})

app.get('/api/getallclients',jwtAuth.jwtAuthCookie, async(req,res)=>{
  if(req.user[0].role=='admin'){
    const clients= await userModel.find({role: 'client'})
    console.log("clients: ", clients)
    res.send(clients);
  }
  else{
    res.json({message: "You are not an admin"})
  }
})

app.get('/api/getallvideos',jwtAuth.jwtAuthCookie, async(req,res)=>{
  if(req.user[0].role=='admin'){
    const videos= await videoModel.find({}).populate('owner')
    console.log("videos: ", videos)
    res.send(videos);
  }
  else{
    res.json({message: "You are not an admin"})
  }
})

app.delete('/api/order/:id',jwtAuth.jwtAuthCookie, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user[0]._id; 
    
    console.log("Cancelling order:", orderId, "for user:", userId);
    
    // Find the order by ID and check if it belongs to the current user
    const order = await orderModel.findOneAndUpdate(
      { 
        _id: orderId, 
        userId: userId  // Ensure the order belongs to the current user
      },
      { 
        orderStatus: 'cancelled' // Update the status to cancelled
      },
      { 
        new: true // Return the updated document
      }
    );
    
    if (!order) {
      return res.status(404).json({ message: "Order not found or not authorized" });
    }
    
    console.log("Order cancelled:", order);
    res.status(200).json(order);
    
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Server error while cancelling order" });
  }
});

app.get('/api/order/:id', jwtAuth.jwtAuthCookie, async (req, res) => {
  const orderid=req.params.id;
  const userid=req.user[0]._id;
  try {
    const order=await orderModel.find({id: orderid, userId: userid})
  } catch (error) {
    
  }
})

app.get('/order/:id', jwtAuth.jwtAuthCookie, async(req, res)=>{
  try {
    const order= await orderModel.findById(req.params.id).populate('editorId').populate('userId').populate('videoId')
    if(req.user[0].role!='admin'){
      if(req.user[0]._id.toString() !== order.userId._id.toString() && req.user[0]._id.toString()!=order.editorId._id.toString()){
        return res.status(401).json({message: "Unauthorized"})
      }
    }
    res.render('orderdetails', {order: order, userType: req.user[0].role, uid:req.user[0]._id})
  } catch (error) {
    if(error.name=='CastError') res.json({"error": "invalid order id"})
  }

})