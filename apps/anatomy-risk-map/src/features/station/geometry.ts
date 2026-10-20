import {
  circleRing,
  corners,
  cylinder,
  dotGrid,
  insetPlan,
  joinPaths,
  knurl,
  onTop,
  planOutline,
  pointsAt,
  ringOf,
  rise,
  segment,
  slabOf,
  type Plan,
  type SolidPaths,
} from "./anatomy-kit/iso-kit";
import {
  DISCHARGE,
  FIRE,
  FLOW,
  FOOT_H,
  INTAKE,
  MCC,
  PAD,
  PAD_H,
  P,
  PUMP_P1,
  PUMP_P2,
  STRAINER,
  SURGE,
  TANK,
  VFD,
} from "./view";

const solid = (plan: Plan, z: number, h: number, steps = 8, bevel = 0): SolidPaths =>
  slabOf(plan, z, h, P, steps, bevel);
const cyl = (cx: number, cy: number, r: number, z: number, h: number, steps = 32) =>
  cylinder(cx, cy, r, z, h, P, steps);
const line = (a: [number, number, number], b: [number, number, number]) => segment(a, b, P);

function footArt(x: number, y: number) {
  const plan = { x: x - 5, y: y - 5, w: 10, d: 10, r: 2 };
  return {
    foot: solid(plan, -FOOT_H, FOOT_H, 6, 0.6),
    pad: solid(insetPlan(plan, 1.2), -FOOT_H + 0.5, FOOT_H - 1, 4),
  };
}

function cornerScrews(plan: Plan, z: number) {
  return dotGrid(plan.x + 6, plan.y + 6, 2, 2, plan.w - 12, z + 0.2, P);
}

function rulerTicks(x0: number, y: number, length: number, z: number) {
  const paths: string[] = [];
  for (let i = 0; i <= length; i += 4) {
    const major = i % 20 === 0;
    paths.push(line([x0 + i, y, z], [x0 + i, y, z + (major ? 2.2 : 1.2)]));
  }
  return joinPaths(paths);
}

const FEET = [
  [PAD.x + 16, PAD.y + 14],
  [PAD.x + PAD.w - 16, PAD.y + 14],
  [PAD.x + 16, PAD.y + PAD.d - 14],
  [PAD.x + PAD.w - 16, PAD.y + PAD.d - 14],
] as const;

export const SITE_ART = {
  halo: solid(PAD, -FOOT_H - 2, 2).fill,
  pad: solid(PAD, 0, PAD_H, 10, 1.2),
  padGroove: planOutline(insetPlan(PAD, 5), PAD_H, P),
  padTicks: rulerTicks(PAD.x + 12, PAD.y + PAD.d - 8, PAD.w - 24, PAD_H),
  padLabel: planOutline({ x: PAD.x + PAD.w - 52, y: PAD.y + 8, w: 44, d: 14, r: 2 }, PAD_H + 0.2, P),
  padLabelLines: joinPaths([
    line([PAD.x + PAD.w - 48, PAD.y + 12, PAD_H + 0.3], [PAD.x + PAD.w - 14, PAD.y + 12, PAD_H + 0.3]),
    line([PAD.x + PAD.w - 48, PAD.y + 16, PAD_H + 0.3], [PAD.x + PAD.w - 20, PAD.y + 16, PAD_H + 0.3]),
    line([PAD.x + PAD.w - 48, PAD.y + 20, PAD_H + 0.3], [PAD.x + PAD.w - 26, PAD.y + 20, PAD_H + 0.3]),
  ]),
  feet: FEET.map(([x, y]) => footArt(x, y)),
  padScrews: cornerScrews(PAD, PAD_H),
  pipeRunA: joinPaths([
    line([INTAKE.x + INTAKE.w, INTAKE.y + INTAKE.d / 2, PAD_H + 14], [STRAINER.x, STRAINER.y + STRAINER.d / 2, PAD_H + 14]),
    line([STRAINER.x + STRAINER.w, STRAINER.y + STRAINER.d / 2, PAD_H + 14], [PUMP_P1.x, PUMP_P1.y + PUMP_P1.d / 2, PAD_H + 14]),
    line([PUMP_P1.x + PUMP_P1.w, PUMP_P1.y + PUMP_P1.d / 2, PAD_H + 14], [PUMP_P2.x, PUMP_P2.y + PUMP_P2.d / 2, PAD_H + 14]),
    line([PUMP_P2.x + PUMP_P2.w / 2, PUMP_P2.y + PUMP_P2.d, PAD_H + 14], [PUMP_P2.x + PUMP_P2.w / 2, DISCHARGE.y, PAD_H + 22]),
    line([DISCHARGE.x + DISCHARGE.w / 2, DISCHARGE.y, PAD_H + 22], [SURGE.x + SURGE.w / 2, SURGE.y, PAD_H + 28]),
  ]),
  pipeRunB: joinPaths([
    line([FLOW.x + FLOW.w / 2, FLOW.y, PAD_H + 10], [TANK.x + TANK.w / 2, TANK.y, PAD_H + 18]),
    rise([VFD.x + VFD.w / 2, VFD.y + VFD.d], PAD_H + 8, PAD_H + 26, P),
  ]),
  cableTray: planOutline({ x: MCC.x + 8, y: MCC.y - 6, w: 200, d: 6, r: 1 }, PAD_H + 32, P),
};

function pumpAssembly(plan: Plan, motorLit: boolean) {
  const cx = plan.x + plan.w / 2;
  const cy = plan.y + plan.d / 2;
  const baseZ = PAD_H;
  return {
    base: solid(plan, baseZ, 5, 8, 0.8),
    baseScrews: cornerScrews(plan, baseZ + 5),
    casing: cyl(cx - 8, cy, 11, baseZ + 5, 16),
    volute: cyl(cx + 10, cy + 4, 8, baseZ + 6, 12),
    coupling: cyl(cx, cy - 6, 4.5, baseZ + 14, 5),
    motor: cyl(cx, cy - 18, 9, baseZ + 8, 14),
    motorLit,
    motorKnurl: knurl(cx, cy - 18, 9.2, baseZ + 18, baseZ + 20, 14, P),
    footBolts: pointsAt(
      corners(plan, 4).map(([x, y]) => [x, y, baseZ + 5.2] as [number, number, number]),
      P,
    ),
    discharge: line([cx + 10, cy + 12, baseZ + 18], [cx + 10, cy + 28, baseZ + 20]),
    suction: line([cx - 18, cy, baseZ + 14], [cx - 28, cy, baseZ + 14]),
  };
}

function headerAssembly() {
  const z = PAD_H;
  return {
    slab: solid(INTAKE, z, 12, 8, 1),
    flange: cyl(INTAKE.x + INTAKE.w / 2, INTAKE.y + INTAKE.d / 2, 14, z + 12, 4),
    branchA: cyl(INTAKE.x + 20, INTAKE.y + 12, 5, z + 8, 10),
    branchB: cyl(INTAKE.x + 38, INTAKE.y + 28, 5, z + 8, 10),
    gauge: cyl(INTAKE.x + INTAKE.w - 10, INTAKE.y + 8, 3, z + 14, 8),
    ticks: rulerTicks(INTAKE.x + 6, INTAKE.y + INTAKE.d - 6, INTAKE.w - 12, z + 12),
    screws: cornerScrews(INTAKE, z + 12),
  };
}

function strainerAssembly() {
  const z = PAD_H;
  const cx = STRAINER.x + STRAINER.w / 2;
  const cy = STRAINER.y + STRAINER.d / 2;
  return {
    body: solid(STRAINER, z, 14, 6, 0.6),
    basket: cyl(cx, cy, 10, z + 4, 12),
    lid: onTop(ringOf({ x: cx - 12, y: cy - 12, w: 24, d: 24, r: 12 }, 24), z + 16, P, true),
    clamp: solid({ x: cx - 14, y: cy - 3, w: 28, d: 6, r: 1 }, z + 16, 3),
    vent: line([cx, cy - 12, z + 19], [cx, cy - 18, z + 22]),
    screws: cornerScrews(STRAINER, z + 14),
  };
}

function vfdCabinet() {
  const z = PAD_H;
  const door = insetPlan(VFD, 4);
  return {
    cabinet: solid(VFD, z, 38, 6, 1),
    door: solid(door, z + 2, 32, 6, 0.5),
    ventSlots: joinPaths(
      Array.from({ length: 5 }, (_, i) =>
        line([door.x + 6, door.y + 8 + i * 5, z + 30], [door.x + door.w - 6, door.y + 8 + i * 5, z + 30]),
      ),
    ),
    handle: solid({ x: door.x + door.w - 8, y: door.y + door.d / 2 - 6, w: 4, d: 12, r: 1 }, z + 16, 2),
    label: planOutline({ x: door.x + 6, y: door.y + 6, w: 28, d: 10, r: 1 }, z + 28, P),
    feet: cornerScrews(VFD, z),
    statusLamp: cyl(VFD.x + 10, VFD.y + 8, 2, z + 34, 3),
  };
}

function dischargeManifold() {
  const z = PAD_H + 18;
  return {
    rail: solid(DISCHARGE, z, 6, 8, 0.4),
    valves: Array.from({ length: 4 }, (_, i) => {
      const x = DISCHARGE.x + 18 + i * 28;
      const y = DISCHARGE.y + DISCHARGE.d / 2;
      return {
        body: cyl(x, y, 5, z + 6, 10),
        wheel: onTop(circleRing(x, y, 7, 20), z + 16, P, true),
        stem: line([x, y, z + 16], [x, y, z + 22]),
      };
    }),
    supports: joinPaths([
      line([DISCHARGE.x + 8, DISCHARGE.y + 4, z], [DISCHARGE.x + 8, DISCHARGE.y + 4, PAD_H + 18]),
      line([DISCHARGE.x + DISCHARGE.w - 8, DISCHARGE.y + 4, z], [DISCHARGE.x + DISCHARGE.w - 8, DISCHARGE.y + 4, PAD_H + 18]),
    ]),
  };
}

function surgeVessel() {
  const cx = SURGE.x + SURGE.w / 2;
  const cy = SURGE.y + SURGE.d / 2;
  const z = PAD_H;
  return {
    skirt: solid(SURGE, z, 8, 12, 0.5),
    shell: cyl(cx, cy, 16, z + 8, 42),
    topDome: onTop(circleRing(cx, cy, 16, 28), z + 50, P, true),
    manway: cyl(cx + 10, cy - 6, 4, z + 38, 6),
    gauge: cyl(cx - 12, cy + 10, 2.5, z + 40, 8),
    pipe: line([cx, cy + 16, z + 20], [cx, DISCHARGE.y + DISCHARGE.d, z + 24]),
    band: onTop(circleRing(cx, cy, 17, 32), z + 28, P, true),
    baseBolts: cornerScrews(SURGE, z + 8),
  };
}

function flowMeter() {
  const z = PAD_H;
  const cx = FLOW.x + FLOW.w / 2;
  const cy = FLOW.y + FLOW.d / 2;
  return {
    skid: solid(FLOW, z, 6, 6, 0.5),
    run: cyl(cx - 8, cy, 4, z + 6, 14),
    meter: cyl(cx + 6, cy, 6, z + 8, 12),
    transmitter: solid({ x: cx + 2, y: cy - 14, w: 14, d: 10, r: 2 }, z + 14, 8),
    flanges: joinPaths([
      onTop(circleRing(cx - 14, cy, 5, 16), z + 8, P, true),
      onTop(circleRing(cx + 14, cy, 5, 16), z + 8, P, true),
    ]),
    screws: cornerScrews(FLOW, z + 6),
  };
}

function storageTank() {
  const cx = TANK.x + TANK.w / 2;
  const cy = TANK.y + TANK.d / 2;
  const z = PAD_H;
  return {
    bund: solid(insetPlan(TANK, -6), z, 4, 8, 0.3),
    shell: cyl(cx, cy, 28, z + 4, 48),
    roof: onTop(circleRing(cx, cy, 28, 36), z + 52, P, true),
    ladder: joinPaths([
      line([TANK.x + 4, TANK.y + 8, z + 8], [TANK.x + 4, TANK.y + TANK.d - 8, z + 44]),
      ...Array.from({ length: 6 }, (_, i) =>
        line([TANK.x + 4, TANK.y + 12 + i * 8, z + 12 + i * 6], [TANK.x + 12, TANK.y + 12 + i * 8, z + 12 + i * 6]),
      ),
    ]),
    levelGauge: line([TANK.x + TANK.w - 6, cy - 20, z + 12], [TANK.x + TANK.w - 6, cy + 20, z + 40]),
    fillLine: line([cx, TANK.y, z + 30], [FLOW.x + FLOW.w / 2, FLOW.y + FLOW.d, z + 20]),
    manway: cyl(cx - 10, cy - 8, 5, z + 46, 5),
    vents: joinPaths([
      line([cx + 8, cy - 20, z + 54], [cx + 8, cy - 28, z + 58]),
      line([cx - 8, cy - 18, z + 54], [cx - 8, cy - 26, z + 58]),
    ]),
  };
}

function controlMcc() {
  const z = PAD_H;
  const room = MCC;
  return {
    building: solid(room, z, 28, 8, 1),
    roof: solid({ x: room.x - 2, y: room.y - 2, w: room.w + 4, d: room.d + 4, r: 3 }, z + 28, 4, 6, 0.4),
    door: solid({ x: room.x + room.w - 22, y: room.y + 10, w: 14, d: 28, r: 1 }, z + 2, 24, 4, 0.3),
    window: planOutline({ x: room.x + 10, y: room.y + 12, w: 22, d: 14, r: 1 }, z + 14, P),
    hvac: solid({ x: room.x + 6, y: room.y + room.d - 10, w: 18, d: 8, r: 1 }, z + 30, 6),
    panel: solid({ x: room.x + 8, y: room.y + 8, w: 20, d: 32, r: 2 }, z + 4, 20),
    panelLines: joinPaths(
      Array.from({ length: 4 }, (_, i) =>
        line([room.x + 12, room.y + 14 + i * 6, z + 20], [room.x + 24, room.y + 14 + i * 6, z + 20]),
      ),
    ),
    mast: line([room.x + room.w / 2, room.y + room.d, z + 32], [room.x + room.w / 2, room.y + room.d + 18, z + 48]),
    antenna: onTop(circleRing(room.x + room.w / 2, room.y + room.d + 18, 3, 16), z + 48, P, true),
  };
}

function fireHse() {
  const z = PAD_H;
  const shed = FIRE;
  return {
    pad: solid(shed, z, 4, 4, 0.3),
    pump: cyl(shed.x + 14, shed.y + shed.d / 2, 6, z + 4, 12),
    motor: cyl(shed.x + 28, shed.y + shed.d / 2, 5, z + 6, 10),
    cabinet: solid({ x: shed.x + 34, y: shed.y + 6, w: 10, d: 28, r: 2 }, z + 4, 18),
    hoseReel: cyl(shed.x + 8, shed.y + 8, 5, z + 16, 4),
    eyewash: cyl(shed.x + shed.w - 10, shed.y + 10, 3, z + 14, 10),
    signage: planOutline({ x: shed.x + 4, y: shed.y + shed.d - 12, w: 20, d: 8, r: 1 }, z + 20, P),
    exhaust: line([shed.x + 20, shed.y + shed.d, z + 18], [shed.x + 20, shed.y + shed.d + 10, z + 24]),
  };
}

export const UNIT_ART = {
  "intake-header": headerAssembly(),
  "inlet-strainer": strainerAssembly(),
  "pump-p1": pumpAssembly(PUMP_P1, true),
  "pump-p2": pumpAssembly(PUMP_P2, false),
  "vfd-cabinet": vfdCabinet(),
  "discharge-manifold": dischargeManifold(),
  "surge-vessel": surgeVessel(),
  "flow-meter": flowMeter(),
  "storage-tank": storageTank(),
  "control-mcc": controlMcc(),
  "fire-hse": fireHse(),
};

/** Rough hit regions in SVG space for overlays (computed from plan tops). */
export function overlayPathForPlan(plan: Plan, lift = PAD_H + 52): string {
  return planOutline(plan, lift, P);
}

export const UNIT_OVERLAY_PATHS: Record<string, string> = Object.fromEntries(
  Object.entries({
    "intake-header": INTAKE,
    "inlet-strainer": STRAINER,
    "pump-p1": PUMP_P1,
    "pump-p2": PUMP_P2,
    "vfd-cabinet": VFD,
    "discharge-manifold": DISCHARGE,
    "surge-vessel": SURGE,
    "flow-meter": FLOW,
    "storage-tank": TANK,
    "control-mcc": MCC,
    "fire-hse": FIRE,
  }).map(([id, plan]) => [id, overlayPathForPlan(plan)]),
);

export const PART_COUNT =
  12 +
  SITE_ART.feet.length * 2 +
  6 +
  Object.values(UNIT_ART).reduce((sum, unit) => sum + JSON.stringify(unit).split('"body"').length - 1 + 8, 0);
