// Các hàm tính toán hình học đơn giản (flat-earth) — đủ dùng cho demo,
// KHÔNG cần chính xác geodesic vì sau này có service riêng lo tính quỹ đạo thật.

const METERS_PER_DEG_LAT = 111320;

function metersPerDegLon(lat) {
    return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

// Dịch một điểm theo bearing (độ, 0 = Bắc, 90 = Đông) và khoảng cách (mét)
export function moveByBearing(position, headingDeg, distanceMeters) {
    const rad = (headingDeg * Math.PI) / 180;
    const dNorth = distanceMeters * Math.cos(rad);
    const dEast = distanceMeters * Math.sin(rad);

    const dLat = dNorth / METERS_PER_DEG_LAT;
    const dLon = dEast / metersPerDegLon(position.lat);

    return {
        lon: position.lon + dLon,
        lat: position.lat + dLat,
        alt: position.alt ?? 0,
    };
}

// Nội suy tuyến tính lon/lat giữa 2 điểm theo progress 0..1,
// alt chạy theo hình sin (0 -> peak -> 0) để có dáng đạn đạo.
export function interpolateBallistic(from, to, progress, peakAlt) {
    const lon = from.lon + (to.lon - from.lon) * progress;
    const lat = from.lat + (to.lat - from.lat) * progress;
    const baseAlt = from.alt + (to.alt - from.alt) * progress;
    const arcAlt = peakAlt * Math.sin(Math.PI * progress);

    return { lon, lat, alt: baseAlt + arcAlt };
}

// Sample n điểm dọc theo arc để vẽ polyline trajectory tĩnh
export function sampleBallisticPath(from, to, peakAlt, steps = 10) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        points.push(interpolateBallistic(from, to, progress, peakAlt));
    }
    return points;
}
