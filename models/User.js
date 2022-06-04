const mongoose = require("mongoose");
const { isEmail } = require("validator"); // we want to validate the user's email
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Can't be blank"] // required true with and error message
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "Can't be blank"],
        // we want to retrive the user by index
        index: true,
        validate: [isEmail, "invalid email"]
    },
    password: {
        type: String,
        required: [true, "Can't be blank"]
    },
    picture: {
        //gotten from cloudinary
        type: String
    },
    newMessage: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        default: "online"
    }
}, { minimize: false })

//whenever we create a new user, we hash the password
UserSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        })
    })
})

// we don't want to send back the users password whenever the server sends
// the users info back to the client
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.Object();
    delete userObject.password;
    return userObject
}
//creating findByCredentials function. we
UserSchema.static.findByCredentials = async function (email, password) {
    const user = await User.findOne({ email });
    // if user is not in the user collection then we return error
    if (!user) throw new Error("invalid email or password");
    // if we reach here that means the users email is valid.
    // we now have to check the password
    // if this users password isn't the same was the password the user entered
    // when trying to log in, we return an error
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("invalid email or password");
    return user;
}

module.exports = mongoose.model("User", UserSchema)