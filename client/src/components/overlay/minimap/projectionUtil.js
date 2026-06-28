// -------------------------------------------------------
// Projection: lon/lat → canvas pixel
// -------------------------------------------------------

import { MINIMAP_PADDING } from './minimapConfig';

export function buildProjection(aoBoundary, canvasW, canvasH) {
    // Tính bbox của AO
    const lons = aoBoundary.map((p) => p.lon);
    const lats = aoBoundary.map((p) => p.lat);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Project 4 góc bbox ra Mercator
    const tl = lonLatToMercator(minLon, maxLat); // top-left
    const br = lonLatToMercator(maxLon, minLat); // bottom-right

    const mercW = br.x - tl.x; // width tính bằng Mercator
    const mercH = br.y - tl.y; // height tính bằng Mercator

    // Padding để AO không sát mép canvas
    const PADDING = MINIMAP_PADDING;
    const drawW = canvasW - PADDING * 2; // width tính bằng pixel
    const drawH = canvasH - PADDING * 2; // height tính bằng pixel

    // Giữ aspect ratio
    const scaleX = drawW / mercW; // scale factor từ Mercator → pixel theo chiều ngang
    const scaleY = drawH / mercH; // scale factor từ Mercator → pixel theo chiều dọc
    const scale = Math.min(scaleX, scaleY);

    // Tính offset để AO nằm giữa canvas
    const offsetX = PADDING + (drawW - mercW * scale) / 2;
    const offsetY = PADDING + (drawH - mercH * scale) / 2;

    return {
        project(lon, lat) {
            const m = lonLatToMercator(lon, lat);
            return {
                x: offsetX + (m.x - tl.x) * scale,
                y: offsetY + (m.y - tl.y) * scale,
            };
        },
        minLon,
        maxLon,
        minLat,
        maxLat,
        tl,
        br,
        scale,
        offsetX,
        offsetY,
        mercW,
        mercH,
    };
}

/*
 * Mecator projection: lon/lat → Mercator
 * chuyển đổi từ kinh độ vĩ độ sang tọa độ Mercator (x, y) trong khoảng [0, 1]
 * làm vậy để có thể vẽ lên canvas với pixel, vì lon/lat không tuyến tính
 * Công thức dựa trên Web Mercator projection
 * https://en.wikipedia.org/wiki/Web_Mercator_projection
 * x = (lon + 180) / 360
 * y = (1 - log(tan(lat * pi / 180) + 1 / cos(lat * pi / 180)) / pi) / 2
 */
function lonLatToMercator(lon, lat) {
    const x = (lon + 180) / 360;
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const y = (1 - Math.log((1 + sinLat) / (1 - sinLat)) / (2 * Math.PI)) / 2;
    return { x, y };
}
