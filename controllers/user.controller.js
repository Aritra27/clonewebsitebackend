const Post = require("../model/post.model");
const User = require("../model/user.model");
const cloudinary = require("../utils/cloudinary");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "Something is missing",
        sucess: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "email is already exist",
        sucess: false,
      });
    }
    await User.create({
      username,
      email,
      password,
    });
    return res.status(201).json({
      message: "account created sucessfully",
      sucess: true,
    });
  } catch (error) {
    console.log("error from user.controller.register : " + error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing",
        sucess: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "incorrect password or email ",
        sucess: false,
      });
    }
    const isPasswordMatch = await user.comparepassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "incorrect password  ",
        sucess: false,
      });
    }
    const token = await user.generateToken();
    // const populatePosts = await Promise.all(
    //   user.posts.map(async (postId) => {
    //     const post = await Post.findById(postId);
    //     if (post.author.equals(user._id)) {
    //       return post;
    //     }
    //     return null;
    //   })
    // );
    user.password = undefined;

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",  // Allows cookies to be sent on GET requests
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: true,    // No HTTPS in local development
      })
      .json({
        user,
        message: `welcome back ${user.username}`,
        sucess: true,
      });
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "logout sucessfully",
      sucess: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const getprofile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId).populate({path:'posts',createdAt:-1}).populate('bookmarks');
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudresponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudresponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "user not found",
        sucess: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudresponse.secure_url;
    await user.save();
    return res.status(200).json({
      message:"user updated successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const getSuggestedusers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(480).json({
        message: "Currently do not have any users",
      });
    }
    return res.status(200).json({ success: true, users: suggestedUsers });
  } catch (error) {
    console.log(error);
  }
};

const followOrUnfollow = async (req, res) => {
  try {
    const followkrnewala = req.id;
    const jiskoFollowkrunga = req.params.id;
    if (followkrnewala === jiskoFollowkrunga) {
      return res.status(400).json({
        message: "you can not follow and unfollow yourself",
        success: false,
      });
    }
    const user = await User.findById(followkrnewala);
    const targetUser = await User.findById(jiskoFollowkrunga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "user not found",
        success: false,
      });
    }
    const idFollowing = user.following.includes(jiskoFollowkrunga);
    if (idFollowing) {
      //unfollow
      await Promise.all([
        User.updateOne(
          { _id: followkrnewala },
          { $pull: { following: jiskoFollowkrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowkrunga },
          { $pull: { followers: followkrnewala } }
        ),
      ]);
      return res.status(200).json({
        message: "unfollow sucessfully",
        success: true,
      });
    } else {
      //follow
      await Promise.all([
        User.updateOne(
          { _id: followkrnewala },
          { $push: { following: jiskoFollowkrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowkrunga },
          { $push: { followers: followkrnewala } }
        ),
      ]);
      return res.status(200).json({
        message: "followed sucessfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getprofile,
  editProfile,
  followOrUnfollow,
  getSuggestedusers,
};
