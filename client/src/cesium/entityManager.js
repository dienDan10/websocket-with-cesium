/// <reference path="../../public/Cesium/index.d.ts" />

import { getViewer } from './viewer';

const _entities = new Map(); // Map<id, entity>

export function addEntity(data) {
    const viewer = getViewer();
    const { id, kind } = data;

    if (viewer.entities.getById(id)) {
        console.warn(`Entity ${id} đã tồn tại — bỏ qua`);
        return;
    }

    if (kind === 'point_unit') {
        _addPointUnit(viewer, id, data);
    } else if (kind === 'zone_unit') {
        _addZoneUnit(viewer, id, data);
    } else if (kind === 'polyline_unit') {
        _addPolylineUnit(viewer, id, data);
    } else {
        console.warn(`Unknown kind: ${kind}`);
    }
}

function _addPointUnit(viewer, id, data) {
    const { position, faction, name, coverage_radius } = data;

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
        ...(coverage_radius > 0
            ? {
                  ellipse: {
                      semiMajorAxis: coverage_radius,
                      semiMinorAxis: coverage_radius,
                      material: Cesium.Color.fromCssColorString(
                          faction?.color ?? '#ffffff',
                      ).withAlpha(0.25),
                      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                  },
              }
            : {}),
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

function _addPolylineUnit(viewer, id, data) {
    const { points, faction } = data;
    const routes = points.flatMap(({ lon, lat, alt }) => [lon, lat, alt ?? 0]);
    const routeEntity = viewer.entities.add({
        id: id,
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(routes),
            width: 4, // Độ rộng đường (pixel)
            material: Cesium.Color.fromCssColorString(
                faction?.color ?? '#ffffff',
            ), // Màu theo faction
            clampToGround: false, // Không bám sát mặt đất để dễ nhìn
        },
    });

    _entities.set(id, routeEntity);
}

export function updateEntity(payload) {
    payload.forEach(({ id, position, heading, speed }) => {
        const entity = _entities.get(id);
        if (!entity) {
            console.warn(`Entity ${id} không tồn tại — bỏ qua updateEntity`);
            return;
        }
        if (position) {
            const { lon, lat, alt = 0 } = position;
            entity.position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
        }
        if (heading) {
            entity.heading = heading;
        }
        if (speed) {
            entity.speed = speed;
        }
    });
}

export function updateEntityStatus(payload) {
    for (const { id } of payload) {
        const entity = _entities.get(id);
        if (!entity) continue;

        entity.billboard.color = Cesium.Color.WHITE.withAlpha(0.3);
    }
}

export function removeEntity(id) {
    _entities.delete(id);
    getViewer().entities.removeById(id);
}

export function clearEntities() {
    _entities.clear();
    getViewer().entities.removeAll();
}
