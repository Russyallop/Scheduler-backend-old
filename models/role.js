const mongoose = require("mongoose");
const { Schema } = mongoose;
const roleSchema = new Schema({
    roleName: {
        type: String,
        enum: ["TUTOR", "STUDENT"],
        required: true,
        index: true
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
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("Role", roleSchema);