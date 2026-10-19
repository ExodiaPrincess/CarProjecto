"""Turn the Quaternius OBJ cars into compact, panel-split JSON for the site.

Site coordinates: +X = front, +Y = up, +Z = right side (left side is -Z).
OBJ coordinates: +z = front, +y = up, +x = car's left.  So X = z, Y = y, Z = -x.
"""
import base64, json, math, struct, sys, collections

import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source") + os.sep
CARS = {
    "hatch": dict(file="NormalCar2", paint="LightBlue", trim=["Material.007", "Black", "Grey"], rear="tailgate"),
    "sedan": dict(file="NormalCar1", paint="Blue", trim=["Black", "Grey"], rear="trunk"),
    "suv":   dict(file="SUV", paint="White", trim=["Black", "Grey"], rear="tailgate"),
    "sports": dict(file="SportsCar2", paint="White", trim=["Grey"], rear="trunk", doors=2),
}
Q = 4000.0  # quantisation: 1 unit = 0.25 mm


def load(name):
    V, faces = [], []
    obj = mat = None
    for line in open(SRC + name + ".obj"):
        p = line.split()
        if not p:
            continue
        if p[0] == "v":
            x, y, z = map(float, p[1:4])
            V.append((z, y, -x))
        elif p[0] == "o":
            obj = p[1].split("_")[1]
        elif p[0] == "usemtl":
            mat = p[1]
        elif p[0] == "f":
            faces.append((obj, mat, [int(t.split("/")[0]) - 1 for t in p[1:]]))
    return V, faces


def sub(a, b): return (a[0] - b[0], a[1] - b[1], a[2] - b[2])
def cross(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
def norm(a):
    l = math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2) or 1
    return (a[0] / l, a[1] / l, a[2] / l)


def poly_normal(P):
    n = (0.0, 0.0, 0.0)
    for i in range(len(P)):                      # Newell's method
        a, b = P[i], P[(i + 1) % len(P)]
        n = (n[0] + (a[1] - b[1]) * (a[2] + b[2]), n[1] + (a[2] - b[2]) * (a[0] + b[0]), n[2] + (a[0] - b[0]) * (a[1] + b[1]))
    return norm(n)


def bbox(V, faces, pred):
    pts = [V[i] for (o, m, idx) in faces if pred(o, m) for i in idx]
    return [min(p[k] for p in pts) for k in range(3)], [max(p[k] for p in pts) for k in range(3)]


def build(key, cfg):
    V, faces = load(cfg["file"])
    # recentre: length centred on 0, wheels on the ground
    lo, hi = bbox(V, faces, lambda o, m: True)
    wlo, _ = bbox(V, faces, lambda o, m: "Wheel" in o)
    cx = (lo[0] + hi[0]) / 2
    V = [(x - cx, y - wlo[1], z) for (x, y, z) in V]

    paint = cfg["paint"]
    is_body = lambda o, m: "Wheel" not in o
    blo, bhi = bbox(V, faces, lambda o, m: is_body(o, m) and m == paint)
    flo, fhi = bbox(V, faces, lambda o, m: o == "FrontLeftWheel")
    rlo, rhi = bbox(V, faces, lambda o, m: o == "BackWheels")
    glo, ghi = bbox(V, faces, lambda o, m: is_body(o, m) and m == "Windows")
    hlo, hhi = bbox(V, faces, lambda o, m: is_body(o, m) and m == "Headlights")
    tlo, thi = bbox(V, faces, lambda o, m: is_body(o, m) and m == "TailLights")

    half = max(-blo[0], bhi[0])
    hw = max(-blo[2], bhi[2])
    Xf, Xr = (flo[0] + fhi[0]) / 2, (rlo[0] + rhi[0]) / 2
    r = (fhi[1] - flo[1]) / 2
    belt = glo[1]
    glassHW = max(-glo[2], ghi[2])
    wsBase = ghi[0]                         # front of the glass = windscreen base
    rgBase = glo[0]                         # back of the glass = rear window base
    # door lines: start from typical positions, then snap each to the vertex column
    # that cuts through the fewest side faces, so panel edges follow the mesh
    side = []
    for (o, m, idx) in faces:
        if m != paint or "Wheel" in o: continue
        P = [V[i] for i in idx]
        n = poly_normal(P)
        cy = sum(p[1] for p in P) / len(P)
        if abs(n[2]) > 0.5 and cy < belt + 0.02 and cy > r * 0.6:
            side.append((min(p[0] for p in P), max(p[0] for p in P)))
    cols = sorted({round(V[i][0], 4) for (o, m, idx) in faces if m == paint and "Wheel" not in o for i in idx})
    def snap(target, span=0.22):
        best, bc = target, 1e9
        for c in cols:
            if abs(c - target) > span: continue
            cut = sum(1 for a, b in side if a < c - 0.004 and b > c + 0.004)
            cost = cut + abs(c - target) * 6
            if cost < bc: best, bc = c, cost
        return best
    xFD = snap(min(Xf - r - 0.05, wsBase))
    xRD = snap(Xr + r + 0.05)
    # four doors: B-pillar near the middle; two doors: one long door, short rear quarter
    xMid = snap(xRD + (xFD - xRD) * 0.30, 0.3) if cfg.get("doors", 4) == 2 else snap((xFD + xRD) / 2 + 0.08)
    print("   door lines", round(xFD, 3), round(xMid, 3), round(xRD, 3))
    xFrontCorner = Xf + r + 0.06            # ahead of this, the side belongs to the front bumper
    xRearCorner = Xr - r - 0.06
    hlTop = hhi[1]
    tlBot = tlo[1]
    roofY = bhi[1]

    two_door = cfg.get("doors", 4) == 2
    def side_panel(X, s):
        if X >= xFD: return "fender" + s
        if two_door: return ("doorF" if X >= xMid else "quarter") + s
        if X >= xMid: return "doorF" + s
        if X >= xRD: return "doorR" + s
        return "quarter" + s

    def classify(c, n):
        X, Y, Z = c
        s = "R" if Z > 0 else "L"
        az = abs(Z)
        # mirrors: stick out past the glass, around the windscreen base
        if wsBase - 0.45 < X < wsBase + 0.15 and belt - 0.08 < Y < belt + 0.25 and az > glassHW + 0.05 and az > hw - 0.25:
            return "mirror" + s
        # underside: give it to whatever is above it
        if n[1] < -0.6:
            if X > xFrontCorner: return "bumperF"
            if X < xRearCorner: return "bumperR"
            return side_panel(X, s)
        # front end
        if X > xFrontCorner or (X > Xf and n[0] > 0.55):
            if Y > hlTop + 0.02 and (n[1] > 0.35 or X < wsBase + 0.6):
                return "hood"
            return "bumperF"
        # rear end
        if X < xRearCorner or (X < Xr and n[0] < -0.55):
            if Y < tlBot - 0.01:
                return "bumperR"
            if n[0] < -0.45 or n[1] > 0.35 or X < rgBase:
                return cfg["rear"]
            return "quarter" + s
        # cabin and top surfaces
        if Y > belt - 0.03:
            if X >= wsBase - 0.02: return "hood"
            if X <= rgBase + 0.02 and (n[1] > 0.3 or n[0] < -0.4): return cfg["rear"]
            if n[1] > 0.55 and Y > belt + 0.15: return "roof"
            if Y > belt + 0.04: return "roof"      # pillars
        if n[1] > 0.6 and X > xFD: return "hood"
        if n[1] > 0.6 and X < xRD: return cfg["rear"] if X < rgBase else "quarter" + s
        return side_panel(X, s)

    def is_mirror(P):
        X, Y, Z = (sum(p[k] for p in P) / len(P) for k in range(3))
        return wsBase - 0.45 < X < wsBase + 0.15 and belt - 0.08 < Y < belt + 0.25 and abs(Z) > glassHW + 0.05 and abs(Z) > hw - 0.25

    groups = collections.defaultdict(list)      # id -> flat triangle list
    face_id = []
    for (o, m, idx) in faces:
        P = [V[i] for i in idx]
        if "Wheel" in o:
            gid = "w:" + m
        elif m != paint and m in cfg["trim"] and is_mirror(P):
            gid = "mirror" + ("R" if sum(p[2] for p in P) > 0 else "L")   # unpainted mirror caps get painted
        elif m == paint:
            c = tuple(sum(p[k] for p in P) / len(P) for k in range(3))
            gid = classify(c, poly_normal(P))
        else:
            gid = "d:" + m
        face_id.append(gid)
        for t in range(1, len(idx) - 1):
            for i in (idx[0], idx[t], idx[t + 1]):
                groups[gid].extend(V[i])

    # shut-lines: polygon edges shared by two different paint panels
    edges = {}
    for fi, (o, m, idx) in enumerate(faces):
        if m != paint or "Wheel" in o: continue
        for a, b in zip(idx, idx[1:] + idx[:1]):
            k = (min(a, b), max(a, b))
            edges.setdefault(k, []).append(face_id[fi])
    lines = []
    for (a, b), ids in edges.items():
        if len(ids) == 2 and ids[0] != ids[1]:
            lines.extend(V[a]); lines.extend(V[b])

    def pack(arr):
        return base64.b64encode(struct.pack("<%dh" % len(arr), *[max(-32767, min(32767, round(v * Q))) for v in arr])).decode()

    out = {
        "rear": cfg["rear"],
        "doors": cfg.get("doors", 4),
        "dims": dict(L=round(2 * half, 3), W=round(2 * hw, 3), roofY=round(roofY, 3), r=round(r, 3),
                     xf=round(Xf, 3), xr=round(Xr, 3), belt=round(belt, 3)),
        "groups": {k: pack(v) for k, v in sorted(groups.items())},
        "lines": pack(lines),
    }
    counts = collections.Counter(face_id)
    return out, counts


if __name__ == "__main__":
    res = {}
    for key, cfg in CARS.items():
        out, counts = build(key, cfg)
        res[key] = out
        print(key, out["dims"])
        print("   ", {k: v for k, v in sorted(counts.items()) if not k.startswith(("w:", "d:"))})
    js = json.dumps(res, separators=(",", ":"))
    open(os.path.join(HERE, "cars.json"), "w").write(js)
    # also refresh the copy embedded in index.html
    page_path = os.path.join(HERE, "..", "index.html")
    page = open(page_path, encoding="utf-8").read()
    start = page.index("window.CAR_MODELS = ") + len("window.CAR_MODELS = ")
    end = page.index(";\n</script>", start)
    open(page_path, "w", encoding="utf-8").write(page[:start] + js + page[end:])
    print("bytes", len(js), "- index.html updated")
