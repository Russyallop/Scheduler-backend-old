const { sendResponse } = require("../../utils/response");
const httpStatus = require("http-status");
const multer = require("multer");

const multerError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) sendResponse(res, err.message, httpStatus.BAD_REQUEST);
    else if (err) sendResponse(res, err.message, httpStatus.BAD_REQUEST);
     else next();
}

const urlNotFound = (req, res, next) => {
    sendResponse(res,"Api url not found.", httpStatus.BAD_REQUEST);
    next();
}

module.exports = {
    multerError,
    urlNotFound,
};