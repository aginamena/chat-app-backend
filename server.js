const express = require("express");
const app = express();
const userRoute = require("./routes/userRoute")

const rooms = ["general", "tech", "finance", "crypto"]
// we want the client to able to access the server
const cors = require("cors");
const Message = require("./models/Message");
const User = require("./models/User");
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

app.get("/rooms", (req, res) => {
    res.json(rooms)
})

io.on("connection", (socket) => {
    console.log(`new user has joined ${socket.id}`)
    socket.on("new-user", async () => {
        const members = await User.find();
        //sending all users in the database
        io.emit("new-user", members);
    })
    socket.on("join-room", async (room) => {
        socket.join(room)
        let roomMessages = await getLastMessagesFromRoom(room);
        roomMessages = sortRoomMessagesByDate(roomMessages);
        //sending to this specific user
        socket.emit("room-message", roomMessages)
    })
    socket.on("message-room", async (room, content, sender, time, data) => {
        await Message.create({ content, from: sender, time, data, to: room });
        let roomMessages = await getLastMessagesFromRoom(room);
        roomMessages = sortRoomMessagesByDate(roomMessages);
        //send to all clients in the room, including me
        io.to(room).emit("room-messages", roomMessages);
        //to all clients in the room except the sender. This is for notification purposes
        socket.broadcast.emit("notifications", room)
    })

    app.delete("/logout", async (req, res) => {
        try {
            const { _id, newMessage } = req.body;
            const user = await User.findById(_id);
            user.status = "offline";
            user.newMessage = newMessage;
            await user.save();
            const members = await User.find({});
            socket.brofadcast.emit("new-user", members);
            res.status(200).send();
        } catch (error) {
            console.log(error);
            res.status(400).send()
        }
    })
})

//getting all messages from all rooms
async function getLastMessagesFromRoom(room) {
    //investigate here on how aggregate works
    let roomMessages = await Message.aggregate([
        { $match: { to: room } },
        { $group: { _id: "$date", messgesByDate: { $push: "$$ROOT" } } }
    ])
    return roomMessages
}

//sorting all the messages in a room by date from oldest to newest messages
function sortRoomMessagesByDate(messages) {
    return messages.sort(function (a, b) {
        let date1 = a._id.split("/");
        let date2 = b._id.split("/");
        //sorting messages by year/month/day
        date1 = date1[2] + date1[0] + date1[1];
        date2 = date2[2] + date2[0] + date2[1];

        return date1 < date2 ? -1 : 1;
    })
}
server.listen(port, () => console.log("Server is running on part " + port))