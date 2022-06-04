const express = require("express");
const app = express();
const userRoute = require("./routes/userRoute")

const rooms = ["general", "tech", "finance", "crypto"]
// we want the client to able to access the server
const cors = require("cors");
app.use(cors());

//we need express.urlencoded and express.json for POSTS and PUT requests
//we are telling the server to accept the object sent from the from the client
//which is stored in the body
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

//connecting to the database
require("./connection")

app.use("/user/", userRoute)

const server = require("http").createServer(app)
const port = 5000
const io = require("socket.io")(server, {
    cors: {
        // where the client is located
        origin: "http://localhost:3000",
        methods: ["Get", "Post"]
    }
})

server.listen(port, () => console.log("Server is running on part " + port))