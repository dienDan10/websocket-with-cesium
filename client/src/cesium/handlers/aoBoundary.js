import { getViewer } from '../viewer';

export function handleInitBoundary(aoBoundary) {
    const viewer = getViewer();
    drawAOOutline(viewer, aoBoundary);
    createAOMask(viewer, aoBoundary);
    flyToAO(viewer, aoBoundary);
}

// ------------------------------------------------------------
// 1. Mask làm tối vùng ngoài AO
// ------------------------------------------------------------
function createAOMask(viewer, aoBoundary) {
    const lons = aoBoundary.map((p) => p.lon);
    const lats = aoBoundary.map((p) => p.lat);
    const PADDING = 5; // độ — chỉnh tùy ý, càng lớn mask càng phủ rộng

    const minLons = Math.min(...lons);
    const maxLons = Math.max(...lons);
    const minLats = Math.min(...lats);
    const maxLats = Math.max(...lats);

    const outerRing = [
        Cesium.Cartesian3.fromDegrees(minLons - PADDING, minLats - PADDING), // góc dưới trái
        Cesium.Cartesian3.fromDegrees(maxLons + PADDING, minLats - PADDING), // góc dưới phải
        Cesium.Cartesian3.fromDegrees(maxLons + PADDING, maxLats + PADDING), // góc trên phải
        Cesium.Cartesian3.fromDegrees(minLons - PADDING, maxLats + PADDING), // góc trên trái
    ];

    const holePositions = aoBoundary.map((p) =>
        Cesium.Cartesian3.fromDegrees(p.lon, p.lat),
    );

    const hierarchy = new Cesium.PolygonHierarchy(outerRing, [
        new Cesium.PolygonHierarchy(holePositions),
    ]);

    return viewer.entities.add({
        polygon: {
            hierarchy,
            material: Cesium.Color.BLACK.withAlpha(0.6),
            classificationType: Cesium.ClassificationType.TERRAIN,
        },
    });
}

function drawAOOutline(viewer, boundary, color = Cesium.Color.YELLOW) {
    return viewer.entities.add({
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(
                boundary.flatMap((p) => [p.lon, p.lat]),
            ),
            width: 3,
            material: color,
            clampToGround: true,
            // Bám đúng terrain thật, không bám lên 3D tileset (nhà cửa...)
            // nếu sau này scene có thêm tileset — nhất quán với mask.
            classificationType: Cesium.ClassificationType.TERRAIN,
        },
    });
}
// ------------------------------------------------------------
// 2. Fly camera về AO lúc init
// ------------------------------------------------------------
function flyToAO(viewer, aoBoundary) {
    const lons = aoBoundary.map((p) => p.lon);
    const lats = aoBoundary.map((p) => p.lat);

    viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(
            Math.min(...lons),
            Math.min(...lats),
            Math.max(...lons),
            Math.max(...lats),
        ),
        duration: 2.0,
    });
}
