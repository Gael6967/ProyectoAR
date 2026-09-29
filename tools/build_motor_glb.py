"""Build the small, original AR Maintenance motor as glTF 2.0 binary.

Only Python's standard library is needed. Re-run this script after changing
dimensions or colors. Meshes are deliberately low-poly for mobile WebAR.
"""
import json
import math
import struct
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets/motor-m01.glb"
SEGMENTS = 20

COLORS = {
    "base_grafito": (0.09, 0.13, 0.18),
    "carcasa_azul": (0.045, 0.34, 0.75),
    "aletas_azul_claro": (0.16, 0.49, 0.88),
    "brida_azul_oscuro": (0.035, 0.20, 0.42),
    "rodamiento_naranja": (0.98, 0.29, 0.025),
    "rodamiento_interior": (0.48, 0.14, 0.025),
    "conexion_amarilla": (0.98, 0.70, 0.055),
    "eje_acero": (0.58, 0.69, 0.79),
    "detalles_acero": (0.34, 0.43, 0.54),
    "tapa_oscura": (0.045, 0.075, 0.12),
}
meshes = {name: {"vertices": [], "normals": [], "indices": []} for name in COLORS}


def quad(name, vertices, normal):
    mesh = meshes[name]
    start = len(mesh["vertices"])
    mesh["vertices"].extend(vertices)
    mesh["normals"].extend([normal] * 4)
    mesh["indices"].extend((start, start + 1, start + 2, start, start + 2, start + 3))


def box(name, x, y, z, width, height, depth, rotate_x=0, pivot_y=None):
    hx, hy, hz = width / 2, height / 2, depth / 2
    points = [
        (-hx, -hy, -hz), (hx, -hy, -hz), (hx, hy, -hz), (-hx, hy, -hz),
        (-hx, -hy, hz), (hx, -hy, hz), (hx, hy, hz), (-hx, hy, hz),
    ]
    p_y = y if pivot_y is None else pivot_y
    cosine, sine = math.cos(rotate_x), math.sin(rotate_x)

    def transform(point):
        dx, dy, dz = point
        dy += y - p_y
        dz += z
        return (x + dx, p_y + dy * cosine - dz * sine, dy * sine + dz * cosine)

    p = [transform(point) for point in points]
    faces = [
        ([p[0], p[3], p[2], p[1]], (0, 0, -1)),
        ([p[4], p[5], p[6], p[7]], (0, 0, 1)),
        ([p[0], p[4], p[7], p[3]], (-1, 0, 0)),
        ([p[1], p[2], p[6], p[5]], (1, 0, 0)),
        ([p[3], p[7], p[6], p[2]], (0, 1, 0)),
        ([p[0], p[1], p[5], p[4]], (0, -1, 0)),
    ]
    for vertices, normal in faces:
        ny, nz = normal[1], normal[2]
        quad(name, vertices, (normal[0], ny * cosine - nz * sine, ny * sine + nz * cosine))


def cylinder_x(name, x, y, z, length, radius, segments=SEGMENTS):
    left, right = x - length / 2, x + length / 2
    for i in range(segments):
        t0, t1 = 2 * math.pi * i / segments, 2 * math.pi * (i + 1) / segments
        a = (math.cos(t0), math.sin(t0))
        b = (math.cos(t1), math.sin(t1))
        normal = (0, math.cos((t0 + t1) / 2), math.sin((t0 + t1) / 2))
        quad(name, [(left, y + radius * a[0], z + radius * a[1]),
                    (left, y + radius * b[0], z + radius * b[1]),
                    (right, y + radius * b[0], z + radius * b[1]),
                    (right, y + radius * a[0], z + radius * a[1])], normal)
        quad(name, [(left, y, z), (left, y + radius * a[0], z + radius * a[1]),
                    (left, y + radius * b[0], z + radius * b[1]), (left, y, z)], (-1, 0, 0))
        quad(name, [(right, y, z), (right, y + radius * b[0], z + radius * b[1]),
                    (right, y + radius * a[0], z + radius * a[1]), (right, y, z)], (1, 0, 0))


# Open steel mounting rails; a solid rectangular plate hid the motor in AR.
for z in (-0.26, 0.26):
    box("base_grafito", 0.04, 0.035, z, 1.34, 0.07, 0.10)
for x in (-0.33, 0.29):
    for z in (-0.24, 0.24):
        box("detalles_acero", x, 0.11, z, 0.18, 0.16, 0.15)
        box("eje_acero", x, 0.018, z, 0.25, 0.025, 0.15)

# Main motor casing, ribbing and side flanges. Shaft axis is X.
cylinder_x("carcasa_azul", -0.12, 0.37, 0, 0.76, 0.27)
for i in range(12):
    angle = i * 2 * math.pi / 12
    box("aletas_azul_claro", -0.12, 0.37 + 0.282, 0, 0.69, 0.043, 0.046, rotate_x=angle, pivot_y=0.37)
for x in (-0.49, 0.25):
    cylinder_x("brida_azul_oscuro", x, 0.37, 0, 0.09, 0.31)
cylinder_x("tapa_oscura", -0.59, 0.37, 0, 0.11, 0.255)
cylinder_x("detalles_acero", -0.653, 0.37, 0, 0.025, 0.20)

# Bearing assembly: bright orange casing, copper inner race and silver shaft.
cylinder_x("rodamiento_naranja", 0.345, 0.37, 0, 0.13, 0.255)
cylinder_x("rodamiento_interior", 0.426, 0.37, 0, 0.055, 0.15)
cylinder_x("eje_acero", 0.588, 0.37, 0, 0.33, 0.085)
cylinder_x("detalles_acero", 0.756, 0.37, 0, 0.026, 0.091)
for angle in (0, math.pi / 2, math.pi, 3 * math.pi / 2):
    cylinder_x("eje_acero", 0.418, 0.37 + 0.205 * math.cos(angle), 0.205 * math.sin(angle), 0.013, 0.019, 10)

# Raised, yellow electrical terminal box and dark removable lid.
box("conexion_amarilla", -0.13, 0.69, 0, 0.38, 0.17, 0.39)
box("tapa_oscura", -0.13, 0.792, 0, 0.43, 0.035, 0.43)
box("conexion_amarilla", -0.13, 0.815, 0, 0.26, 0.012, 0.25)
for x in (-0.28, 0.02):
    for z in (-0.16, 0.16):
        box("eje_acero", x, 0.818, z, 0.026, 0.01, 0.026)

# Small silver identification plate on the visible side of the blue housing.
box("eje_acero", -0.17, 0.46, 0.274, 0.23, 0.08, 0.009)
box("brida_azul_oscuro", -0.17, 0.46, 0.281, 0.14, 0.022, 0.003)

materials = list(COLORS)
binary = bytearray()
buffer_views = []
accessors = []
gltf_meshes = []
nodes = []


def accessor(values, fmt, component_type, count, accessor_type, include_limits=False):
    while len(binary) % 4:
        binary.append(0)
    offset = len(binary)
    if accessor_type == "VEC3":
        binary.extend(struct.pack("<" + fmt * (count * 3), *(item for vec in values for item in vec)))
    else:
        binary.extend(struct.pack("<" + fmt * count, *values))
    index = len(buffer_views)
    buffer_views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(binary) - offset})
    result = {"bufferView": index, "componentType": component_type, "count": count, "type": accessor_type}
    if include_limits:
        result["min"] = [min(v[axis] for v in values) for axis in range(3)]
        result["max"] = [max(v[axis] for v in values) for axis in range(3)]
    accessor_index = len(accessors)
    accessors.append(result)
    return accessor_index


for material_index, name in enumerate(materials):
    mesh = meshes[name]
    vertices, normals, indices = mesh["vertices"], mesh["normals"], mesh["indices"]
    pos = accessor(vertices, "f", 5126, len(vertices), "VEC3", include_limits=True)
    norm = accessor(normals, "f", 5126, len(normals), "VEC3")
    idx = accessor(indices, "H", 5123, len(indices), "SCALAR")
    gltf_meshes.append({"name": name, "primitives": [{"attributes": {"POSITION": pos, "NORMAL": norm}, "indices": idx, "material": material_index, "mode": 4}]})
    nodes.append({"name": name, "mesh": material_index})

gltf = {
    "asset": {"version": "2.0", "generator": "AR Maintenance original low-poly motor builder"},
    "scene": 0,
    "scenes": [{"name": "Motor Eléctrico M-01", "nodes": list(range(len(nodes)))}],
    "nodes": nodes,
    "meshes": gltf_meshes,
    "materials": [{"name": name, "pbrMetallicRoughness": {
        "baseColorFactor": [*COLORS[name], 1.0],
        "metallicFactor": 0.17 if name not in ("eje_acero", "detalles_acero") else 0.55,
        "roughnessFactor": 0.58,
    }, "doubleSided": True} for name in materials],
    "buffers": [{"byteLength": len(binary)}],
    "bufferViews": buffer_views,
    "accessors": accessors,
}

while len(binary) % 4:
    binary.append(0)
gltf["buffers"][0]["byteLength"] = len(binary)
json_bytes = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
json_bytes += b" " * ((4 - len(json_bytes) % 4) % 4)
total = 12 + 8 + len(json_bytes) + 8 + len(binary)
with OUT.open("wb") as file:
    file.write(struct.pack("<4sII", b"glTF", 2, total))
    file.write(struct.pack("<I4s", len(json_bytes), b"JSON"))
    file.write(json_bytes)
    file.write(struct.pack("<I4s", len(binary), b"BIN\0"))
    file.write(binary)
print(f"{OUT.name}: {total:,} bytes; {sum(len(m['indices'])//3 for m in meshes.values()):,} triangles")
