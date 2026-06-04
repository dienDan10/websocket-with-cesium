# WebSocket Protocol — Military Map Viewer

## Tổng quan

Giao tiếp giữa Hub Server và CesiumJS Client qua WebSocket. Client là "dumb terminal" — chỉ render, không có logic nghiệp vụ. Server là single source of truth.

---

## Envelope Pattern

Mọi message đều có cùng cấu trúc envelope:

```json
{
    "type": "ENTITY.ADD",
    "kind": "point_unit",
    "id": "unit-001",
    "payload": { ... }
}
```

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `type` | Có | Namespace xác định loại message |
| `kind` | Không | Phân loại entity, chỉ có trong ENTITY.ADD và ENTITY.ADD_BULK |
| `id` | Không | ID của entity, chỉ có trong ENTITY.ADD và ENTITY.REMOVE |
| `payload` | Có | Data thực sự, schema khác nhau theo `type` và `kind` |

`kind` nằm ở envelope (không trong payload) vì nó ảnh hưởng đến routing logic ở client, không phải data thuần túy.

---

## Namespace

```
ENTITY.ADD                  ← runtime, thêm một entity mới
ENTITY.ADD_BULK             ← snapshot load, thêm nhiều entity một lúc
ENTITY.UPDATE.POSITION      ← update vị trí, luôn là array dù chỉ có 1 item
ENTITY.UPDATE.UNIT_TYPE     ← update loại unit, luôn là array dù chỉ có 1 item
ENTITY.REMOVE               ← xóa một entity
ENTITY.CLEAR                ← xóa toàn bộ entity

CAMERA.FLY_TO               ← bay camera đến vị trí
CAMERA.SET                  ← set camera ngay lập tức

SCENE.CLEAR_ALL             ← reset toàn bộ scene
```

---

## Flow kết nối

```
Client connect
    ↓
Server gửi ENTITY.ADD_BULK (toàn bộ snapshot)
    ↓
Client render hết lên màn hình
    ↓
Server gửi ENTITY.UPDATE.POSITION / ENTITY.ADD / ENTITY.REMOVE khi có thay đổi
```

---

## ENTITY.ADD_BULK

Dùng khi client vừa connect — gửi toàn bộ snapshot một lần. Payload là array, mỗi item có đủ `kind`, `id`, và data để render ngay.

```json
{
    "type": "ENTITY.ADD_BULK",
    "payload": [
        {
            "kind": "point_unit",
            "id": "unit-001",
            "name": "Tiểu đoàn 3",
            "description": "Đơn vị bộ binh chủ lực",
            "is_dynamic": true,
            "position": {
                "lon": 106.6297,
                "lat": 10.8231,
                "alt": 0
            },
            "coverage_radius": 5000,
            "faction": {
                "id": 1,
                "name": "Quân đỏ",
                "color": "#cc0000"
            },
            "unit_type": {
                "id": 2,
                "name": "infantry"
            }
        },
        {
            "kind": "zone_unit",
            "id": "unit-003",
            "name": "Vùng kiểm soát A",
            "description": "Khu vực phòng thủ phía bắc",
            "faction": {
                "id": 2,
                "name": "Quân xanh",
                "color": "#0044cc"
            },
            "unit_type": {
                "id": 5,
                "name": "control_zone"
            },
            "boundary": [
                { "lon": 106.58, "lat": 10.90 },
                { "lon": 106.72, "lat": 10.90 },
                { "lon": 106.72, "lat": 10.78 },
                { "lon": 106.58, "lat": 10.78 },
                { "lon": 106.58, "lat": 10.90 }
            ]
        }
    ]
}
```

---

## ENTITY.ADD

Dùng trong runtime khi có entity mới xuất hiện. Schema payload giống từng item trong `ENTITY.ADD_BULK`.

### point_unit

```json
{
    "type": "ENTITY.ADD",
    "kind": "point_unit",
    "id": "unit-004",
    "payload": {
        "name": "Đại đội trinh sát 7",
        "description": null,
        "is_dynamic": true,
        "position": {
            "lon": 106.6543,
            "lat": 10.8012,
            "alt": 0
        },
        "coverage_radius": null,
        "faction": {
            "id": 1,
            "name": "Quân đỏ",
            "color": "#cc0000"
        },
        "unit_type": {
            "id": 3,
            "name": "recon"
        }
    }
}
```

### zone_unit

```json
{
    "type": "ENTITY.ADD",
    "kind": "zone_unit",
    "id": "unit-005",
    "payload": {
        "name": "Vùng giao tranh B",
        "description": "Khu vực tranh chấp phía đông",
        "faction": {
            "id": 2,
            "name": "Quân xanh",
            "color": "#0044cc"
        },
        "unit_type": {
            "id": 5,
            "name": "control_zone"
        },
        "boundary": [
            { "lon": 106.74, "lat": 10.85 },
            { "lon": 106.82, "lat": 10.85 },
            { "lon": 106.82, "lat": 10.76 },
            { "lon": 106.74, "lat": 10.76 },
            { "lon": 106.74, "lat": 10.85 }
        ]
    }
}
```

---

## ENTITY.UPDATE.POSITION

Update vị trí — luôn là array dù chỉ có 1 item. Client luôn loop qua payload.

```json
{
    "type": "ENTITY.UPDATE.POSITION",
    "payload": [
        {
            "id": "unit-001",
            "position": {
                "lon": 106.6412,
                "lat": 10.8356,
                "alt": 0,
                "recorded_at": "2024-01-15T08:30:00Z"
            }
        },
        {
            "id": "unit-002",
            "position": {
                "lon": 106.5981,
                "lat": 10.7123,
                "alt": 0,
                "recorded_at": "2024-01-15T08:30:00Z"
            }
        }
    ]
}
```

---

## ENTITY.UPDATE.UNIT_TYPE

Update loại unit — luôn là array dù chỉ có 1 item.

```json
{
    "type": "ENTITY.UPDATE.UNIT_TYPE",
    "payload": [
        {
            "id": "unit-001",
            "unit_type": {
                "id": 99,
                "name": "destroyed"
            }
        }
    ]
}
```

---

## ENTITY.REMOVE

```json
{
    "type": "ENTITY.REMOVE",
    "id": "unit-001"
}
```

---

## ENTITY.CLEAR

Xóa toàn bộ entity khỏi scene.

```json
{
    "type": "ENTITY.CLEAR"
}
```

---

## CAMERA.FLY_TO

Bay camera đến vị trí với animation.

```json
{
    "type": "CAMERA.FLY_TO",
    "payload": {
        "lon": 106.6297,
        "lat": 10.8231,
        "alt": 50000,
        "duration": 2.0
    }
}
```

---

## CAMERA.SET

Set camera ngay lập tức, không có animation.

```json
{
    "type": "CAMERA.SET",
    "payload": {
        "lon": 106.6297,
        "lat": 10.8231,
        "alt": 50000
    }
}
```

---

## SCENE.CLEAR_ALL

Reset toàn bộ scene — xóa hết entity, reset camera.

```json
{
    "type": "SCENE.CLEAR_ALL"
}
```

---

## Dispatch pattern ở client

```javascript
const handlers = {
    'ENTITY.ADD':                (msg) => addEntity(msg.id, msg.kind, msg.payload),
    'ENTITY.ADD_BULK':           (msg) => msg.payload.forEach(e => addEntity(e.id, e.kind, e)),
    'ENTITY.UPDATE.POSITION':    (msg) => msg.payload.forEach(e => updateEntityPosition(e.id, e.position)),
    'ENTITY.UPDATE.UNIT_TYPE':   (msg) => msg.payload.forEach(e => updateEntityUnitType(e.id, e.unit_type)),
    'ENTITY.REMOVE':             (msg) => removeEntity(msg.id),
    'ENTITY.CLEAR':              ()    => clearEntities(),
    'CAMERA.FLY_TO':             (msg) => flyTo(msg.payload),
    'CAMERA.SET':                (msg) => setCamera(msg.payload),
    'SCENE.CLEAR_ALL':           ()    => clearAll(),
};
```

---

## Quy ước

- Timestamp dùng ISO 8601 UTC: `"2024-01-15T08:30:00Z"`
- Tọa độ dùng WGS84 (EPSG:4326): `lon`, `lat`, `alt` (mét)
- `alt` mặc định là `0` nếu không có dữ liệu độ cao
- `coverage_radius` đơn vị mét, `null` nếu không có coverage
- `boundary` polygon phải đóng — điểm đầu và điểm cuối trùng nhau
- Faction là bất biến — không có trong `ENTITY.UPDATE.*`
- Mọi `ENTITY.UPDATE.*` đều là array — client luôn loop qua payload
