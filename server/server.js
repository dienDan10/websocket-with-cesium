import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({
    port: 8080,
});

// Connection Event
wss.on('connection', (socket, request) => {
    const ip = request.socket.remoteAddress;

    socket.on('message', (rawData) => {
        console.log({ rawData });
        const message = rawData.toString();

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN)
                client.send(`Server broadcast: ${message}`);
        });
    });

    socket.on('error', (err) => {
        console.error(`Error: ${err.message}: ${ip}`);
    });

    socket.on('close', () => {
        console.log('Client Disconnected');
    });
});

console.log('WebSocket server is live at: ws://localhost:8080');
