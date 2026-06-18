import {
    addEntity,
    updateEntity,
    removeEntity,
    clearEntities,
    updateEntityStatus,
} from '../entityManager';

export function handleEntityAdd(payload) {
    payload.forEach((item) => addEntity(item));
}

export function handleEntityUpdatePosition(payload) {
    updateEntity(payload);
}

export function handleEntityUpdateUnitStatus(payload) {
    updateEntityStatus(payload);
}

export function handleEntityRemove(payload) {
    removeEntity(payload.id);
}

export function handleEntityClear() {
    clearEntities();
}
