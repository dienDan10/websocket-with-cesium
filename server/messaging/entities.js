// Factory functions — tạo entity object đúng schema protocol_v2.md cho từng `kind`.
// Convention: field nullable dùng sentinel ('' cho string, 0 cho number) — không dùng null/undefined,
// đồng bộ với quyết định bên scenario-server (Qt/C++).

export function createPointUnit({
    id,
    name,
    description = '',
    position,
    heading = 0,
    speed = 0,
    coverageRadius = 0,
    faction,
    unitType,
}) {
    return {
        kind: 'point_unit',
        id,
        name,
        description,
        position,
        heading,
        speed,
        coverage_radius: coverageRadius,
        faction,
        unit_type: unitType,
    };
}

export function createPolylineUnit({ id, points, faction }) {
    return {
        kind: 'polyline_unit',
        id,
        points,
        faction,
    };
}

export function createZoneUnit({
    id,
    name,
    description = '',
    faction,
    unitType,
    boundary,
}) {
    return {
        kind: 'zone_unit',
        id,
        name,
        description,
        faction,
        unit_type: unitType,
        boundary,
    };
}

export function createCircleUnit({
    id,
    name,
    description = '',
    faction,
    unitType,
    center,
    radius,
}) {
    return {
        kind: 'circle_unit',
        id,
        name,
        description,
        faction,
        unit_type: unitType,
        center,
        radius,
    };
}
