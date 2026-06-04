import { INITIAL_ENTITIES } from '../data/entities.js';

export function buildSnapshot() {
    return {
        type: 'ENTITY.ADD_BULK',
        payload: INITIAL_ENTITIES,
    };
}
