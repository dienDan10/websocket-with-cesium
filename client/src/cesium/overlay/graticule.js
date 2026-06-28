import { getViewer } from '../viewer.js';

// ---------------------------------------------------------------------------
// Graticule — lưới kinh vĩ độ, tự động scale interval theo altitude camera
// ---------------------------------------------------------------------------
// Public API:
//   initGraticule(aoBoundary)   — gọi sau handleInitBoundary()
//   destroyGraticule()          — dọn dẹp khi unmount / scene clear
//
// Chiến lược performance:
//   - Pre-build TẤT CẢ intervals lúc init → mỗi interval = 1 GroundPolylinePrimitive
//     (gom nhiều GeometryInstance vào 1 primitive = 1 draw call thay vì N draw calls)
//   - Khi camera đổi altitude → chỉ show/hide primitive, không rebuild
//   - Tổng: 7 draw calls cố định, không spike khi zoom
// ---------------------------------------------------------------------------

/**
 * Mỗi entry là một interval với primitive đường và label collection riêng.
 * @type {{ interval: number, primitive: Cesium.GroundPolylinePrimitive, labels: Cesium.LabelCollection }[]}
 */
let _sets = [];

/** @type {(() => void) | null} */
let _removeListener = null;

/** Index của set đang hiện, dùng để skip update nếu không đổi */
let _activeIndex = null;

// ---------------------------------------------------------------------------
// Lookup table interval theo altitude (mét)
// ---------------------------------------------------------------------------
const INTERVAL_TABLE = [
    { maxAlt: Infinity, interval: 2.0 },
    { maxAlt: 800_000, interval: 1.0 },
    { maxAlt: 400_000, interval: 0.5 },
    { maxAlt: 150_000, interval: 0.25 },
    { maxAlt: 60_000, interval: 0.1 },
    { maxAlt: 25_000, interval: 0.05 },
    { maxAlt: 10_000, interval: 0.02 },
];

const LINE_COLOR = new Cesium.Color(1.0, 1.0, 1.0, 0.25);
const LABEL_COLOR = new Cesium.Color(1.0, 1.0, 1.0, 0.75);
const LABEL_OUTLINE = new Cesium.Color(0.0, 0.0, 0.0, 0.8);
const LINE_WIDTH = 1.5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getActiveIndex(altitudeMeters) {
    for (let i = INTERVAL_TABLE.length - 1; i >= 0; i--) {
        if (altitudeMeters < INTERVAL_TABLE[i].maxAlt) return i;
    }
    return 0;
}

function snapCeil(value, step) {
    return Math.ceil(value / step) * step;
}

function formatDeg(deg, axis) {
    const abs = Math.abs(deg);
    const suffix =
        axis === 'lon' ? (deg >= 0 ? 'E' : 'W') : deg >= 0 ? 'N' : 'S';
    return `${parseFloat(abs.toFixed(6))}°${suffix}`;
}

// ---------------------------------------------------------------------------
// Build một set cho một interval cụ thể
// Gom tất cả đường vào 1 GroundPolylinePrimitive (= 1 draw call)
// ---------------------------------------------------------------------------

function buildSet(viewer, interval, bounds) {
    const { minLon, maxLon, minLat, maxLat } = bounds;
    const instances = [];
    const labels = new Cesium.LabelCollection();

    // --- Kinh tuyến ---
    const firstLon = snapCeil(minLon, interval);
    for (let lon = firstLon; lon <= maxLon + 1e-9; lon += interval) {
        lon = parseFloat(lon.toFixed(8));

        instances.push(
            new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        lon,
                        minLat,
                        lon,
                        maxLat,
                    ]),
                    width: LINE_WIDTH,
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                        LINE_COLOR,
                    ),
                },
            }),
        );

        labels.add({
            position: Cesium.Cartesian3.fromDegrees(lon, minLat),
            text: formatDeg(lon, 'lon'),
            font: '11px monospace',
            fillColor: LABEL_COLOR,
            outlineColor: LABEL_OUTLINE,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, 10),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
        });
    }

    // --- Vĩ tuyến ---
    const firstLat = snapCeil(minLat, interval);
    for (let lat = firstLat; lat <= maxLat + 1e-9; lat += interval) {
        lat = parseFloat(lat.toFixed(8));

        instances.push(
            new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        minLon,
                        lat,
                        maxLon,
                        lat,
                    ]),
                    width: LINE_WIDTH,
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                        LINE_COLOR,
                    ),
                },
            }),
        );

        labels.add({
            position: Cesium.Cartesian3.fromDegrees(minLon, lat),
            text: formatDeg(lat, 'lat'),
            font: '11px monospace',
            fillColor: LABEL_COLOR,
            outlineColor: LABEL_OUTLINE,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(-6, 0),
            horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
        });
    }

    // 1 primitive duy nhất cho toàn bộ đường của interval này
    const primitive = new Cesium.GroundPolylinePrimitive({
        geometryInstances: instances,
        appearance: new Cesium.PolylineColorAppearance(),
        asynchronous: false,
        show: false, // ẩn mặc định, chỉ hiện set active
    });

    viewer.scene.primitives.add(primitive);
    viewer.scene.primitives.add(labels);
    labels.show = false;

    return { interval, primitive, labels };
}

// ---------------------------------------------------------------------------
// Camera listener — chỉ show/hide, không rebuild
// ---------------------------------------------------------------------------

function onCameraChange() {
    const viewer = getViewer();
    const alt = viewer.camera.positionCartographic.height;
    const idx = getActiveIndex(alt);

    if (idx === _activeIndex) return;

    // Ẩn set cũ
    if (_activeIndex !== null) {
        _sets[_activeIndex].primitive.show = false;
        _sets[_activeIndex].labels.show = false;
    }

    // Hiện set mới
    _sets[idx].primitive.show = true;
    _sets[idx].labels.show = true;
    _activeIndex = idx;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * @param {{ lon: number, lat: number }[]} aoBoundary
 */
export function initGraticule(aoBoundary) {
    if (_sets.length > 0) destroyGraticule();

    const lons = aoBoundary.map((p) => p.lon);
    const lats = aoBoundary.map((p) => p.lat);
    const bounds = {
        minLon: Math.min(...lons),
        maxLon: Math.max(...lons),
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
    };

    const viewer = getViewer();

    // Pre-build tất cả intervals — xảy ra 1 lần lúc init
    for (const { interval } of INTERVAL_TABLE) {
        _sets.push(buildSet(viewer, interval, bounds));
    }

    // Kích hoạt set phù hợp với altitude hiện tại
    const alt = viewer.camera.positionCartographic.height;
    const idx = getActiveIndex(alt);
    _sets[idx].primitive.show = true;
    _sets[idx].labels.show = true;
    _activeIndex = idx;

    _removeListener = viewer.camera.changed.addEventListener(onCameraChange);
}

export function destroyGraticule() {
    if (_removeListener) {
        _removeListener();
        _removeListener = null;
    }

    const viewer = getViewer();
    for (const { primitive, labels } of _sets) {
        viewer.scene.primitives.remove(primitive);
        viewer.scene.primitives.remove(labels);
    }
    _sets = [];
    _activeIndex = null;
}
