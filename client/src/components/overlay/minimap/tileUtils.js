// -------------------------------------------------------
// Vẽ tile map lên canvas
// -------------------------------------------------------

import { DEFAULT_ZOOM } from './minimapConfig';

export async function drawTiles(
    ctx,
    proj,
    canvasW,
    canvasH,
    tileUrl,
    tileCache = new Map(),
) {
    const { minLon, maxLon, minLat, maxLat } = proj;
    const zoom = DEFAULT_ZOOM;

    const x0 = lon2tile(minLon, zoom);
    const x1 = lon2tile(maxLon, zoom);
    const y0 = lat2tile(maxLat, zoom);
    const y1 = lat2tile(minLat, zoom);

    const promises = [];
    for (let tx = x0; tx <= x1; tx++) {
        for (let ty = y0; ty <= y1; ty++) {
            const url = tileUrl
                .replace('{z}', zoom)
                .replace('{x}', tx)
                .replace('{y}', ty);

            // Tính vị trí tile trong Mercator space
            const tileMercLeft = tx / Math.pow(2, zoom); // tọa độ Mercator của cạnh trái tile
            const tileMercTop = ty / Math.pow(2, zoom); // tọa độ Mercator của cạnh trên tile
            const tileMercRight = (tx + 1) / Math.pow(2, zoom); // tọa độ Mercator của cạnh phải tile
            const tileMercBottom = (ty + 1) / Math.pow(2, zoom); // tọa độ Mercator của cạnh dưới tile

            // Project góc tile ra canvas pixel
            const { tl, scale, offsetX, offsetY } = proj;
            const px = offsetX + (tileMercLeft - tl.x) * scale; // vị trí pixel đẩu tiên của trục x trong canvas ứng với tile
            const py = offsetY + (tileMercTop - tl.y) * scale; // vị trí pixel đẩu tiên của trục y trong canvas ứng với tile
            const pw = (tileMercRight - tileMercLeft) * scale; // width của tile tính bằng pixel
            const ph = (tileMercBottom - tileMercTop) * scale; // height của tile tính bằng pixel

            promises.push(
                fetchTile(url, tileCache).then((img) => {
                    if (img) ctx.drawImage(img, px, py, pw, ph);
                }),
            );
        }
    }

    await Promise.all(promises);
}

// -------------------------------------------------------
// Tile helpers
// -------------------------------------------------------

// tính xem với tọa độ lon này và zoom level này thì tile x nào chứa nó
function lon2tile(lon, zoom) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

// tính xem với tọa độ lat này và zoom level này thì tile y nào chứa nó
function lat2tile(lat, zoom) {
    return Math.floor(
        ((1 -
            Math.log(
                Math.tan((lat * Math.PI) / 180) +
                    1 / Math.cos((lat * Math.PI) / 180),
            ) /
                Math.PI) /
            2) *
            Math.pow(2, zoom),
    );
}

/*
 * Lấy tile image từ url, cache lại để không fetch lại lần nữa sau khi đã fetch xong
 * và khi gọi lại hàm với cùng url thì trả về Promise<Image> đã cache
 * url: url của tile image
 * tileCache: Map cache tile image, key là url, value là Promise<Image>
 */
function fetchTile(url, tileCache = new Map()) {
    if (tileCache.has(url)) return tileCache.get(url);
    const promise = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
    tileCache.set(url, promise);
    return promise;
}

/*
 * Tính zoom level nhỏ nhất mà tất cả các tile chứa các tọa độ (minLon, minLat) và (maxLon, maxLat) vẫn vừa trong canvas có kích thước canvasSize x canvasSize
 * minLon, maxLon: kinh độ cực tây và cực đông của bounding box
 * minLat, maxLat: vĩ độ cực nam và cực bắc của bounding box
 * canvasSize: kích thước canvas (width hoặc height, là pixel)
 */
// function calcZoom(minLon, maxLon, minLat, maxLat, canvasSize) {
//     // const drawSize = canvasSize - MINIMAP_PADDING * 2;
//     // for (let z = 10; z >= 1; z--) {
//     //     const x0 = lon2tile(minLon, z);
//     //     const x1 = lon2tile(maxLon, z);
//     //     const y0 = lat2tile(maxLat, z); // lat lớn → tile nhỏ hơn
//     //     const y1 = lat2tile(minLat, z);
//     //     const tileCountX = x1 - x0 + 1;
//     //     const tileCountY = y1 - y0 + 1;
//     //     const pixelW = tileCountX * 256;
//     //     const pixelH = tileCountY * 256;
//     //     // Chọn zoom nhỏ nhất mà tất cả tile vẫn vừa trong canvas (có buffer)
//     //     if (pixelW >= drawSize * 1.5 && pixelH >= drawSize * 1.5) {
//     //         console.log('calcZoom', { minLon, maxLon, minLat, maxLat, z });
//     //         return z;
//     //     }
//     // }
//     return DEFAULT_ZOOM;
// }
