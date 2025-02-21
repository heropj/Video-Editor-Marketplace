import videoModel from "../models/videoModel.js";
import likedVidModel from "../models/likedVidModel.js";
import cloudinary from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import getUser from "../utils/getUser.js";

async function handleVideoUploadPost(req, res) {
    const file = req.files.file;
    console.log(req.files);

    try {
        // Upload the video to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, { resource_type: "video", folder: 'ppgpvids' });

        const token=req.cookies?.token
        const {id}=jwt.verify(token, process.env.JWT_KEY)
        const user= await userModel.find({_id: id})
        req.user=user;
        console.log("req vidcont", req.user[0]._id)
        // Extract form data
        const { title, price, category, description, tags } = req.body;

        // Save video details to the database
        const videoDoc = new videoModel({
            title,
            description,
            price,
            category,
            tags,
            owner: req.user[0]._id,
            videoUrl: result.secure_url // Use Cloudinary's secure URL
        });

        await videoDoc.save(); // Save to database

        res.status(201).json({ message: 'Video uploaded successfully', videoUrl: result.secure_url });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: 'Video not uploaded', error });
    }
}

async function handleVideoGet(req, res) {
    const {editorId}=req.body
  try {
    let videos;
    if(editorId){
        videos = await videoModel.find({owner: editorId}); // Fetch editor's when editorId di ho
    }
    else{
        videos = await videoModel.find(); // Fetch all videos edid nhi
    }
    // console.log("vids", videos) 
    res.json(videos); // Send the videos as JSON
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
}

async function handleVideoLikeGet(req,res){
    const token=req.cookies?.token
    const {id}=jwt.verify(token, process.env.JWT_KEY)
    const user= await userModel.find({_id: id})
    req.user=user;
    const likedVids = await likedVidModel.find({ clientId: req.user[0]._id }).populate('videoId');
    res.json(likedVids);
}

async function handleVideoLikePost(req,res){
    console.log("like", req.body)

    const token=req.cookies?.token
    const {id}=jwt.verify(token, process.env.JWT_KEY)
    const user= await userModel.find({_id: id})
    req.user=user;
    // Extract form data
    const { vidid, curricon } = req.body;

    console.log("curricon: ", curricon)

    if(curricon =='liked'){
        const likedVid = await likedVidModel.deleteMany({ clientId: req.user[0]._id, videoId: vidid });
        return res.status(201).json({ message: 'Video unliked'});
    }
    else{
        // Save video details to the database
        const likedVidDoc = new likedVidModel({
            clientId: req.user[0]._id,
            videoId: vidid,
            // curricon,
        });
    
        await likedVidDoc.save(); // Save to database
    
        res.status(201).json({ message: 'Video liked'});
    }
    
}


export default {handleVideoUploadPost, handleVideoGet, handleVideoLikePost, handleVideoLikeGet};