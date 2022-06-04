const router = require("express").Router();
const User = require("../models/User")


//create user
router.post("/", async (req, res) => {
    try {
        const { name, email, password, picture } = req.body;
        const user = await User.create({ name, email, password, picture })
        // we call the toJSON method on this object
        res.status(201).json(user);
    } catch (error) {
        console.log("error exits", error)
        let message = error.code == 11000 ? "User already exists" : error.message;
        res.status(400).json(message);
    }
})

//login user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        //find the email and password of the user and update the status as online
        const user = await User.findOneAndUpdate({ email: email, password: password }, { status: "online" });
        // user.status = "online";
        // since we've changed a properity in the document, we have to save it
        // await user.save();
        // we call the toJSON method on this object
        res.status(200).json(user);
    } catch (error) {
        res.status(200).json(error.message)
    }
})

module.exports = router