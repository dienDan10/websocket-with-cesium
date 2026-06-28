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
    _viewer.scene.skyBox.show = false;
    _viewer.scene.skyAtmosphere.show = false;
    _viewer.scene.backgroundColor = Cesium.Color.BLACK;

    _viewer.scene.screenSpaceCameraController.maximumZoomDistance = 500000;

    // Removes the default left-click object picking behavior
    _viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );

    // Removes the default left-double-click camera tracking behavior
    _viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );

    // _viewer.imageryLayers.addImageryProvider(
    //     new Cesium.GridImageryProvider({
    //         cells: 1,
    //         color: new Cesium.Color(1.0, 1.0, 1.0, 0.4), // màu đường kẻ
    //         backgroundColor: Cesium.Color.TRANSPARENT,
    //     }),
    // );

    return _viewer;
}

export function getViewer() {
    if (!_viewer)
        throw new Error('Viewer chưa được init — gọi initViewer() trước');
    return _viewer;
}
