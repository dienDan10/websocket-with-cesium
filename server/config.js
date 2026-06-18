export const CONFIG = {
    PORT: 9001,

    // Timing
    TICK_INTERVAL_MS: 500, // tần suất update position (ship B + đạn)
    FIRE_DELAY_MS: 5000, // từ startSimulation() đến lúc khai hỏa
    PROJECTILE_FLIGHT_MS: 4000, // thời gian đạn bay tới khi trúng đích

    // Client setup (giống web-app/config.js hiện tại)
    TERRAIN_URL: 'http://localhost:8081',
    IMAGERY_URL: 'http://localhost:8080/tile/{z}/{x}/{y}.png',

    // AO boundary ~400x400km, vùng biển miền Trung
    AO_BOUNDARY: [
        { lon: 107.6, lat: 14.3 },
        { lon: 111.4, lat: 14.3 },
        { lon: 111.4, lat: 10.7 },
        { lon: 107.6, lat: 10.7 },
        { lon: 107.6, lat: 14.3 },
    ],

    FACTIONS: {
        RED: { id: 1, name: 'Quân đỏ', color: '#cc0000' },
        BLUE: { id: 2, name: 'Quân xanh', color: '#0044cc' },
    },

    // Mock unit_type registry — Hub thật sẽ là nguồn duy nhất, ở đây tự mock cho dev
    UNIT_TYPES: {
        ARTILLERY: {
            id: 2,
            name: 'artillery',
            icon_url: 'http://localhost:9001/icons/ship.svg',
        },
        SHIP: {
            id: 3,
            name: 'ship',
            icon_url: 'http://localhost:9001/icons/ship.svg',
        },
        PROJECTILE: {
            id: 4,
            name: 'projectile',
            icon_url: 'http://localhost:9001/icons/missile.svg',
        },
        DESTROYED: {
            id: 99,
            name: 'destroyed',
            icon_url: 'http://localhost:8090/icons/destroyed.svg',
        },
    },

    // Entity data kịch bản
    ARTILLERY: {
        id: 'ship-001',
        name: 'Tàu phòng thủ',
        position: { lon: 108.0, lat: 12.5, alt: 0 },
        heading: 90,
        coverageRadius: 150000, // mét
    },

    SHIP_A: {
        id: 'ship-a',
        name: 'Tàu địch A',
        position: { lon: 109.3, lat: 12.6, alt: 0 },
    },

    SHIP_B: {
        id: 'ship-b',
        name: 'Tàu địch B',
        position: { lon: 109.8, lat: 12.0, alt: 0 },
        heading: 250, // độ, bearing 0-360
        speed: 8, // m/s
    },
};
