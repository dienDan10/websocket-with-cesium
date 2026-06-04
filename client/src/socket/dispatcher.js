import {
    handleEntityAdd,
    handleEntityAddBulk,
    handleEntityUpdatePosition,
    handleEntityRemove,
    handleEntityClear,
} from '../cesium/handlers/entityHandler';
import { handleFlyTo, handleSetCamera } from '../cesium/handlers/cameraHandler';
import { clearEntities } from '../cesium/entityManager';

const handlers = {
    'ENTITY.ADD': (msg) => handleEntityAdd(msg),
    'ENTITY.ADD_BULK': (msg) => handleEntityAddBulk(msg),
    'ENTITY.UPDATE.POSITION': (msg) => handleEntityUpdatePosition(msg),
    'ENTITY.REMOVE': (msg) => handleEntityRemove(msg),
    'ENTITY.CLEAR': () => handleEntityClear(),
    'CAMERA.FLY_TO': (msg) => handleFlyTo(msg.payload),
    'CAMERA.SET': (msg) => handleSetCamera(msg.payload),
    'SCENE.CLEAR_ALL': () => clearEntities(),
};

export function dispatch(message) {
    const handler = handlers[message.type];
    if (handler) {
        handler(message);
    } else {
        console.warn('Unknown message type:', message.type);
    }
}
