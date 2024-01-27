const express = require("express");
const userRouter = express.Router();
const auth = require('./middlewares/auth');
const userController = require("./controllers/user");

userRouter.post("/", userController.addUser);
userRouter.put("/:id", auth, userController.updateUser);
userRouter.delete("/:id", auth, userController.deleteUser);
userRouter.get("/", auth, userController.getUsers);
userRouter.get("/:id", auth, userController.getUserById);
userRouter.get("/search/:q", auth, userController.searchUser);
userRouter.post("/login", userController.userLogin);
userRouter.post("/password/set", userController.setPassword);
userRouter.post("/password/forget", userController.forgetPassword);

module.exports = userRouter;