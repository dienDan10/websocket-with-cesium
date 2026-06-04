const LON_RANGE = { min: 105.7, max: 106.0 };
const LAT_RANGE = { min: 20.8, max: 21.2 };

const FACTIONS = [
    { id: 1, name: 'Quân đỏ', color: '#cc0000' },
    { id: 2, name: 'Quân xanh', color: '#0044cc' },
    { id: 3, name: 'Quân vàng', color: '#ccaa00' },
];

const UNIT_TYPES = [
    { id: 1, name: 'infantry' },
    { id: 2, name: 'armor' },
    { id: 3, name: 'artillery' },
    { id: 4, name: 'recon' },
];

const CONTROL_ZONE_TYPE = { id: 5, name: 'control_zone' };

const randomInRange = (min, max) => min + Math.random() * (max - min);
const randomInt = (min, max) => Math.floor(randomInRange(min, max + 1));
const randomSign = () => (Math.random() < 0.5 ? -1 : 1);
const randomChoice = (list) => list[Math.floor(Math.random() * list.length)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const createPointUnit = (id, faction, type) => {
    const coverageRadius = type.name === 'artillery' ? 15000 : null;

    return {
        kind: 'point_unit',
        id,
        name: `Unit ${id}`,
        description: null,
        is_dynamic: true,
        position: {
            lon: randomInRange(LON_RANGE.min, LON_RANGE.max),
            lat: randomInRange(LAT_RANGE.min, LAT_RANGE.max),
            alt: 0,
        },
        coverage_radius: coverageRadius,
        faction,
        unit_type: type,
    };
};

const createZoneBoundary = () => {
    const centerLon = randomInRange(LON_RANGE.min + 0.02, LON_RANGE.max - 0.02);
    const centerLat = randomInRange(LAT_RANGE.min + 0.02, LAT_RANGE.max - 0.02);
    const vertexCount = randomInt(5, 7);
    const points = [];

    for (let i = 0; i < vertexCount; i += 1) {
        const angle = randomInRange(0, Math.PI * 2);
        const radius = randomInRange(0.01, 0.03);
        const lon = clamp(
            centerLon + Math.cos(angle) * radius,
            LON_RANGE.min,
            LON_RANGE.max,
        );
        const lat = clamp(
            centerLat + Math.sin(angle) * radius,
            LAT_RANGE.min,
            LAT_RANGE.max,
        );
        points.push({ lon, lat });
    }

    points.push({ ...points[0] }); // đóng polygon
    return points;
};

const createZoneUnit = (id, faction) => ({
    kind: 'zone_unit',
    id,
    name: `Zone ${id}`,
    description: null,
    faction,
    unit_type: CONTROL_ZONE_TYPE,
    boundary: createZoneBoundary(),
});

let idCounter = 1;
const nextId = () => `unit-${String(idCounter++).padStart(4, '0')}`;

const pointUnits = [];
FACTIONS.forEach((faction) => {
    for (let i = 0; i < 100; i += 1) {
        pointUnits.push(
            createPointUnit(nextId(), faction, randomChoice(UNIT_TYPES)),
        );
    }
});

const zoneUnits = [];
const zoneCounts = [7, 7, 6];
FACTIONS.forEach((faction, index) => {
    for (let i = 0; i < zoneCounts[index]; i += 1) {
        zoneUnits.push(createZoneUnit(nextId(), faction));
    }
});

export const INITIAL_ENTITIES = [...pointUnits, ...zoneUnits];

export const DYNAMIC_UNIT_IDS = pointUnits.map((unit) => unit.id);

export const MOVEMENT_DELTA = Object.fromEntries(
    DYNAMIC_UNIT_IDS.map((unitId) => {
        const dLon = randomSign() * randomInRange(0.00003, 0.00008);
        const dLat = randomSign() * randomInRange(0.00003, 0.00008);
        return [unitId, { dLon, dLat }];
    }),
);

export const LATE_ENTITY = pointUnits[pointUnits.length - 1];
export const REMOVE_ENTITY_ID = pointUnits[0].id;
