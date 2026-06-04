/// <reference path="../../public/Cesium/index.d.ts" />

import { getViewer } from './viewer';

const _entities = new Map(); // Map<id, entity>

export function addEntity(id, kind, data) {
    const viewer = getViewer();

    if (viewer.entities.getById(id)) {
        console.warn(`Entity ${id} đã tồn tại — bỏ qua`);
        return;
    }

    if (kind === 'point_unit') {
        _addPointUnit(viewer, id, data);
    } else if (kind === 'zone_unit') {
        _addZoneUnit(viewer, id, data);
    } else {
        console.warn(`Unknown kind: ${kind}`);
    }
}

function _addPointUnit(viewer, id, data) {
    const { position, faction, name } = data;

    const entity = viewer.entities.add({
        id,
        name,
        position: Cesium.Cartesian3.fromDegrees(
            position.lon,
            position.lat,
            position.alt ?? 0,
        ),
        billboard: {
            image: _buildColoredDot(faction?.color ?? '#ffffff'),
            width: 32,
            height: 32,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        label: {
            text: name,
            font: '13px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -36),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                500000,
            ),
        },
    });

    _entities.set(id, entity);
}

function _buildColoredDot(hexColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fillStyle = hexColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    return canvas.toDataURL();
}

function _addZoneUnit(viewer, id, data) {
    const { boundary, faction, name } = data;

    const positions = boundary.flatMap(({ lon, lat }) => [lon, lat]);
    const color = Cesium.Color.fromCssColorString(faction?.color ?? '#ffffff');

    const entity = viewer.entities.add({
        id,
        name,
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
            material: color.withAlpha(0.25),
            outline: true,
            outlineColor: color,
            outlineWidth: 2,
        },
    });

    _entities.set(id, entity);
}

export function updateEntity(payload) {
    payload.forEach(({ id, position }) => {
        const entity = _entities.get(id);
        if (!entity) {
            console.warn(`Entity ${id} không tồn tại — bỏ qua updateEntity`);
            return;
        }
        if (position) {
            const { lon, lat, alt = 0 } = position;
            entity.position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
        }
    });
}

export function removeEntity(id) {
    _entities.delete(id);
    getViewer().entities.removeById(id);
}

export function clearEntities() {
    _entities.clear();
    getViewer().entities.removeAll();
}
