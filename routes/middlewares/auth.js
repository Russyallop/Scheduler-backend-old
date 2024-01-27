const jwt = require("jsonwebtoken");
const { sendResponse } = require("../../utils/response");
const httpStatus = require("http-status");

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
      sendResponse(res,"Authentication token missing", httpStatus.BAD_REQUEST);
      return false;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.body.user = decoded;
  } catch (err) {
    sendResponse(res,"Your token expired.Please login again", httpStatus.BAD_REQUEST);
    return false;
  }
  return next();
};

module.exports = verifyToken;