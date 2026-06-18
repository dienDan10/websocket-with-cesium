import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

// Chỉ lo transport: start server, accept connection, parse JSON, broadcast.
// Không biết gì về nghiệp vụ — nhận được COMMAND.* thì emit ra ngoài, để
// MapServer (orchestrator) quyết định làm gì.
export class MapSocket extends EventEmitter {
    constructor() {
        super();
        this._wss = null;
        this._clients = new Set();
    }

    start(serverOrPort, fallbackPort) {
        if (typeof serverOrPort === 'number') {
            this._wss = new WebSocketServer({ port: serverOrPort });
        } else {
            this._wss = new WebSocketServer({ server: serverOrPort });
            serverOrPort.listen(fallbackPort);
        }

        this._wss.on('connection', (client) => {
            console.log('[mapSocket] client connected');
            this._clients.add(client);
            this.emit('clientConnected', client);

            client.on('message', (raw) => {
                let message;
                try {
                    message = JSON.parse(raw.toString());
                } catch (err) {
                    console.warn(
                        '[mapSocket] message không phải JSON hợp lệ:',
                        raw.toString(),
                    );
                    return;
                }
                this.emit('command', message, client);
            });

            client.on('close', () => {
                console.log('[mapSocket] client disconnected');
                this._clients.delete(client);
            });

            client.on('error', (err) => {
                console.warn('[mapSocket] client error:', err.message);
            });
        });

        const port =
            typeof serverOrPort === 'number' ? serverOrPort : fallbackPort;
        console.log(`[mapSocket] listening on ws://localhost:${port}`);
    }

    broadcast(message) {
        const raw = JSON.stringify(message);
        for (const client of this._clients) {
            if (client.readyState === client.OPEN) {
                client.send(raw);
            }
        }
    }

    sendTo(client, message) {
        if (this._clients.has(client) && client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    }

    stop() {
        for (const client of this._clients) {
            client.close();
        }
        this._clients.clear();
        this._wss?.close();
    }
}
