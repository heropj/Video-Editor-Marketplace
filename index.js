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
connectdb(process.env.DB_URL);

app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req,res)=>{
  res.send("welcome to / page")
})

app.get('/reel', (req,res)=>{
  res.render('reels')
})

app.get('/user', jwtAuth.jwtAuthCookie, (req, res) => {
  if(req.user[0].role=='editor'){
    res.render('homeve', {user: req.user[0]});
  }
  else{
    res.render('home', {user: req.user[0]});
  }
})

app.get('/userve', jwtAuth.jwtAuthCookie, (req,res)=>{
  console.log(req.user)
  res.render('homeve', {user: req.user[0]});
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
  // console.log(video)
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
        // console.log(order)
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
  const userId= await getUser(req.cookies?.token)
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