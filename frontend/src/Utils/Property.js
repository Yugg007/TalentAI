const gatewayBaseUrl = (
    import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:7002"
).replace(/\/+$/, "");

const Property = {
    BasePath: gatewayBaseUrl,
    SpringBackendPath: `${gatewayBaseUrl}/api/v1/core`,
    NodeBackendPath: `${gatewayBaseUrl}/api/v1/comm`,
    SocketPath: "/socket.io",
};

export default Property;