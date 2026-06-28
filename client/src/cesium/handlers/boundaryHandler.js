import { getViewer } from '../viewer';
import { useStore } from '../../store/index';
import { initGraticule } from '../overlay/graticule';

export function handleInitBoundary(aoBoundary) {
    const viewer = getViewer();
    useStore.getState().setAoBoundary(aoBoundary);
    createAOMask(viewer, aoBoundary);
    drawAOOutline(viewer, aoBoundary);
    flyToAO(viewer, aoBoundary);
    initCameraLock(viewer, aoBoundary);
    initGraticule(aoBoundary);
}

// ------------------------------------------------------------
// 1. Mask làm tối vùng ngoài AO
// ------------------------------------------------------------
function createAOMask(viewer, aoBoundary) {
    const lons = aoBoundary.map((p) => p.lon);
    const lats = aoBoundary.map((p) => p.lat);
    const PADDING = 20; // độ — chỉnh tùy ý, càng lớn mask càng phủ rộng

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
            material: Cesium.Color.BLACK,
            classificationType: Cesium.ClassificationType.TERRAIN,
        },
    });
}

function drawAOOutline(viewer, boundary, color = Cesium.Color.YELLOW) {
    const polyline = boundary.map((p) =>
        Cesium.Cartesian3.fromDegrees(p.lon, p.lat),
    );
    return viewer.entities.add({
        polyline: {
            positions: polyline,
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

    const targetPoint = Cesium.Cartesian3.fromDegrees(
        (Math.min(...lons) + Math.max(...lons)) / 2,
        Math.min(...lats),
        80000,
    );

    viewer.camera.setView({
        destination: targetPoint,
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-18),
            roll: 0,
        },
    });
}

// ------------------------------------------------------------
// 3. Restrict camera movement trong AO
// ------------------------------------------------------------
function initCameraLock(viewer, aoBoundary) {
    // Tính bbox của AO
    const lons = aoBoundary.map((p) => p.lon);
    const lats = aoBoundary.map((p) => p.lat);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Buffer nhỏ để camera không sát rìa
    const BUFFER = 0.1; // độ

    viewer.scene.preRender.addEventListener(() => {
        const camera = viewer.camera;

        //======================  Bounding box lock  ==========================
        // Lấy điểm camera đang nhìn (ground look-at point) (giữa màn hình)
        const centerWindow = new Cesium.Cartesian2(
            viewer.scene.canvas.clientWidth / 2,
            viewer.scene.canvas.clientHeight / 2,
        );

        const pickRay = camera.getPickRay(centerWindow);
        const targetPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
        if (!targetPosition) return;

        const carto =
            Cesium.Ellipsoid.WGS84.cartesianToCartographic(targetPosition);
        const lon = Cesium.Math.toDegrees(carto.longitude);
        const lat = Cesium.Math.toDegrees(carto.latitude);

        // Clamp về trong AO nếu ra ngoài
        const clampedLon = Cesium.Math.clamp(
            lon,
            minLon - BUFFER,
            maxLon + BUFFER,
        );
        const clampedLat = Cesium.Math.clamp(
            lat,
            minLat - BUFFER,
            maxLat + BUFFER,
        );

        // dịch chuyển camera nếu look at point ra ngoài AO
        const EPS = 1e-6; // độ — tránh jitter khi camera sát rìa
        if (
            Math.abs(clampedLon - lon) > EPS ||
            Math.abs(clampedLat - lat) > EPS
        ) {
            // Tính offset cần dịch chuyển
            const currentPos = camera.position.clone();
            const currentCarto = Cesium.Cartographic.fromCartesian(currentPos);

            const deltaLon = Cesium.Math.toRadians(clampedLon - lon);
            const deltaLat = Cesium.Math.toRadians(clampedLat - lat);

            camera.setView({
                destination: Cesium.Cartesian3.fromRadians(
                    currentCarto.longitude + deltaLon,
                    currentCarto.latitude + deltaLat,
                    currentCarto.height,
                ),
                orientation: {
                    heading: camera.heading,
                    pitch: camera.pitch,
                    roll: camera.roll,
                },
            });
        }

        //====================== Pitch lock  ==========================
        // const FIXED_PITCH = Cesium.Math.toRadians(-18);
        // if (Math.abs(camera.pitch - FIXED_PITCH) > Cesium.Math.toRadians(0.1)) {
        //     camera.setView({
        //         orientation: {
        //             heading: camera.heading,
        //             pitch: FIXED_PITCH,
        //             roll: camera.roll,
        //         },
        //     });
        // }
    });
}
