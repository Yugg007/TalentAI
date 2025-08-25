import React from 'react'
import SimplePeer from 'simple-peer';


const WebSocket = () => {
    const socket = useRef(null);
    const localVideoRef = useRef();
    const peerRef = useRef();

    useEffect(() => {
        socket.current = new WebSocket("ws://localhost:8080/ws");

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            localVideoRef.current.srcObject = stream;

            const peer = new SimplePeer({ initiator: true, trickle: false, stream });

            peer.on("signal", data => {
                socket.current.send(JSON.stringify({ type: "signal", data }));
            });

            socket.current.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === "signal") {
                    peer.signal(msg.data);
                }
            };

            peerRef.current = peer;
        });
    }, []);
    return (
        <video className="video-box" autoPlay muted ref={localVideoRef}></video>
    )
}

export default WebSocket