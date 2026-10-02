import { Socket } from "socket.io-client";

const Property = {
    BasePath: import.meta.env.VITE_BASE_PATH || "http://localhost:7001",
    SpringBackendPath: `${import.meta.env.VITE_BASE_PATH || "https://localhost:7006"}/api/v1/core`,
    NodeBackendPath: `${import.meta.env.VITE_BASE_PATH || "http://localhost:7007"}`,
    SocketPath: `${import.meta.env.VITE_BASE_PATH || "http://localhost:7007"}/socket.io`,
    
}

export default Property;