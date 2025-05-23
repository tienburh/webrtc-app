const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// Định tuyến HTTP cơ bản
app.get("/", (req, res) => {
  res.send("WebRTC signaling server is running ✅");
});

// Thiết lập WebSocket
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
    // Gửi tin nhắn đến tất cả các client khác
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Lắng nghe trên cổng được chỉ định bởi Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
