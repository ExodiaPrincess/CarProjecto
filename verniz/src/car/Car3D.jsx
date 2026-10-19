import React, { useEffect, useRef } from "react";
import CARS from "../../assets/models/cars.json";
import { cx } from "../lib/util.js";

/* Low-poly cars by Quaternius (quaternius.com, CC0), pre-cut into paint panels by models/prep.py.
   Each body type borrows the closest model; it is a generic shape, not the exact make. */
const MODEL_FOR = { hatch: "hatch", sedan: "sedan", suv: "suv", estate: "suv", coupe: "sports" };
const TO_3D = { bonnet: "hood", wingL: "fenderL", wingR: "fenderR" };
const toModelId = (id, D) => (id === "boot" ? D.rear : TO_3D[id] || id);
const FROM_3D = { hood: "bonnet", fenderL: "wingL", fenderR: "wingR", tailgate: "boot", trunk: "boot" };
const toPanelId = (id) => FROM_3D[id] || id;

let glOK;
export function has3D() {
  if (glOK !== undefined) return glOK;
  try {
    const c = document.createElement("canvas");
    glOK = !!(window.THREE && window.THREE.OrbitControls && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch { glOK = false; }
  return glOK;
}

function decodeQ(b64) {
  const s = atob(b64), u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  const a = new Int16Array(u.buffer), f = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) f[i] = a[i] / 4000;
  return f;
}

function buildCar(THREE, type) {
  const D = CARS[MODEL_FOR[type] || "hatch"];
  const group = new THREE.Group(), panels = {};
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ flatShading: true }, o));
  const DECOR = {
    "d:Windows": std({ color: 0x0c1218, roughness: 0.04, metalness: 0.85 }),
    "d:Headlights": std({ color: 0xe8eef3, emissive: 0x5d6670, roughness: 0.1, metalness: 0.5 }),
    "d:TailLights": std({ color: 0xa31818, emissive: 0x5a0808, roughness: 0.2, metalness: 0.3 }),
    "d:Black": std({ color: 0x111215, roughness: 0.6 }),
    "d:Grey": std({ color: 0x26292d, roughness: 0.5, metalness: 0.3 }),
    "d:Material.007": std({ color: 0x1f2125, roughness: 0.6 }),
    "w:Black": std({ color: 0x131416, roughness: 0.9 }),
    "w:Grey": std({ color: 0xb9bfc6, roughness: 0.22, metalness: 0.9 }),
  };
  const fallback = std({ color: 0x1a1b1e, roughness: 0.6 });
  for (const [gid, b64] of Object.entries(D.groups)) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(decodeQ(b64), 3));
    geo.computeVertexNormals();
    const isPanel = !gid.startsWith("d:") && !gid.startsWith("w:");
    const mat = isPanel
      ? std({ color: 0xffffff, metalness: 0.18, roughness: 0.42, envMapIntensity: 0.55, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
      : DECOR[gid] || fallback;
    const mesh = new THREE.Mesh(geo, mat);
    if (isPanel) {
      const id = toPanelId(gid);
      mesh.userData.panel = id;
      geo.computeBoundingBox();
      panels[id] = { mat, center: geo.boundingBox.getCenter(new THREE.Vector3()) };
    }
    group.add(mesh);
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.BufferAttribute(decodeQ(D.lines), 3));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
  lines.raycast = () => {};
  group.add(lines);

  // soft contact shadow
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const c2 = cv.getContext("2d"), g = c2.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,.75)"); g.addColorStop(0.55, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c2.fillStyle = g; c2.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(D.dims.L * 1.35, D.dims.W * 1.9),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.003; shadow.raycast = () => {};
  group.add(shadow);

  // pearl ring on the floor
  const ring = new THREE.Mesh(new THREE.RingGeometry(D.dims.L * 0.6, D.dims.L * 0.605, 128),
    new THREE.MeshBasicMaterial({ color: 0x8fe3f0, transparent: true, opacity: 0.22, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; ring.raycast = () => {};
  group.add(ring);

  return { group, panels, dims: D.dims, rear: D.rear };
}

function studioEnv(THREE, renderer) {
  const ec = document.createElement("canvas"); ec.width = 512; ec.height = 256;
  const ex = ec.getContext("2d"), eg = ex.createLinearGradient(0, 0, 0, 256);
  eg.addColorStop(0, "#c9d1d8"); eg.addColorStop(0.36, "#8f99a3"); eg.addColorStop(0.49, "#56606a");
  eg.addColorStop(0.51, "#2a3036"); eg.addColorStop(1, "#0b0e11");
  ex.fillStyle = eg; ex.fillRect(0, 0, 512, 256);
  ex.fillStyle = "rgba(255,255,255,.95)"; ex.fillRect(56, 30, 150, 34); ex.fillRect(300, 20, 170, 44);
  ex.fillStyle = "rgba(143,227,240,.55)"; ex.fillRect(0, 100, 512, 8);
  const tex = new THREE.CanvasTexture(ec); tex.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromEquirectangular(tex).texture;
  tex.dispose(); pm.dispose();
  return env;
}

const SEL_A = 0x46c8de, SEL_B = 0xb9a8ff;
const hueDist = (a, b) => { const d = Math.abs(a - b) % 1; return Math.min(d, 1 - d); };

/**
 * Interactive 3D car. Panel ids are the site's own (bonnet, wingL, boot…).
 * selection: anything with .has(id); hover: id or null (e.g. from the panel list).
 */
export default function Car3D({ type, color, selection, hover, interactive = false, onToggle, onEnter, onMove, onLeave, focusId, className, label, autoRotate = true }) {
  const host = useRef(null);
  const api = useRef(null);
  const props = useRef({});
  props.current = { onToggle, onEnter, onMove, onLeave, interactive };

  // renderer, scene, camera, controls: once per mount
  useEffect(() => {
    const THREE = window.THREE, el = host.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;outline:none;cursor:grab";
    el.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.environment = studioEnv(THREE, renderer);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2f36, 0.38));
    const key = new THREE.DirectionalLight(0xffffff, 0.62); key.position.set(4, 8, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.25); fill.position.set(-5, 3, 4); scene.add(fill);
    const rim = new THREE.DirectionalLight(0x8fe3f0, 0.45); rim.position.set(-4, 3, -6); scene.add(rim);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    const controls = new THREE.OrbitControls(camera, canvas);
    canvas.style.touchAction = "pan-y"; // vertical swipes still scroll the page
    Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, enablePan: false, enableZoom: false, rotateSpeed: 0.8,
      minPolarAngle: 0.15, maxPolarAngle: Math.PI * 0.47, autoRotate: autoRotate && !reduce, autoRotateSpeed: 0.9 });

    const st = { car: null, hover: null, extHover: null, sel: { has: () => false }, paint: new THREE.Color(), selColor: new THREE.Color(SEL_A), fit: 8, anim: null, visible: true, dirty: true };

    const fitCamera = () => {
      if (!st.car) return;
      const { L, W, roofY } = st.car.dims;
      const w = el.clientWidth || 1, h = el.clientHeight || 1, aspect = w / h;
      const r = Math.hypot(L / 2, W / 2, roofY / 2);
      const vf = (camera.fov * Math.PI) / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
      st.fit = (r / Math.sin(Math.min(vf, hf) / 2)) * 0.76;
      controls.target.set(0, roofY * 0.42, 0);
    };
    const placeCamera = (theta, phi, dist) => {
      camera.position.setFromSpherical(new THREE.Spherical(dist, phi, theta)).add(controls.target);
      camera.lookAt(controls.target);
    };
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      const before = st.fit; fitCamera();
      const off = camera.position.clone().sub(controls.target);
      if (off.length() > 0.01) camera.position.copy(controls.target).add(off.setLength(off.length() * (st.fit / before)));
      st.dirty = true;
    };
    const ro = new ResizeObserver(resize); ro.observe(el);

    const refresh = () => {
      if (!st.car) return;
      for (const [id, p] of Object.entries(st.car.panels)) {
        const sel = st.sel.has(id), hov = st.hover === id || st.extHover === id;
        p.mat.color.copy(sel ? st.selColor : st.paint);
        p.mat.emissive.setHex(sel ? (hov ? 0x1f5560 : 0x0e3038) : hov ? 0x30363d : 0x000000);
      }
      st.dirty = true;
    };
    const setPaint = (hex) => {
      st.paint.set(hex);
      const h1 = {}, h2 = {};
      st.paint.getHSL(h1); new THREE.Color(SEL_A).getHSL(h2);
      // a pale-blue car would hide the pearl marking: switch to lilac
      st.selColor.setHex(h1.s > 0.25 && hueDist(h1.h, h2.h) < 0.08 ? SEL_B : SEL_A);
      refresh();
    };
    const setType = (t) => {
      if (st.car) {
        scene.remove(st.car.group);
        st.car.group.traverse((o) => { o.geometry?.dispose(); if (o.material && !o.material._shared) o.material.dispose?.(); });
      }
      st.car = buildCar(THREE, t);
      scene.add(st.car.group);
      fitCamera();
      placeCamera(0.95, 1.18, st.fit);
      refresh();
    };

    // picking
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const pick = (e) => {
      if (!st.car) return null;
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(st.car.group.children, false)[0];
      return hit?.object.userData.panel || null;
    };
    let down = null;
    const onDown = (e) => { setHov(null); down = { x: e.clientX, y: e.clientY }; controls.autoRotate = false; st.anim = null; canvas.style.cursor = "grabbing"; };
    const onUp = (e) => {
      canvas.style.cursor = st.hover ? "pointer" : "grab";
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved < 7 && props.current.interactive && e.target === canvas) {
        const id = pick(e);
        if (id) props.current.onToggle?.(id);
      }
    };
    const setHov = (id, e) => {
      if (st.hover === id) { if (id) props.current.onMove?.(id, e); return; }
      const prev = st.hover; st.hover = id;
      if (prev) props.current.onLeave?.(prev);
      if (id) props.current.onEnter?.(id, e);
      canvas.style.cursor = id ? "pointer" : down ? "grabbing" : "grab";
      refresh();
    };
    const onPMove = (e) => { if (!props.current.interactive || e.pointerType === "touch" || down) return; setHov(pick(e), e); };
    const onPLeave = () => setHov(null);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointermove", onPMove);
    canvas.addEventListener("pointerleave", onPLeave);
    controls.addEventListener("change", () => { st.dirty = true; });

    /* Touch: OrbitControls r128 cancels every touch, which would trap page scrolling on phones.
       Its touch handlers never see the events; we turn the car on horizontal swipes ourselves
       and leave vertical swipes to the browser. */
    let tg = null;
    const tStart = (e) => {
      e.stopPropagation();
      if (e.touches.length !== 1) { tg = null; return; }
      const t = e.touches[0], sp = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      tg = { x: t.clientX, y: t.clientY, sp, axis: null };
      controls.autoRotate = false; st.anim = null;
    };
    const tMove = (e) => {
      e.stopPropagation();
      if (!tg || e.touches.length !== 1) return;
      const t = e.touches[0], dx = t.clientX - tg.x, dy = t.clientY - tg.y;
      if (!tg.axis && Math.hypot(dx, dy) > 6) tg.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (tg.axis !== "x") return;
      e.preventDefault();
      setHov(null);
      placeCamera(tg.sp.theta - (dx / (el.clientWidth || 300)) * Math.PI * 1.6, tg.sp.phi, tg.sp.radius);
      st.dirty = true;
    };
    const tEnd = (e) => { e.stopPropagation(); if (!e.touches.length) tg = null; };
    el.addEventListener("touchstart", tStart, { capture: true, passive: true });
    el.addEventListener("touchmove", tMove, { capture: true, passive: false });
    el.addEventListener("touchend", tEnd, { capture: true });
    el.addEventListener("touchcancel", tEnd, { capture: true });

    // render only while on screen
    const io = new IntersectionObserver(([en]) => { st.visible = en.isIntersecting; }, { rootMargin: "80px" });
    io.observe(el);
    let raf = 0, last = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(64, now - last); last = now;
      if (!st.visible) return;
      if (st.anim) {
        const a = st.anim, k = Math.min(1, (now - a.t0) / a.dur), e = 1 - Math.pow(1 - k, 3);
        placeCamera(a.th0 + (a.th1 - a.th0) * e, a.ph0 + (a.ph1 - a.ph0) * e, a.r0 + (a.r1 - a.r0) * e);
        if (k >= 1) st.anim = null;
        st.dirty = true;
      }
      if (controls.autoRotate) st.dirty = true;
      controls.update(dt / 16.7);
      if (st.dirty) { renderer.render(scene, camera); st.dirty = false; }
    };
    raf = requestAnimationFrame(loop);

    api.current = {
      setType, setPaint,
      setSel: (s) => { st.sel = s || { has: () => false }; refresh(); },
      setExtHover: (id) => { st.extHover = id; refresh(); },
      focus: (id) => {
        const p = st.car?.panels[id];
        if (!p) return;
        controls.autoRotate = false; setHov(null);
        const off = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
        let th1, ph1;
        if (id === "roof") { th1 = off.theta; ph1 = 0.32; }
        else {
          th1 = Math.atan2(p.center.x, p.center.z);
          if (/^(bumperF|bonnet)$/.test(id)) th1 = Math.PI / 2 - 0.5;  // front three-quarter (+x is the nose)
          if (/^(bumperR|boot)$/.test(id)) th1 = -Math.PI / 2 + 0.5;   // rear three-quarter
          ph1 = id === "bonnet" || id === "boot" ? 0.92 : 1.2;
        }
        let d = th1 - off.theta; d = Math.atan2(Math.sin(d), Math.cos(d));
        st.anim = { t0: performance.now(), dur: reduce ? 1 : 750, th0: off.theta, th1: off.theta + d, ph0: off.phi, ph1, r0: off.radius, r1: st.fit };
      },
    };
    resize();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointerup", onUp);
      controls.dispose();
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose?.(); });
      scene.environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      canvas.remove();
      api.current = null;
    };
  }, []); // eslint-disable-line

  useEffect(() => { api.current?.setType(type); }, [type]);
  useEffect(() => { api.current?.setPaint(color); }, [color, type]);
  useEffect(() => { api.current?.setSel(selection); }, [selection, type]);
  useEffect(() => { api.current?.setExtHover(hover || null); }, [hover]);
  useEffect(() => { if (focusId) api.current?.focus(focusId.id); }, [focusId]);

  return <div ref={host} className={cx("relative h-full w-full", className)} role="img" aria-label={label} />;
}
