const httpStatus = require("http-status");
const Role = require("../../models/role");
const { sendResponse } = require("../../utils/response");
const { OK,BAD_REQUEST,INTERNAL_SERVER_ERROR,NOT_FOUND } = httpStatus;

const addRole = async (req, res) => {
    const { roleName } = req.body;
    try {
        if(!roleName) sendResponse(res, "Role name is missing.", BAD_REQUEST)
        const roleExist = await Role.findOne({ roleName, isDeleted  : "n" });
        if (roleExist) sendResponse(res, "Role already exist.", BAD_REQUEST);
        else {
            const role = await Role.create({ roleName });
            sendResponse(res, role, OK);
        }
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
};

const list = async (req, res) => {
    try {
        const role = await Role.find({ isDeleted : "n" }, " _id roleName ");
        if (!role) sendResponse(res, "Role not found", NOT_FOUND);
        else sendResponse(res, role, OK);
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    addRole,
    list
}
