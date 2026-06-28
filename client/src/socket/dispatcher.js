import {
    handleEntityAdd,
    handleEntityUpdatePosition,
    handleEntityRemove,
    handleEntityUpdateUnitStatus,
} from '../cesium/handlers/entityHandler';
import { handleInitBoundary } from '../cesium/handlers/boundaryHandler';

const handlers = {
    INIT: (payload) => handleInitBoundary(payload.ao_boundary),
    'ENTITY.ADD': (payload) => handleEntityAdd(payload),
    'ENTITY.UPDATE.POSITION': (payload) => handleEntityUpdatePosition(payload),
    'ENTITY.UPDATE.UNIT_TYPE': (payload) =>
        handleEntityUpdateUnitStatus(payload),
    'ENTITY.REMOVE': (payload) => handleEntityRemove(payload),
};

export function dispatch(message) {
    // console.log(message);
    const handler = handlers[message.type];
    if (handler) {
        handler(message.payload);
    } else {
        console.warn('Unknown message type:', message.type);
    }
}
