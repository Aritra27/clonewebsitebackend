const sharp = require("sharp");
const cloudinary = require('../utils/cloudinary');
const Post = require("../model/post.model");
const User = require("../model/user.model");
const Commment = require("../model/comment.model");
const Comment = require("../model/comment.model");
const { getReceiverSocketId, io } = require("../socket/socket");
const addnewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) return res.status(400).json({ message: "image required" });

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    console.log(caption);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });
    return res.status(201).json({
      message: "new post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log("Error fetching posts:", error.message);
    return res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};
const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 }, 
        populate: { path: "author", select: "username profilePicture" },
      });
    return res.status(200).json({
      posts,
      sucess: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const likePost = async (req, res) => {
  try {
    const likeKarnewalaUserkiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(400).json({ message: "post not found", sucess: false });

    //like logic
    await post.updateOne({ $addToSet: { likes: likeKarnewalaUserkiId } });
    await post.save();

    //implement socket io
    const user = await User.findById(likeKarnewalaUserkiId).select('username profilePicture')
    const postOwnerId = post.author.toString();
    if(postOwnerId !== likeKarnewalaUserkiId){
      //emit a notification
      const notification={
        type:'Like',
        userId : likeKarnewalaUserkiId,
        userDetails:user,
        postId,
        message:"Your post was liked"
      }
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit('notification',notification);
    }

    return res.status(200).json({
      message: "post liked",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const dislikePost = async (req, res) => {
  try {
    const likeKarnewalaUserkiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(400).json({ message: "post not found", sucess: false });

    //like logic
    await post.updateOne({ $pull: { likes: likeKarnewalaUserkiId } });
    await post.save();

    //implement socket io

    const user = await User.findById(likeKarnewalaUserkiId).select('username profilePicture')
    const postOwnerId = post.author.toString();
    if(postOwnerId !== likeKarnewalaUserkiId){
      //emit a notification
      const notification={
        type:'Dislike',
        userId : likeKarnewalaUserkiId,
        userDetails:user,
        postId,
        message:"Your post was liked"
      }
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit('notification',notification);
    }

    return res.status(200).json({
      message: "post disliked",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const addcomment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKarneWalaUserKiId = req.id;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!text)
      return res
        .status(400)
        .json({ message: "text is required", sucess: false });
    const comment = await Commment.create({
      text,
      author: commentKarneWalaUserKiId,
      post: postId,
    })
    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });
    post.comments.push(comment._id);
    await post.save();

    return res.status(200).json({
      comment,
      message: "comment added successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const getCommentsOfPost = async (req, res) => {
  try {
    const { postId } = req.params.id;

    const comments = await Commment.find({ post: postId }).populate({
      path: "Author",
      select: "username,profilePicture",
    });
    if (!comments)
      return res.status(400).json({ message: "no comments", sucess: false });
    return res.status(200).json({ sucess: true, comments });
  } catch (error) {
    console.log(error);
  }
};

const deletePost = async (req,res)=>{
    try {
        const postId=req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post)
            return res.status(400).json({ message: "no post found", sucess: false });

        if(post.author.toString() !== authorId)
            return res.status(400).json({ message: "unauthorized access", sucess: false });

        await Post.findByIdAndDelete(postId);

        //remove from user post
        let user = await User.findById(authorId);
        user.posts= user.posts.filter(id => id.toString !== postId);
        await user.save();

        //remove all comments from posts

        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            sucess:true,
            message:'post deleted'
        })
    } catch (error) {
        console.log(error)
    }
}

const bookmarkPost = async (req,res)=>{
    const postId=req.param.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post)
        return res.status(400).json({ message: "no post found", sucess: false });
    const user = await User.findById(authorId);
    if(user.bookmarks.includes(post._id)){
        await user.updateOne({$pull:{bookmarks:post._id}});
        await user.save();
        return res.status(200).json({ message: "sucessfully removed from bookmark", sucess: true });
    }
    else{
        await user.updateOne({$push:{bookmarks:post._id}});
        await user.save();
        return res.status(200).json({ message: "sucessfully added to  bookmark", sucess: true });
    }

}

module.exports = {
  addnewPost,
  getAllPost,
  getUserPost,
  likePost,
  dislikePost,
  addcomment,
  getCommentsOfPost,
  deletePost,
  bookmarkPost
};
