import {
    addEntity,
    updateEntity,
    removeEntity,
    clearEntities,
} from '../entityManager';

export function handleEntityAdd(message) {
    addEntity(message.id, message.kind, message.payload);
}

export function handleEntityAddBulk(message) {
    message.payload.forEach((item) => {
        addEntity(item.id, item.kind, item);
    });
}

export function handleEntityUpdatePosition(message) {
    updateEntity(message.payload);
}

export function handleEntityRemove(message) {
    removeEntity(message.id);
}

export function handleEntityClear() {
    clearEntities();
}
