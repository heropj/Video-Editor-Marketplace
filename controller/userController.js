import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js"
import sendotpfunc from "../utils/sendotp.js"

let otp;

async function handleUserLoginPost(req,res){
    const {email, password}=req.body;
    const user=await userModel.findOne({email: email})
    console.log(user)
    if(user){

        if(user.password===password){
            const token=jwt.sign({id: user._id}, process.env.JWT_KEY, {expiresIn: '5d'})
            // console.log("token: ", token)
            res.cookie("token",token);
            res.status(201).json({'message': 'ok', token: token})
        }
        else{
            res.status(400).json({"message": " wrong pass"})
        }
    }
    else{
        res.status(400).json({"message": "no such user"})
    }

   
}

async function handleUserSignUpPost(req, res) {
    const {fullName, userName, email, password, role}= req.body;

    try {
        const userDoc=new userModel({
            fullName: fullName,
            email: email,
            password: password,
            userName,
            role
        })
        console.log(userDoc)
        await userDoc.save() 
        res.status(201).json({'message': 'ok'})
    } catch (error) {
        console.log(error)
        res.status(400).json({"message":"email already exists"})
    } 
}

async function handleUserResetOTPPost(req,res){
    const {email}= req.body;
    const user=await userModel.findOne({email: email})
    if(!user){
        res.status(400).json({"message": "no such user"})
    }
    else{
        console.log(req.body)
    
        otp=Math.floor(1000 + Math.random() * 9000);
        console.log(otp)
    
        sendotpfunc(otp, email)
        res.status(201).json({'message': 'ok'})
    }
}

async function handleUserForgotPost(req,res){
    const {email, otpentered, newpass}= req.body;
    if(otpentered==otp){
        const user=await userModel.findOne({email: email})

        try {
            await userModel.updateOne({_id: user._id}, {$set:{password: newpass}})
            res.status(201).send({ message: "Password updated successfully" });
        } catch (error) {
            console.log("error in updating: ", error)
        }
    }
}

async function handleUserUpdatePost(req, res){
    const {newfullName, newusername}=req.body
    const token=req.cookies?.token
    const {id}=jwt.verify(token, process.env.JWT_KEY)
    const ruser= await userModel.find({_id: id})
    const email=ruser[0].email;
    // console.log(ruser)
    const user=await userModel.findOne({email: email})

    try {
        await userModel.updateOne({_id: user._id}, {$set:{userName: newusername, fullName: newfullName}})
    } catch (error) {
        console.log("error in updating: ", error)
    }
}

async function handleUserAvatarPost(req, res){
    const {newavatarurl}=req.body
    const token=req.cookies?.token
    const {id}=jwt.verify(token, process.env.JWT_KEY)
    const ruser= await userModel.find({_id: id})
    const email=ruser[0].email;
    // console.log(ruser)
    const user=await userModel.findOne({email: email})

    try {
        await userModel.updateOne({_id: user._id}, {$set:{avatarurl: newavatarurl}})
    } catch (error) {
        console.log("error in updating: ", error)
    }
}

export default {handleUserLoginPost, handleUserSignUpPost, handleUserResetOTPPost, handleUserForgotPost, handleUserUpdatePost, handleUserAvatarPost};