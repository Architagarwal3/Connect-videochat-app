const socket = io("/");
const grid = document.getElementById("video-grid");
var myVideo = document.createElement("video");
const peer = new Peer();
let myStream;
let peerId;

//                peer connection
peer.on("open", function (id) {
  socket.emit("room", roomId, id);
});

//                stream
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: {
      width: { ideal: 300 },
      height: { ideal: 300 },
    },
  })
  .then(function (stream) {
    myStream = stream;
    showVideo(myStream, myVideo, peerId);
    peer.on("call", function (call) {
      call.answer(myStream);
      var video = document.createElement("video");
      call.on("stream", function (stream) {
        showVideo(stream, video, call.peer);
      });
    });
  })
  .catch(function (err) {
    console.log(err);
  });

//                show video function
function showVideo(stream, video, id) {
  video.srcObject = stream;
  video.onloadedmetadata = function (e) {
    video.play();
  };
  video.setAttribute("id", id);
  grid.append(video);
}

//              socket connections
socket.on("user-connected", (userId) => {
  addVideo(userId, myStream);
});
socket.on("user-disconnected", (id) => {
  var a = document.getElementById(id);
  a.remove();
});

//           add video function
function addVideo(userId, myStream) {
  var call = peer.call(userId, myStream);
  var video = document.createElement("video");
  call.on("stream", function (stream) {
    showVideo(stream, video, userId);
  });
  call.on("close", () => {
    video.remove();
  });
}
let text = $("input");
text.keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit("message", text.val());
    text.val("");
  }
});
socket.on("createMessage", (message) => {
  $(".messages").append(`<li class="message"><b>user:</b><br/>${message}</li>`);
  scrollToBottom();
});
const scrollToBottom = () => {
  let d = $(".chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

//                  Mute video
const muteUnmute = () => {
  const enabled = myStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".mute_button").innerHTML = html;
};

//                    leave meeting
function setHome() {
  window.location.replace("/");
}

//                      stop video
const playStop = () => {
  let enabled = myStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myStream.getVideoTracks()[0].enabled = true;
  }
};
const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".video_button").innerHTML = html;
};
const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".video_button").innerHTML = html;
};
