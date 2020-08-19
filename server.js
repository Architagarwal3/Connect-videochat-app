const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
let url;
app.set("view engine", "ejs");
app.use(express.static("public"));
const server = app.listen(process.env.PORT || 3000);
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  socket.on("room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (e) => {
      socket.emit("createMessage", e);
      socket.to(roomId).emit("createMessage", e);
    });
    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

app.get("/", (req, res) => {
  res.render("home");
});
app.post("/host", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});
app.post("/join", (req, res) => {
  res.render("join");
});
app.post("/redirect", (req, res) => {
  url = req.body.link;
  res.redirect(url);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
