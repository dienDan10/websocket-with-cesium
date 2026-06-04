import { INITIAL_ENTITIES, DYNAMIC_UNIT_IDS } from './data/entities.js';
import { buildSnapshot } from './events/snapshot.js';
import { buildMovementUpdates } from './events/movement.js';
import { buildAddEntity, buildRemoveEntity } from './events/lifecycle.js';

export class Simulator {
    constructor(broadcast) {
        // broadcast(message) — gửi tới tất cả client đang connect
        this.broadcast = broadcast;

        // Giữ position state của các dynamic unit
        this.positions = {};
        for (const entity of INITIAL_ENTITIES) {
            if (DYNAMIC_UNIT_IDS.includes(entity.id)) {
                this.positions[entity.id] = { ...entity.position };
            }
        }

        this.movementTimer = null;
        this.addTimer = null;
        this.removeTimer = null;
    }

    // Gửi snapshot đến một client vừa connect
    sendSnapshot(client) {
        const snapshot = buildSnapshot();
        client.send(JSON.stringify(snapshot));
        console.log(
            `[Simulator] Sent snapshot (${snapshot.payload.length} entities)`,
        );
    }

    // Bắt đầu chạy kịch bản
    start() {
        if (this.movementTimer) return; // đã chạy rồi

        console.log('[Simulator] Scenario started', new Date().toISOString());

        // Movement loop
        this.movementTimer = setInterval(() => {
            const updates = buildMovementUpdates(this.positions);
            this.broadcast(updates);
        }, process.env.MOVEMENT_INTERVAL_MS);

        // Thêm unit mới sau 15 giây
        this.addTimer = setTimeout(() => {
            const msg = buildAddEntity();
            this.broadcast(msg);
            console.log(`[Simulator] Added entity: ${msg.id}`);
        }, process.env.ADD_ENTITY_AFTER_MS);

        // Xóa unit sau 30 giây
        this.removeTimer = setTimeout(() => {
            const msg = buildRemoveEntity();
            this.broadcast(msg);
            delete this.positions[msg.id];
            console.log(
                `[Simulator] Removed entity: ${msg.id}`,
                new Date().toISOString(),
            );
        }, process.env.REMOVE_ENTITY_AFTER_MS);
    }

    stop() {
        clearInterval(this.movementTimer);
        clearTimeout(this.addTimer);
        clearTimeout(this.removeTimer);
        this.movementTimer = null;
        console.log('[Simulator] Scenario stopped');
    }
}
