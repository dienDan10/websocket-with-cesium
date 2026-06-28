import { useEffect, useRef } from 'react';
import { buildProjection } from './projectionUtil';
import { drawTiles } from './tileUtils';
import { drawAOBoundary, drawEntities, drawViewport } from './drawCanvas';
import { getViewer } from '../../../cesium/viewer';

const _tileCache = new Map();

export function useMinimapCanvas({
    aoBoundary,
    canvasRef,
    canvasSize,
    tileUrl,
    redrawInterval,
}) {
    const projRef = useRef(null);
    const tilesDrawnRef = useRef(false);

    // Build projection + vẽ tile nền một lần
    useEffect(() => {
        if (!aoBoundary || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        const proj = buildProjection(aoBoundary, canvasSize, canvasSize);
        projRef.current = proj;
        tilesDrawnRef.current = false;

        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        drawTiles(ctx, proj, canvasSize, canvasSize, tileUrl, _tileCache).then(
            () => {
                tilesDrawnRef.current = true;
            },
        );
    }, [aoBoundary, canvasRef, canvasSize, tileUrl]);

    // Redraw dynamic layer theo interval
    useEffect(() => {
        if (!aoBoundary || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        let tileSnapshot = null;

        const draw = () => {
            const proj = projRef.current;
            if (!proj) return;

            if (tilesDrawnRef.current && !tileSnapshot) {
                tileSnapshot = ctx.getImageData(0, 0, canvasSize, canvasSize);
            }

            if (tileSnapshot) {
                ctx.putImageData(tileSnapshot, 0, 0);
            } else {
                ctx.fillStyle = '#1a2a1a';
                ctx.fillRect(0, 0, canvasSize, canvasSize);
            }

            drawAOBoundary(ctx, proj, aoBoundary);
            drawEntities(ctx, proj);

            try {
                drawViewport(ctx, proj, getViewer());
            } catch {
                // viewer chưa sẵn sàng
            }
        };

        const intervalId = setInterval(draw, redrawInterval);
        draw();
        return () => clearInterval(intervalId);
    }, [aoBoundary, canvasRef, canvasSize, tileUrl, redrawInterval]);

    return projRef;
}
