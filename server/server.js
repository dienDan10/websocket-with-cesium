import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { Simulator } from './src/simulator.js';

dotenv.config();

const wss = new WebSocketServer({
    port: process.env.PORT,
});

function broadcast(message) {
    const data = JSON.stringify(message);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

const simulator = new Simulator(broadcast);

// Connection Event
wss.on('connection', (socket) => {
    //const ip = request.socket.remoteAddress;
    console.log(`[Server] Client connected (total: ${wss.clients.size})`);

    simulator.sendSnapshot(socket);

    simulator.start();

    socket.on('close', () => {
        console.log(
            `[Server] Client disconnected (total: ${wss.clients.size})`,
        );

        // Dừng kịch bản khi không còn client nào
        if (wss.clients.size === 0) {
            simulator.stop();
        }
    });

    socket.on('error', (err) => {
        console.error('[Server] WebSocket error:', err.message);
    });
});

console.log(`WebSocket server is live at: ws://localhost:${process.env.PORT}`);
