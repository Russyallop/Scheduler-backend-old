const express = require("express");
const roleRouter = express.Router();
const roleController = require("./controllers/role");

roleRouter.post("/", roleController.addRole);
roleRouter.get("/", roleController.list);

module.exports = roleRouter;