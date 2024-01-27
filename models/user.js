const mongoose = require("mongoose");
const { Schema } = mongoose;
const usersSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: false,
    default: ""
  },
  email: {
    type: String,
    required: true,
    lowercase: true, //Always store data in lowercase
    index: true
  },
  contactNumber: {
    type: String,
    required: false,
    default: null
  },
  address: {
    type: String,
    required: false,
    default: null
  },
  displayName: {
    type: String,
    required: false,
    default: null
  },
  description: {
    type: String,
    required: false,
    default: null
  },
  profilePic: {
    type: String,
    required: false,
    default: null
  },
  password: {
    type: String,
    required: false,
    minlength: 6
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
    index: true
  },
  verificationCode: {
    type: String,
    default: null
  },
  verified: {
    type: String,
    index: true,
    enum: ["y", "n"],
    default: 'n',
    required: true
  },
  userStatus: {
    type: String,
    index: true,
    enum: ["active", "suspended", "deleted"],
    default: 'active',
    required: true
  },
  otp:{
    type: String,
    default: ""
  },
  isDeleted: {
    type: String,
    enum: ["n", "y"],
    default: "n"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // immutable:true //This field value can not be modifed once added
  },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("User", usersSchema);
