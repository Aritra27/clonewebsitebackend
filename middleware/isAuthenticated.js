const jwt = require("jsonwebtoken");
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "user not authenticated",
        sucess: false,
      });
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
        return res.status(401).json({
          message: "invalid",
          sucess: false,
        });
      }
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log("isauthenticated: "+error);
  }
};

module.exports=isAuthenticated
