const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female"] },
    followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    const user = this;
    if (!user.isModified("password")) {
      next();
    }
    const saltround = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, saltround);
    user.password = hash_password;
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparepassword=async function (password) {
    return bcrypt.compare(password,this.password)
}

userSchema.methods.generateToken=async function () {
    try {
        return jwt.sign({ userId: this._id }, process.env.SECRET_KEY, { expiresIn: '30d' });
    } catch (error) {
        console.error(error);
    }
}

const User = mongoose.model("User", userSchema);

module.exports = User;
