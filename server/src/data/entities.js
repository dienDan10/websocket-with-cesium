// Tọa độ quanh khu vực Hà Nội
export const INITIAL_ENTITIES = [
    {
        kind: 'point_unit',
        id: 'unit-001',
        name: 'Tiểu đoàn bộ binh 1',
        description: 'Đơn vị bộ binh chủ lực',
        is_dynamic: true,
        position: { lon: 105.8412, lat: 21.0245, alt: 0 },
        coverage_radius: null,
        faction: { id: 1, name: 'Quân đỏ', color: '#cc0000' },
        unit_type: { id: 1, name: 'infantry' },
    },
    {
        kind: 'point_unit',
        id: 'unit-002',
        name: 'Tiểu đoàn bộ binh 2',
        description: null,
        is_dynamic: true,
        position: { lon: 105.8534, lat: 21.0312, alt: 0 },
        coverage_radius: null,
        faction: { id: 1, name: 'Quân đỏ', color: '#cc0000' },
        unit_type: { id: 1, name: 'infantry' },
    },
    {
        kind: 'point_unit',
        id: 'unit-003',
        name: 'Trung đoàn pháo binh 4',
        description: 'Pháo binh tầm xa',
        is_dynamic: false,
        position: { lon: 105.8623, lat: 21.0178, alt: 0 },
        coverage_radius: 15000,
        faction: { id: 1, name: 'Quân đỏ', color: '#cc0000' },
        unit_type: { id: 2, name: 'artillery' },
    },
    {
        kind: 'zone_unit',
        id: 'unit-004',
        name: 'Vùng kiểm soát phía Bắc',
        description: 'Khu vực phòng thủ',
        faction: { id: 2, name: 'Quân xanh', color: '#0044cc' },
        unit_type: { id: 3, name: 'control_zone' },
        boundary: [
            { lon: 105.87, lat: 21.05 },
            { lon: 105.91, lat: 21.05 },
            { lon: 105.91, lat: 21.02 },
            { lon: 105.87, lat: 21.02 },
            { lon: 105.87, lat: 21.05 },
        ],
    },
];

// Unit xuất hiện sau 15 giây
export const LATE_ENTITY = {
    kind: 'point_unit',
    id: 'unit-005',
    name: 'Đại đội trinh sát 7',
    description: 'Xuất hiện sau 15 giây',
    is_dynamic: true,
    position: { lon: 105.829, lat: 21.0401, alt: 0 },
    coverage_radius: null,
    faction: { id: 2, name: 'Quân xanh', color: '#0044cc' },
    unit_type: { id: 4, name: 'recon' },
};

// ID của unit bị xóa sau 30 giây
export const REMOVE_ENTITY_ID = 'unit-002';

// Các unit dynamic sẽ di chuyển
export const DYNAMIC_UNIT_IDS = ['unit-001', 'unit-002'];

// Vector di chuyển mỗi tick (độ)
export const MOVEMENT_DELTA = {
    'unit-001': { dLon: 0.0008, dLat: 0.0005 },
    'unit-002': { dLon: -0.0006, dLat: 0.0007 },
};
