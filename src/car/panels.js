import { BODY_TYPES } from "./geometry.js";

/* The selectable panels for a body type, in reading order, with their group. */
export function panelsFor(type) {
  const T = BODY_TYPES[type] || BODY_TYPES.hatch;
  const side = (s, g) => [
    { id: "wing" + s, group: g },
    { id: "doorF" + s, group: g },
    ...(T.doors === 4 ? [{ id: "doorR" + s, group: g }] : []),
    { id: "quarter" + s, group: g },
    { id: "mirror" + s, group: g },
  ];
  return [
    { id: "bumperF", group: "front" },
    { id: "bonnet", group: "front" },
    ...side("L", "left"),
    ...side("R", "right"),
    { id: "boot", group: "rear" },
    { id: "bumperR", group: "rear" },
    { id: "roof", group: "top" },
  ];
}

export const bodyMeta = (type) => {
  const T = BODY_TYPES[type] || BODY_TYPES.hatch;
  return { doors: T.doors, rear: T.rear };
};

/* Which view shows a panel best: used to jump the diagram when a panel is picked from the list. */
export function bestViewFor(id) {
  if (id === "bumperF" || id === "bonnet") return "front";
  if (id === "bumperR" || id === "boot") return "rear";
  if (id === "roof") return "top";
  return id.endsWith("L") ? "left" : "right";
}
