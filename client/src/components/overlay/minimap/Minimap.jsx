import { useRef } from 'react';
import { useStore } from '../../../store/index';
import { getViewer } from '../../../cesium/viewer';

import {
    CANVAS_SIZE,
    METERS_PER_DEGREE,
    REDRAW_INTERVAL,
    TILE_URL,
} from './minimapConfig';
import Direction from './Direction';
import MapCorners from './MapCorners';
import { useMinimapCanvas } from './useMinimapCanvas';

export default function Minimap() {
    const aoBoundary = useStore((state) => state.aoBoundary);
    const canvasRef = useRef(null);

    const projRef = useMinimapCanvas({
        aoBoundary,
        canvasRef,
        canvasSize: CANVAS_SIZE,
        tileUrl: TILE_URL,
        redrawInterval: REDRAW_INTERVAL,
    });

    // Click/drag → fly camera
    const handleMouseEvent = (e) => {
        const proj = projRef.current;
        if (!proj || !aoBoundary) return;

        if (e.type === 'click' || (e.type === 'mousemove' && e.buttons === 1)) {
            const rect = canvasRef.current.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;

            // Ngược lại projection: pixel → Mercator → lon/lat
            const mx = (px - proj.offsetX) / proj.scale + proj.tl.x;
            const my = (py - proj.offsetY) / proj.scale + proj.tl.y;

            const lon = mx * 360 - 180;
            const lat =
                (Math.atan(Math.sinh(Math.PI * (1 - 2 * my))) * 180) / Math.PI;

            try {
                const viewer = getViewer();
                const camera = viewer.camera;
                const currentAlt = camera.positionCartographic.height;
                const currentPich = camera.pitch; // pitch ở đây sẽ âm vì đang nghìn nghiêng
                const currentHeading = camera.heading;

                // Khoảng cách ngang từ camera đến look at point
                const goundDistance = currentAlt / Math.tan(-currentPich);
                const eyeLon =
                    lon -
                    ((goundDistance / METERS_PER_DEGREE) *
                        Math.sin(currentHeading)) /
                        Math.cos((lat * Math.PI) / 180);
                const eyeLat =
                    lat -
                    (goundDistance / METERS_PER_DEGREE) *
                        Math.cos(currentHeading);

                camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        eyeLon,
                        eyeLat,
                        currentAlt,
                    ),
                    orientation: {
                        heading: currentHeading,
                        pitch: currentPich,
                        roll: camera.roll,
                    },
                    duration: 0.3,
                });
            } catch {
                // viewer chưa init
            }
        }
    };

    console.log('Minimap render', aoBoundary);
    if (!aoBoundary) return null;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 24,
                right: 24,
                width: CANVAS_SIZE,
                height: CANVAS_SIZE,
                cursor: 'crosshair',
            }}
        >
            {/* Border mỏng */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-1px',
                    border: '1px solid rgba(100, 159, 255, 0.58)',
                    pointerEvents: 'none',
                    zIndex: 2,
                }}
            />
            {/* Corner accents */}
            <MapCorners />
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onClick={handleMouseEvent}
                onMouseMove={handleMouseEvent}
            />
            <Direction />
        </div>
    );
}
