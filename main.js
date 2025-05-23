let localStream, remoteStream, peerConnection, socket;
let yourName = "", targetName = "";

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

document.getElementById("join-btn").onclick = async () => {
    yourName = document.getElementById("your-name").value;
    targetName = document.getElementById("target-name").value;

    if (!yourName || !targetName) {
        alert("Please enter both your name and target name.");
        return;
    }

    socket = new WebSocket("ws://WebRTC.onrender.com");

    socket.onopen = () => {
        socket.send(JSON.stringify({ type: "join", name: yourName }));
        document.getElementById("start-call").disabled = false;
    };

    socket.onmessage = async (msg) => {
        let data = JSON.parse(msg.data);

        switch (data.type) {
            case "offer":
                await createPeerConnection();
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                sendToServer({ type: "answer", answer, target: data.name });
                break;

            case "answer":
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
                break;

            case "candidate":
                if (data.candidate) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
                break;
        }
    };
};

document.getElementById("start-call").onclick = async () => {
    await createPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendToServer({ type: "offer", offer, target: targetName });
};

async function createPeerConnection() {
    peerConnection = new RTCPeerConnection(servers);

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    remoteStream = new MediaStream();

    document.getElementById("local-video").srcObject = localStream;
    document.getElementById("remote-video").srcObject = remoteStream;

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendToServer({ type: "candidate", candidate: event.candidate, target: targetName });
        }
    };
}

function sendToServer(msg) {
    msg.name = yourName;
    socket.send(JSON.stringify(msg));
}
