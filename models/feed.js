const mongoose = require("mongoose")

const feedSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    newpost: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Feed", feedSchema)