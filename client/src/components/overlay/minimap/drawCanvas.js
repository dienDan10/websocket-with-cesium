import { getAllEntities } from '../../../cesium/entityManager';
import { getCameraViewportCorners } from './viewportUtil';

export function drawAOBoundary(ctx, proj, aoBoundary) {
    ctx.beginPath();
    aoBoundary.forEach(({ lon, lat }, i) => {
        const { x, y } = proj.project(lon, lat);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(160, 0, 0, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
}

export function drawEntities(ctx, proj) {
    const entities = getAllEntities(); // Map<id, { lon, lat, faction, kind }>
    entities.forEach(({ lon, lat, faction, kind }) => {
        if (kind !== 'point_unit') return;
        const { x, y } = proj.project(lon, lat);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = faction?.color ?? '#ffffff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });
}

export function drawViewport(ctx, proj, viewer) {
    const camera = viewer.camera;

    // Vẽ dot vị trí camera
    const camCarto = camera.positionCartographic;
    const camLon = Cesium.Math.toDegrees(camCarto.longitude);
    const camLat = Cesium.Math.toDegrees(camCarto.latitude);
    const camPixel = proj.project(camLon, camLat);

    ctx.beginPath();
    ctx.arc(camPixel.x, camPixel.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // vẽ frustum camera
    const corners = getCameraViewportCorners(viewer);
    if (corners.some((c) => c === null)) return; // camera nhìn ra ngoài globe

    const pixels = corners.map(({ lon, lat }) => proj.project(lon, lat));

    ctx.beginPath();
    ctx.moveTo(pixels[0].x, pixels[0].y);
    pixels.slice(1).forEach(({ x, y }) => ctx.lineTo(x, y));
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 100, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
}
