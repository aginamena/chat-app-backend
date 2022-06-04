const mongoose = require("mongoose");
require("dotenv").config();

const url = `mongodb+srv://aginamena:${process.env.DATABASE_PASSWORD}@cluster0.trfy6oc.mongodb.net/MernChatApp`

mongoose.connect(url, error => {
    if (error) console.log("error exists", error)
    else console.log("Connected to the database")
})