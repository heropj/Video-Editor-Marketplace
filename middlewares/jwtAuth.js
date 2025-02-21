import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

async function jwtAuthCookie(req,res,next){
    const token=req.cookies?.token
    // console.log(req.cookies)
    if(!token) return res.redirect('/user/login')
    const {id}=jwt.verify(token, process.env.JWT_KEY)
    const user= await userModel.find({_id: id})
    req.user=user;
    // console.log("from jwtauth: ", user)
    next()
}

export default {jwtAuthCookie};