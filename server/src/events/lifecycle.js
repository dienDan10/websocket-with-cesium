import { LATE_ENTITY, REMOVE_ENTITY_ID } from '../data/entities.js';

export function buildAddEntity() {
    return {
        type: 'ENTITY.ADD',
        kind: LATE_ENTITY.kind,
        id: LATE_ENTITY.id,
        payload: LATE_ENTITY,
    };
}

export function buildRemoveEntity() {
    return {
        type: 'ENTITY.REMOVE',
        id: REMOVE_ENTITY_ID,
    };
}
