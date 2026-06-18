/// <reference path="../../public/Cesium/index.d.ts" />

let _viewer = null;

export function initViewer(containerId) {
    if (_viewer) {
        console.warn('Viewer đã được init rồi');
        return _viewer;
    }

    _viewer = new Cesium.Viewer(containerId, {
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        //baseLayer: false,
        terrain: Cesium.Terrain.fromWorldTerrain(),
    });

    _viewer.cesiumWidget.creditContainer.style.display = 'none';

    return _viewer;
}

export function getViewer() {
    if (!_viewer)
        throw new Error('Viewer chưa được init — gọi initViewer() trước');
    return _viewer;
}
