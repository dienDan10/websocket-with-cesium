/// <reference path="../../../public/Cesium/index.d.ts" />
import { getViewer } from '../viewer';

export function handleFlyTo(payload) {
    const { lon, lat, alt = 10000, duration = 2.0 } = payload;
    getViewer().camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
        duration,
    });
}

export function handleSetCamera(payload) {
    const { lon, lat, alt = 10000 } = payload;
    getViewer().camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
    });
}
