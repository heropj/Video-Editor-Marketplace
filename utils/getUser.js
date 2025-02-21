import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

async function getUser(token){
    // if (!token) return null;
    // try {
    //     const {id}=jwt.verify(token, process.env.JWT_KEY)
    //     const user= await userModel.find({_id: id})
    //     return user
    // } catch (error) {
    //     return null; // Invalid token
    // }
    if (!token) return null;
    const {id}=jwt.verify(token, process.env.JWT_KEY)
    const user = await userModel.findOne({ _id: id });
    return user
};

export default getUser;
