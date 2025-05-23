const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

let users = {};

wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        let data = JSON.parse(message);

        switch (data.type) {
            case "join":
                users[data.name] = ws;
                ws.name = data.name;
                break;

            case "offer":
            case "answer":
            case "candidate":
                if (users[data.target]) {
                    users[data.target].send(JSON.stringify(data));
                }
                break;
        }
    });

    ws.on("close", () => {
        delete users[ws.name];
    });
});

console.log("WebSocket signaling server running...");
