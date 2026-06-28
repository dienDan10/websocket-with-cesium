// -------------------------------------------------------
// Viewport indicator: tính 4 góc frustum của camera
// -------------------------------------------------------

export function getCameraViewportCorners(viewer) {
    const canvas = viewer.canvas;
    const corners = [
        new Cesium.Cartesian2(0, 0),
        new Cesium.Cartesian2(canvas.width, 0),
        new Cesium.Cartesian2(canvas.width, canvas.height),
        new Cesium.Cartesian2(0, canvas.height),
    ];

    return corners.map((corner) => {
        const cartesian = viewer.camera.pickEllipsoid(corner);
        if (!cartesian) return null;
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        return {
            lon: Cesium.Math.toDegrees(carto.longitude),
            lat: Cesium.Math.toDegrees(carto.latitude),
        };
    });
}
