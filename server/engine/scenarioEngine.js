import { EventEmitter } from 'events';
import { CONFIG } from '../config.js';
import { createPointUnit, createPolylineUnit } from '../messaging/entities.js';
import {
    buildInit,
    buildEntityAdd,
    buildPositionUpdate,
    buildUnitTypeUpdate,
    buildRemove,
} from '../messaging/messageBuilder.js';
import {
    moveByBearing,
    sampleBallisticPath,
    interpolateBallistic,
} from './movement.js';

const STATES = {
    IDLE: 'IDLE',
    READY: 'READY',
    SIMULATING: 'SIMULATING',
    FINISHED: 'FINISHED',
};

export class ScenarioEngine extends EventEmitter {
    constructor() {
        super();
        this.state = STATES.IDLE;

        // Vị trí runtime — mutable, khác với config gốc (chỉ là giá trị khởi tạo)
        this._shipBPosition = { ...CONFIG.SHIP_B.position };

        this._shipMoveInterval = null;
        this._fireTimeout = null;
        this._projectileInterval = null;
        this._projectileTimeout = null;
    }

    _emitMessage(message) {
        this.emit('message', message);
    }

    loadScenario() {
        if (this.state !== STATES.IDLE) {
            console.warn(
                `[engine] loadScenario() bị gọi sai state: ${this.state}`,
            );
            return;
        }

        this._emitMessage(
            buildInit({
                terrainUrl: CONFIG.TERRAIN_URL,
                imageryUrl: CONFIG.IMAGERY_URL,
                aoBoundary: CONFIG.AO_BOUNDARY,
            }),
        );

        const artillery = createPointUnit({
            id: CONFIG.ARTILLERY.id,
            name: CONFIG.ARTILLERY.name,
            position: CONFIG.ARTILLERY.position,
            heading: CONFIG.ARTILLERY.heading,
            coverageRadius: CONFIG.ARTILLERY.coverageRadius,
            faction: CONFIG.FACTIONS.RED,
            unitType: CONFIG.UNIT_TYPES.ARTILLERY,
        });

        const shipA = createPointUnit({
            id: CONFIG.SHIP_A.id,
            name: CONFIG.SHIP_A.name,
            position: CONFIG.SHIP_A.position,
            faction: CONFIG.FACTIONS.BLUE,
            unitType: CONFIG.UNIT_TYPES.SHIP,
        });

        const shipB = createPointUnit({
            id: CONFIG.SHIP_B.id,
            name: CONFIG.SHIP_B.name,
            position: this._shipBPosition,
            heading: CONFIG.SHIP_B.heading,
            speed: CONFIG.SHIP_B.speed,
            faction: CONFIG.FACTIONS.BLUE,
            unitType: CONFIG.UNIT_TYPES.SHIP,
        });

        this._emitMessage(buildEntityAdd([artillery, shipA, shipB]));

        this._startShipBMovement();

        this.state = STATES.READY;
    }

    startSimulation() {
        if (this.state !== STATES.READY) {
            console.warn(
                `[engine] startSimulation() bị gọi sai state: ${this.state}`,
            );
            return;
        }

        this.state = STATES.SIMULATING;
        this._fireTimeout = setTimeout(
            () => this._fire(),
            CONFIG.FIRE_DELAY_MS,
        );
    }

    _startShipBMovement() {
        const dtSec = CONFIG.TICK_INTERVAL_MS / 1000;

        this._shipMoveInterval = setInterval(() => {
            this._shipBPosition = moveByBearing(
                this._shipBPosition,
                CONFIG.SHIP_B.heading,
                CONFIG.SHIP_B.speed * dtSec,
            );

            this._emitMessage(
                buildPositionUpdate([
                    {
                        id: CONFIG.SHIP_B.id,
                        position: this._shipBPosition,
                        heading: CONFIG.SHIP_B.heading,
                        speed: CONFIG.SHIP_B.speed,
                    },
                ]),
            );
        }, CONFIG.TICK_INTERVAL_MS);
    }

    _fire() {
        const artilleryPos = CONFIG.ARTILLERY.position;
        const shipAPos = CONFIG.SHIP_A.position;
        // Chốt vị trí tàu B ngay lúc bắn — quỹ đạo không track theo realtime (deferred theo scenario.md)
        const shipBTargetPos = { ...this._shipBPosition };

        const PEAK_ALT = 7000;
        // offset nhỏ để 2 viên đạn cùng target không trùng line tuyệt đối
        const spread = 0.003;

        this._projectiles = [
            {
                id: 'proj-a1',
                from: artilleryPos,
                to: shipAPos,
                offset: -spread,
            },
            { id: 'proj-a2', from: artilleryPos, to: shipAPos, offset: spread },
            {
                id: 'proj-b1',
                from: artilleryPos,
                to: shipBTargetPos,
                offset: -spread,
            },
            {
                id: 'proj-b2',
                from: artilleryPos,
                to: shipBTargetPos,
                offset: spread,
            },
        ].map((p) => ({
            ...p,
            to: { ...p.to, lon: p.to.lon + p.offset },
        }));

        const projectileEntities = this._projectiles.map((p) =>
            createPointUnit({
                id: p.id,
                name: 'Đạn pháo',
                position: { ...p.from },
                faction: CONFIG.FACTIONS.RED,
                unitType: CONFIG.UNIT_TYPES.PROJECTILE,
            }),
        );

        const trajectoryEntities = this._projectiles.map((p) =>
            createPolylineUnit({
                id: `traj-${p.id}`,
                points: sampleBallisticPath(p.from, p.to, PEAK_ALT, 10),
                faction: CONFIG.FACTIONS.RED,
            }),
        );

        this._emitMessage(
            buildEntityAdd([...projectileEntities, ...trajectoryEntities]),
        );

        const startTime = Date.now();

        this._projectileInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / CONFIG.PROJECTILE_FLIGHT_MS, 1);

            const updates = this._projectiles.map((p) => {
                const pos = interpolateBallistic(
                    p.from,
                    p.to,
                    progress,
                    PEAK_ALT,
                );
                return { id: p.id, position: pos, heading: 0, speed: 0 };
            });

            this._emitMessage(buildPositionUpdate(updates));
        }, CONFIG.TICK_INTERVAL_MS);

        this._projectileTimeout = setTimeout(
            () => this._onHit(),
            CONFIG.PROJECTILE_FLIGHT_MS,
        );
    }

    _onHit() {
        clearInterval(this._projectileInterval);
        this._projectileInterval = null;

        for (const p of this._projectiles) {
            this._emitMessage(buildRemove(p.id));
        }

        this._emitMessage(
            buildUnitTypeUpdate([
                {
                    id: CONFIG.SHIP_A.id,
                    unit_type: CONFIG.UNIT_TYPES.DESTROYED,
                },
                {
                    id: CONFIG.SHIP_B.id,
                    unit_type: CONFIG.UNIT_TYPES.DESTROYED,
                },
            ]),
        );

        clearInterval(this._shipMoveInterval);
        this._shipMoveInterval = null;

        this.state = STATES.FINISHED;
    }
}
