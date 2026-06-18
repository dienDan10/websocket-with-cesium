import express from 'express';
import http from 'http';
import { CONFIG } from './config.js';
import { MapSocket } from './socket/mapSocket.js';
import { ScenarioEngine } from './engine/scenarioEngine.js';

const app = express();
app.use('/icons', express.static('./icons'));

const httpServer = http.createServer(app);

const mapSocket = new MapSocket();
const engine = new ScenarioEngine();

// Engine phát message → broadcast cho mọi client đang connect
engine.on('message', (message) => {
    mapSocket.broadcast(message);
});

// Client gửi lệnh → map sang action tương ứng trên engine.
// Đây là namespace riêng cho dev/demo tool — KHÔNG nằm trong protocol_v2.md chính thức,
// vì Hub thật không nhận lệnh kiểu này từ Cesium client.
mapSocket.on('command', (message) => {
    switch (message.type) {
        case 'COMMAND.LOAD_SCENARIO':
            console.log('[server] nhận COMMAND.LOAD_SCENARIO');
            engine.loadScenario();
            break;
        case 'COMMAND.START_SIMULATION':
            console.log('[server] nhận COMMAND.START_SIMULATION');
            engine.startSimulation();
            break;
        default:
            console.warn('[server] command không xác định:', message.type);
    }
});

mapSocket.start(httpServer, CONFIG.PORT);
