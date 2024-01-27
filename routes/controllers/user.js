const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const { sendResponse } = require("../../utils/response");
const {
    paginationParams
} = require("../../utils/common");
const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = httpStatus;

const addUser = async (req, res) => {
    let {
        firstName,
        lastName,
        email,
        contactNumber,
        address,
        displayName,
        profilePic,
        password,
        roleId,
    } = req.body;
    
    try {

        if (!firstName) sendResponse(res, "First name is missing.", BAD_REQUEST);
        else if (!email) sendResponse(res, "Email is missing.", BAD_REQUEST);
        else if (!contactNumber) sendResponse(res, "Contact number is missing.", BAD_REQUEST);
        else if (!displayName) sendResponse(res, "Display name is missing.", BAD_REQUEST);
        else if (!password) sendResponse(res, "Password is missing.", BAD_REQUEST);
        else {
            const userExist = await User.findOne({ email, isDeleted: "n" }, " _id ");
            if (userExist) sendResponse(res, "User already exist.", BAD_REQUEST);
            else {
                const saltRounds = 12;
                const hashPassword = bcrypt.hashSync(password, saltRounds);
                const user = await User.create({
                    firstName,
                    lastName,
                    email,
                    contactNumber,
                    address,
                    displayName,
                    password: hashPassword,
                    roleId
                });
                if (user) {
                    sendResponse(res, user, OK);
                }
            }
        }
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
};

const updateUser = async (req, res) => {
    const userId = req?.params?.id;
    const {
        firstName,
        lastName,
        contactNumber
    } = req.body;
    try {
        if (!firstName) sendResponse(res, "First name is missing.", BAD_REQUEST);
        else if (!contactNumber) sendResponse(res, "Contact number is missing.", BAD_REQUEST);
        else {
            const isUpdated = await User.findOneAndUpdate(
                {
                    _id: userId,
                    isDeleted: "n"
                },
                {
                    firstName,
                    lastName,
                    contactNumber,
                    updatedAt: Date.now()
                });
            if (isUpdated) sendResponse(res, "User updated successfully.", OK);
            else sendResponse(res, "Error updating user.", BAD_REQUEST);
        }
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

const deleteUser = async (req, res) => {
    const userId = req?.params?.id;
    try {
        if (!userId && typeof userId === "undefined") sendResponse(res, "User id missing.", BAD_REQUEST);
        const user = await User.findById(userId, " _id ");
        if (!user) sendResponse(res, "User not found", NOT_FOUND);
        else {
            let match = {
                _id: userId,
                isDeleted: "n"
            };
            const isDeleted = await User.findOneAndUpdate(
                match,
                {
                    isDeleted: "y",
                    updatedAt: Date.now()
                });
            if (isDeleted) sendResponse(res, "User deleted successfully.", OK);
            else sendResponse(res, "Error deleting user.", BAD_REQUEST);
        }
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

const getUsers = async (req, res) => {
    const { q, sort, order } = req?.query;
    const { limit, offset } = paginationParams(req);
    try {
        let match = { isDeleted: "n" };

        const sortObj = { firstName : 1 };

        if (sort === 'role') {
            if(!order) sendResponse(res, "Order is missing.", BAD_REQUEST);
            delete sortObj.firstName;
            sortObj['userRole.roleName'] = Number(order);
        } else if(sort) {
            if(!order) sendResponse(res, "Order is missing.", BAD_REQUEST);
            delete sortObj.firstName;
            sortObj[sort] = Number(order);
        }

        if (q) {
            match.$or = [
                { firstName: { $regex: q, $options: "ix" } },
                { lastName: { $regex: q, $options: "ix" } },
                { email: { $regex: q, $options: "ix" } },
                { contactNumber: { $regex: q, $options: "ix" } }
            ]
        }
        const users = await User.aggregate([
            {
                "$facet": {
                    data: [
                        {
                            $match: match
                        },
                        {
                            $lookup: {
                                from: 'roles',
                                localField: 'roleId',
                                foreignField: '_id',
                                as: 'userRole'
                            }
                        },
                        { $unwind: "$userRole" },
                        { $sort: sortObj },
                        {
                            $skip: offset
                        },
                        {
                            $limit: limit
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                contactNumber: 1,
                                roleId: 1,
                                role: "$userRole.roleName",
                                isDeleted: 1
                            }
                        },
                    ],
                    pagination: [
                        { $match: match },
                        { "$count": "total" }
                    ]
                }
            }
        ]);

        const data = {
            list: users[0].data,
            totalCount: 0
        }

        if (users[0].pagination.length > 0) data.totalCount = users[0].pagination[0].total

        sendResponse(res, data, OK);
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

const getUserById = async (req, res) => {
    const userId = req?.params?.id;
    try {
        if (!userId && typeof userId === "undefined") sendResponse(res, "User id missing.", BAD_REQUEST);

        const user = await User.findOne(
            { _id: userId, isDeleted: "n" },
            "_id firstName lastName email contactNumber")
            .populate("roleId", "roleName")
        if (!user) sendResponse(res, "User not found", NOT_FOUND);
        else sendResponse(res, user, OK);
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

const searchUser = async (req, res) => {
    const q = req?.params?.q;
    try {
        if (!q && typeof q === "undefined") sendResponse(res, "Search term missing.", BAD_REQUEST);

        const users = await User.find(
            {
                isDeleted: "n", $or: [
                    { firstName: { $regex: q, $options: "ix" } },
                    { lastName: { $regex: q, $options: "ix" } },
                    { email: { $regex: q, $options: "ix" } },
                    { phone: { $regex: q, $options: "ix" } }
                ]
            },
            "firstName lastName email phone")
            .populate("roleId", "roleName")
        if (!users) sendResponse(res, "User not found", NOT_FOUND);
        else sendResponse(res, users, OK);
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email) sendResponse(res, "Email is missing.", BAD_REQUEST);
        else if (!password) sendResponse(res, "Password is missing.", BAD_REQUEST);
        else {
            const user = await User.findOne(
                { email, isDeleted: "n" },
                "email password firstName lastName displayName")
                .populate("roleId", "_id roleName")

            if (!user) sendResponse(res, "Invalid credentials.", BAD_REQUEST);
            else {
                    const isValidPassword = bcrypt.compareSync(password, user.password);
                    if (!isValidPassword) sendResponse(res, "Invalid credentials.", BAD_REQUEST);
                    else {
                        const payload = {
                            id: user._id,
                            roleId: user.roleId._id,
                            roleName: user.roleId.roleName
                        };
                        const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "30d" });
                        const data = {
                            token,
                            id: user._id,
                            fullName: user.firstName + " " + user.lastName,
                            displayName : user.displayName,
                            email: user.email,
                            roleName: user.roleId.roleName,
                        }

                        sendResponse(res, data, OK);
                    }
            }
        }
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

const setPassword = async (req, res) => {
    const { otp, password, confirmPassword } = req.body;
    try {
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

const forgetPassword = async (req, res) => {
    const { email } = req.body;
    try {
    } catch (err) {
        sendResponse(res, err.message, INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    addUser,
    updateUser,
    deleteUser,
    getUsers,
    getUserById,
    userLogin,
    setPassword,
    forgetPassword,
    searchUser
}


