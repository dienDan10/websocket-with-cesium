import { DYNAMIC_UNIT_IDS, MOVEMENT_DELTA } from '../data/entities.js';

export function buildMovementUpdates(positions) {
    const messages = {
        type: 'ENTITY.UPDATE.POSITION',
        payload: [],
    };
    const now = new Date().toISOString();

    for (const id of DYNAMIC_UNIT_IDS) {
        const current = positions[id];
        if (!current) continue;

        const delta = MOVEMENT_DELTA[id];
        const updated = {
            lon: current.lon + delta.dLon,
            lat: current.lat + delta.dLat,
            alt: current.alt,
        };

        messages.payload.push({
            id: id,
            position: { ...updated, recorded_at: now },
        });

        // Cập nhật lại position trong state
        positions[id] = updated;
    }

    return messages;
}
