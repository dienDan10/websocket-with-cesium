// Nơi duy nhất build envelope JSON theo protocol_v2.md.
// Engine không tự serialize — luôn gọi qua đây.

export function buildInit({ terrainUrl, imageryUrl, aoBoundary }) {
    return {
        type: 'INIT',
        payload: {
            terrain_url: terrainUrl,
            imagery_url: imageryUrl,
            ao_boundary: aoBoundary,
        },
    };
}

// entities: array các object tạo từ entities.js — luôn array, dù 1 hay nhiều
export function buildEntityAdd(entities) {
    return {
        type: 'ENTITY.ADD',
        payload: entities,
    };
}

// updates: [{ id, position: { lon, lat, alt }, heading, speed }]
export function buildPositionUpdate(updates) {
    return {
        type: 'ENTITY.UPDATE.POSITION',
        payload: updates,
    };
}

// updates: [{ id, unit_type: { id, name, icon_url } }]
export function buildUnitTypeUpdate(updates) {
    return {
        type: 'ENTITY.UPDATE.UNIT_TYPE',
        payload: updates,
    };
}

export function buildRemove(id) {
    return {
        type: 'ENTITY.REMOVE',
        payload: { id },
    };
}

export function buildClear() {
    return { type: 'ENTITY.CLEAR' };
}
