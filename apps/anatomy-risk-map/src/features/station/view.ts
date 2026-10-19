import { boxCorners, fitProjection, iso, type Plan, type Point3, type Projection } from "./anatomy-kit/iso-kit";

export const FIG_W = 760;
export const FIG_H = 500;
export const AZIMUTH = 45;

export const PAD: Plan = { x: -210, y: -130, w: 420, d: 260, r: 8 };
export const PAD_H = 10;
export const FOOT_H = 6;

export const INTAKE: Plan = { x: -195, y: -115, w: 58, d: 42, r: 4 };
export const STRAINER: Plan = { x: -125, y: -108, w: 48, d: 36, r: 3 };
export const PUMP_P1: Plan = { x: -70, y: -95, w: 52, d: 46, r: 4 };
export const PUMP_P2: Plan = { x: -5, y: -95, w: 52, d: 46, r: 4 };
export const VFD: Plan = { x: 70, y: -100, w: 62, d: 38, r: 3 };
export const DISCHARGE: Plan = { x: -120, y: -35, w: 140, d: 32, r: 3 };
export const SURGE: Plan = { x: 40, y: -40, w: 36, d: 36, r: 18 };
export const FLOW: Plan = { x: -195, y: 25, w: 44, d: 40, r: 3 };
export const TANK: Plan = { x: 85, y: 15, w: 72, d: 72, r: 6 };
export const MCC: Plan = { x: -195, y: 55, w: 88, d: 52, r: 4 };
export const FIRE: Plan = { x: 130, y: 95, w: 48, d: 40, r: 3 };

export function planCenter(plan: Plan): Point3 {
  return [plan.x + plan.w / 2, plan.y + plan.d / 2, PAD_H + 54];
}

export const UNIT_PLANS: Record<string, Plan> = {
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
};

function collectCorners(): Point3[] {
  const plans = [PAD, INTAKE, STRAINER, PUMP_P1, PUMP_P2, VFD, DISCHARGE, SURGE, FLOW, TANK, MCC, FIRE];
  const zs = [-FOOT_H, PAD_H, 55, 75];
  const points: Point3[] = [];
  for (const plan of plans) {
    for (const z of zs) {
      points.push(...boxCorners(plan, z, z + 1));
    }
  }
  return points;
}

export const P: Projection = fitProjection(collectCorners(), FIG_W, FIG_H, { pad: 32, azimuth: AZIMUTH });

export const at = (point: Point3) => iso(point, P);

export const UNIT_LABEL_POSITIONS: Record<string, [number, number]> = Object.fromEntries(
  Object.entries(UNIT_PLANS).map(([id, plan]) => {
    const [x, y] = iso(planCenter(plan), P);
    return [id, [x, y]];
  }),
);
