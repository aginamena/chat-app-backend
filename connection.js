const mongoose = require("mongoose");
require("dotenv").config();

//we store all our private key in .env files
const url = `mongodb+srv://aginamena:${process.env.DATABASE_PASSWORD}@cluster0.trfy6oc.mongodb.net/MernChatApp`
mongoose.connect(url, () => console.log("Connected to database"))