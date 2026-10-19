import { Dots, Line, Solid } from "./anatomy-kit/react/draw";
import { SITE_ART, UNIT_ART } from "./geometry";
import { FIG_H, FIG_W } from "./view";

const PUMP_P1 = UNIT_ART["pump-p1"];
const PUMP_P2 = UNIT_ART["pump-p2"];

export function StationArtContent() {
  return (
    <>
      <path className="iso-halo" d={SITE_ART.halo} fill="currentColor" />
      <Solid paths={SITE_ART.pad} tone="lo" />
      <Line d={SITE_ART.padGroove} tone="faint" />
      <Line d={SITE_ART.padTicks} tone="faint" />
      <Line d={SITE_ART.padLabel} tone="mid" />
      <Line d={SITE_ART.padLabelLines} tone="faint" />
      {SITE_ART.feet.map((foot, index) => (
        <g key={`foot-${index}`}>
          <Solid paths={foot.foot} tone="lo" />
          <Solid paths={foot.pad} tone="mid" />
        </g>
      ))}
      <Dots points={SITE_ART.padScrews} />
      <Line d={SITE_ART.pipeRunA} tone="mid" />
      <Line d={SITE_ART.pipeRunB} tone="mid" />
      <Line d={SITE_ART.cableTray} tone="faint" />

      <g data-unit-id="intake-header" className="station-unit">
        <IntakeHeader />
      </g>
      <g data-unit-id="inlet-strainer" className="station-unit">
        <Strainer />
      </g>
      <g data-unit-id="pump-p1" className="station-unit">
        <Pump unit={PUMP_P1} litMotor />
      </g>
      <g data-unit-id="pump-p2" className="station-unit">
        <Pump unit={PUMP_P2} />
      </g>
      <g data-unit-id="vfd-cabinet" className="station-unit">
        <Vfd />
      </g>
      <g data-unit-id="discharge-manifold" className="station-unit">
        <Discharge />
      </g>
      <g data-unit-id="surge-vessel" className="station-unit">
        <Surge />
      </g>
      <g data-unit-id="flow-meter" className="station-unit">
        <FlowMeter />
      </g>
      <g data-unit-id="storage-tank" className="station-unit">
        <Tank />
      </g>
      <g data-unit-id="control-mcc" className="station-unit">
        <Mcc />
      </g>
      <g data-unit-id="fire-hse" className="station-unit">
        <FireHse />
      </g>
    </>
  );
}

export function StationArt() {
  return (
    <svg
      className="station-svg"
      viewBox={`0 0 ${FIG_W} ${FIG_H}`}
      width={FIG_W}
      height={FIG_H}
      role="img"
      aria-label="Isometric pumping station diagram"
    >
      <StationArtContent />
    </svg>
  );
}

function IntakeHeader() {
  const u = UNIT_ART["intake-header"];
  return (
    <>
      <Solid paths={u.slab} tone="mid" />
      <Solid paths={u.flange} tone="hi" />
      <Solid paths={u.branchA} tone="mid" />
      <Solid paths={u.branchB} tone="mid" />
      <Solid paths={u.gauge} tone="hi" lit />
      <Line d={u.ticks} tone="faint" />
      <Dots points={u.screws} />
    </>
  );
}

function Strainer() {
  const u = UNIT_ART["inlet-strainer"];
  return (
    <>
      <Solid paths={u.body} tone="mid" />
      <Solid paths={u.basket} tone="hi" />
      <Line d={u.lid} tone="mid" />
      <Solid paths={u.clamp} tone="lo" />
      <Line d={u.vent} tone="mid" />
      <Dots points={u.screws} />
    </>
  );
}

function Pump({
  unit,
  litMotor = false,
}: {
  unit: (typeof UNIT_ART)["pump-p1"];
  litMotor?: boolean;
}) {
  return (
    <>
      <Solid paths={unit.base} tone="lo" />
      <Dots points={unit.baseScrews} />
      <Solid paths={unit.casing} tone="hi" lit={litMotor} />
      <Solid paths={unit.volute} tone="mid" />
      <Solid paths={unit.coupling} tone="lo" />
      <Solid paths={unit.motor} tone="mid" lit={litMotor} />
      <Line d={unit.motorKnurl} tone="faint" />
      <Dots points={unit.footBolts} />
      <Line d={unit.discharge} tone="mid" />
      <Line d={unit.suction} tone="mid" />
    </>
  );
}

function Vfd() {
  const u = UNIT_ART["vfd-cabinet"];
  return (
    <>
      <Solid paths={u.cabinet} tone="lo" />
      <Solid paths={u.door} tone="mid" />
      <Line d={u.ventSlots} tone="faint" />
      <Solid paths={u.handle} tone="hi" />
      <Line d={u.label} tone="faint" />
      <Dots points={u.feet} />
      <Solid paths={u.statusLamp} tone="hi" lit />
    </>
  );
}

function Discharge() {
  const u = UNIT_ART["discharge-manifold"];
  return (
    <>
      <Solid paths={u.rail} tone="mid" />
      <Line d={u.supports} tone="lo" />
      {u.valves.map((valve, index) => (
        <g key={`valve-${index}`}>
          <Solid paths={valve.body} tone="hi" />
          <Line d={valve.wheel} tone="mid" />
          <Line d={valve.stem} tone="faint" />
        </g>
      ))}
    </>
  );
}

function Surge() {
  const u = UNIT_ART["surge-vessel"];
  return (
    <>
      <Solid paths={u.skirt} tone="lo" />
      <Solid paths={u.shell} tone="mid" />
      <Line d={u.topDome} tone="hi" />
      <Solid paths={u.manway} tone="hi" />
      <Solid paths={u.gauge} tone="hi" lit />
      <Line d={u.pipe} tone="mid" />
      <Line d={u.band} tone="faint" />
      <Dots points={u.baseBolts} />
    </>
  );
}

function FlowMeter() {
  const u = UNIT_ART["flow-meter"];
  return (
    <>
      <Solid paths={u.skid} tone="lo" />
      <Solid paths={u.run} tone="mid" />
      <Solid paths={u.meter} tone="hi" lit />
      <Solid paths={u.transmitter} tone="mid" />
      <Line d={u.flanges} tone="faint" />
      <Dots points={u.screws} />
    </>
  );
}

function Tank() {
  const u = UNIT_ART["storage-tank"];
  return (
    <>
      <Solid paths={u.bund} tone="lo" />
      <Solid paths={u.shell} tone="mid" />
      <Line d={u.roof} tone="hi" />
      <Line d={u.ladder} tone="mid" />
      <Line d={u.levelGauge} tone="hi" />
      <Line d={u.fillLine} tone="faint" />
      <Solid paths={u.manway} tone="hi" />
      <Line d={u.vents} tone="faint" />
    </>
  );
}

function Mcc() {
  const u = UNIT_ART["control-mcc"];
  return (
    <>
      <Solid paths={u.building} tone="lo" />
      <Solid paths={u.roof} tone="mid" />
      <Solid paths={u.door} tone="mid" />
      <Line d={u.window} tone="hi" />
      <Solid paths={u.hvac} tone="lo" />
      <Solid paths={u.panel} tone="hi" />
      <Line d={u.panelLines} tone="faint" />
      <Line d={u.mast} tone="mid" />
      <Line d={u.antenna} tone="hi" />
    </>
  );
}

function FireHse() {
  const u = UNIT_ART["fire-hse"];
  return (
    <>
      <Solid paths={u.pad} tone="lo" />
      <Solid paths={u.pump} tone="hi" lit />
      <Solid paths={u.motor} tone="mid" />
      <Solid paths={u.cabinet} tone="mid" />
      <Solid paths={u.hoseReel} tone="hi" />
      <Solid paths={u.eyewash} tone="hi" />
      <Line d={u.signage} tone="faint" />
      <Line d={u.exhaust} tone="mid" />
    </>
  );
}
