export interface HeloCrewTask {
  id: string;
  name: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  detail: string;
  timeBenchmark?: string;
}

export interface HeloCrewMember {
  id: string;
  name: string;
  callsign: string;
  hairColor: string;
  flightSuitColor: string;
  flightSuitHex: string;
  roleTitle: string;
  specialtyDomain: 'Avionics & Telemetry' | 'Mechanical & Running Gear' | 'Pneumatics, Cryo & Fuel';
  station: string;
  clearance: string;
  responsibilities: string[];
  equipment: string[];
  telemetryMetrics: {
    label: string;
    value: string;
    unit?: string;
    status: 'optimal' | 'warning' | 'nominal';
  }[];
  activeTasks: HeloCrewTask[];
  quote: string;
  // Visual positions on views (percentage 0-100)
  viewHotspots: {
    ground_hotpit?: { x: number; y: number };
    cockpit_chase?: { x: number; y: number };
    mobile_workshop?: { x: number; y: number };
  };
}

export interface HeloSceneView {
  id: 'ground_hotpit' | 'cockpit_chase' | 'mobile_workshop';
  title: string;
  subtitle: string;
  description: string;
  image: string;
  calloutBadge: string;
  environmentConditions: {
    altitude: string;
    groundSpeed: string;
    ambientTemp: string;
    rotorRpm: string;
    commChannel: string;
  };
}

export const HELO_SCENE_VIEWS: HeloSceneView[] = [
  {
    id: 'ground_hotpit',
    title: 'Touchdown Hot-Pit Staging',
    subtitle: 'Desert Dry-Lake Remote Paddock & Fastback #13 Rapid Service Pad',
    description:
      'MH®55 Tool Carrier #ooz (004) landed in the Mojave wash with aft cargo ramp lowered, Snap-on master tool chest deployed, and all 3 specialists executing high-flow refueling and beadlock tire checks on Fastback #13.',
    image: '/src/assets/images/mh55_rotary_tool_truck.png',
    calloutBadge: 'AFT CARGO RAMP HOT-PIT',
    environmentConditions: {
      altitude: 'Touchdown / 2,140 ft MSL',
      groundSpeed: '0 KTS (Hover Anchored)',
      ambientTemp: '104°F (Dry Lake Bed)',
      rotorRpm: '112 RPM (Ground Idle)',
      commChannel: 'VHF Tac-1 / 142.850 MHz',
    },
  },
  {
    id: 'cockpit_chase',
    title: 'Low-Altitude Pursuit & Chase',
    subtitle: 'Tactical Cockpit Command Tracking Fastback #13 Across Desert Washes',
    description:
      'Multi-pane cockpit observation at 140 knots, flying 40 feet above terrain tracking Fastback #13. Pilot cyclic control, co-pilot terrain radar navigation, and overhead circuit breaker management.',
    image: '/src/assets/images/helo_cockpit_chase_1793468726042.jpg',
    calloutBadge: '140 KTS TACTICAL CHASE',
    environmentConditions: {
      altitude: '45 ft AGL / 2,185 ft MSL',
      groundSpeed: '142 KTS Groundspeed',
      ambientTemp: '96°F (Air Stream)',
      rotorRpm: '179 RPM (100% Turboshaft Mast)',
      commChannel: 'Air-to-Ground FM / 462.575 MHz',
    },
  },
  {
    id: 'mobile_workshop',
    title: 'Airborne Workshop & Clean-Lab',
    subtitle: 'Fuselage Mobile Tool Bay with Diagnostics, Pneumatics & Fluidics Consoles',
    description:
      'Interior mobile laboratory inside the MH-55 fuselage. Features three dedicated operational stations: Bubbles at Pneumatics & Airflow, Blossom at the Holographic Diode & Haptics Table, and Buttercup at the Oils, Fluids & Fuel Manifold.',
    image: '/src/assets/images/helo_avionics_workshop_1793468742337.jpg',
    calloutBadge: 'CLEAN-LAB AVIONICS CONSOLE',
    environmentConditions: {
      altitude: 'Internal Cabin Atmosphere',
      groundSpeed: 'Stationary / In-Flight Capable',
      ambientTemp: '72°F (Air-Conditioned Lab)',
      rotorRpm: 'Turbine APU 100% Bleed Air',
      commChannel: 'Internal Intercom ICS-3',
    },
  },
];

export const HELO_CREW_MEMBERS: HeloCrewMember[] = [
  {
    id: 'crew-blossom-red',
    name: 'Blossom (Red Hair)',
    callsign: 'BLOSSOM · RED-1',
    hairColor: 'Auburn / Fiery Red',
    flightSuitColor: 'Crimson Red / High-Contrast Pilot Suit',
    flightSuitHex: '#DC2626',
    roleTitle: 'Lead Systems & Avionics Stage Director',
    specialtyDomain: 'Avionics & Telemetry',
    station: 'Cockpit Flight Command & Holographic Telemetry Table',
    clearance: 'US-1 Authority Direct Clearance · ATO PEC SL USA 00711617',
    quote: '"All diode matrices locked. 80ms magneto ignition kill sync verified. Fastback 13 cleared for hot-pit release!"',
    responsibilities: [
      'Low-altitude flight guidance, cyclic/collective altitude hold during high-speed desert washes.',
      'Master vehicle optical diode matrices, circuit health, and tactile haptic glove sensor calibration.',
      'Hot-pit release authorization: verifies 80ms magneto kill interlocks, fuel cutoff solenoids, and telemetry handshake before giving car launch green flag.',
      'Primary communications uplink with 1401 Madrone St (Boulder City, NV) and US-1 authority command.'
    ],
    equipment: [
      'Holographic Diode & Light Diagnostic Bus',
      'Tactile Haptic Glove Calibrators',
      'Twin Honeywell MFD Avionics Suite',
      'VHF/UHF Air-to-Ground Squelch Transceiver',
      'Magnetic Lanyard Ignition Kill Interlock'
    ],
    telemetryMetrics: [
      { label: 'Comm Uplink', value: '142.850 MHz', unit: 'VHF Tac-1', status: 'optimal' },
      { label: 'Avionics Bus Load', value: '98.4%', unit: 'Normal', status: 'optimal' },
      { label: 'Haptic Sensors', value: '12 / 12', unit: 'Online', status: 'optimal' },
      { label: 'Hot-Pit Clearance', value: 'ARMED', unit: 'Green Flag', status: 'optimal' },
    ],
    activeTasks: [
      {
        id: 'task-r1',
        name: 'Tactical Radar & Wash Waypoint Lock',
        status: 'COMPLETED',
        detail: '360° terrain sweep synchronized with GIS coordinates and desert waypoint splits.',
        timeBenchmark: '00:08 sec',
      },
      {
        id: 'task-r2',
        name: 'Fastback #13 Magneto Interlock Sync',
        status: 'ACTIVE',
        detail: 'Mallory Super-Mag IV 80ms emergency cutoff verified across air-to-ground telemetry.',
        timeBenchmark: '00:14 sec',
      },
      {
        id: 'task-r3',
        name: 'Stage Launch Go/No-Go Release',
        status: 'PENDING',
        detail: 'Final visual and pressure confirmation to release car back onto course at W.O.T.',
        timeBenchmark: '00:03 sec',
      },
    ],
    viewHotspots: {
      ground_hotpit: { x: 62, y: 68 },
      cockpit_chase: { x: 55, y: 55 },
      mobile_workshop: { x: 56, y: 48 },
    },
  },
  {
    id: 'crew-buttercup-brunette',
    name: 'Buttercup (Brunette)',
    callsign: 'BUTTERCUP · GREEN-2',
    hairColor: 'Brunette / Chestnut Brown',
    flightSuitColor: 'Olive Drab / Emerald Green Flight Suit',
    flightSuitHex: '#16A34A',
    roleTitle: 'Master Mechanical & Running Gear Specialist',
    specialtyDomain: 'Mechanical & Running Gear',
    station: 'Aft Cargo Ramp Mobile Workshop & Oils/Fluids Manifold',
    clearance: 'C.O.R.E. Master Mechanical Lead · Level-4 High-Stress Paddock',
    quote: '"All 35-spline hub studs torqued to 145 lb-ft. Winters quick-change oil pressure at 85 PSI. Suspension ready for the whoops."',
    responsibilities: [
      'Master rolling Snap-on multi-drawer tool chest operation: pneumatic impact wrenches, torque multipliers, calipers.',
      'Running gear rapid service: 37x12.50R17 Cooper Discoverer STT Pro beadlock tire swaps and bead tension bolts.',
      'Oils, fluids, and fuel manifold calibration: engine dry-sump oil (65 PSI hot), Jerico dog-box 75W-140, Winters diff fluid delivery.',
      'Fox 3.5 5-tube bypass shock temperature telemetry and bump-stop mechanical inspection under 45 seconds.'
    ],
    equipment: [
      'Snap-on Master Multi-Bay Rolling Tool Chest',
      'Pneumatic 1-Inch Heavy-Duty Impact Gun',
      '350 LB-FT Planetary Torque Multiplier',
      'High-Pressure Braided Fluid Manifold & Quick-Disconnect Valves',
      'Auxiliary Race Fluid Dispenser & Oil Temp Probes'
    ],
    telemetryMetrics: [
      { label: 'Fluid Manifold Pressure', value: '85', unit: 'PSI Regulated', status: 'optimal' },
      { label: 'Tool Chest Deployment', value: '100%', unit: 'All Bays Ready', status: 'optimal' },
      { label: 'Tire Swap Benchmark', value: '28.4', unit: 'Seconds', status: 'optimal' },
      { label: 'Dry-Sump Oil Temp', value: '195°F', unit: 'Nominal', status: 'optimal' },
    ],
    activeTasks: [
      {
        id: 'task-b1',
        name: 'Snap-on Multi-Bay Tool Station Deployment',
        status: 'COMPLETED',
        detail: 'Rolled out aft ramp onto desert mat; metric and SAE race tooling staged.',
        timeBenchmark: '00:12 sec',
      },
      {
        id: 'task-b2',
        name: '37" Cooper Beadlock Torque Verification',
        status: 'ACTIVE',
        detail: 'Lug nuts torqued to 145 lb-ft; outer beadlock ring checked with torque clicker.',
        timeBenchmark: '00:22 sec',
      },
      {
        id: 'task-b3',
        name: 'Jerico Dog-Box & Quick-Change Fluid Delivery',
        status: 'PENDING',
        detail: 'Synthetic 75W-140 fluid injection via pressurized manifold quick-disconnect line.',
        timeBenchmark: '00:15 sec',
      },
    ],
    viewHotspots: {
      ground_hotpit: { x: 15, y: 55 },
      cockpit_chase: { x: 92, y: 62 },
      mobile_workshop: { x: 80, y: 52 },
    },
  },
  {
    id: 'crew-bubbles-blonde',
    name: 'Bubbles (Blonde)',
    callsign: 'BUBBLES · GOLD-3',
    hairColor: 'Golden Platinum Blonde',
    flightSuitColor: 'Gold & White / High-Visibility Cryo Suit',
    flightSuitHex: '#EAB308',
    roleTitle: 'Pneumatics, Cryo & Airflow Specialist',
    specialtyDomain: 'Pneumatics, Cryo & Fuel',
    station: 'High-Pressure Umbilical Reel & Overhead Nitrogen Wall Console',
    clearance: 'High-Pressure Fluidics & Hazmat Refueling Operator',
    quote: '"Dual 3,000 PSI nitrogen banks stabilized at 150 PSI. 50 GPM dry-break race fuel locked. Tire pressures dialed to 16.5 PSI."',
    responsibilities: [
      'High-pressure nitrogen bank regulation: dual 3,000 PSI bottles stepped down to 150 PSI for high-speed air jacks.',
      '50 GPM dry-break race fuel umbilical handling: manages heavy braided fuel line from MH-55 internal JP-8 / 110 octane fuel cell directly into car Pro Cell.',
      'Engine dust particle vortex air separator (EAPS) intake filtration monitoring during low-altitude desert hovering.',
      'Airflow and tire pressure micro-tuning: regulates nitrogen inflation between 14 PSI (silt bed traction) and 24 PSI (dry lake speed).'
    ],
    equipment: [
      'Dual 3,000 PSI High-Volume Nitrogen Gas Cylinders',
      'Overhead 150 PSI Regulated Pneumatic Line Reels',
      '50 GPM Dry-Break Anti-Spill Race Fuel Umbilical Nozzle',
      'Digital Nitrogen Tire Pressure Inflator & Deflator Gauge',
      'EAPS Centrifugal Silt Separator Purge Valves'
    ],
    telemetryMetrics: [
      { label: 'Nitrogen Bank Pressure', value: '2,880', unit: 'PSI Remaining', status: 'optimal' },
      { label: 'Pneumatic Jack Line', value: '150', unit: 'PSI Active', status: 'optimal' },
      { label: 'Race Fuel Umbilical', value: '48.6', unit: 'GPM Dry-Break', status: 'optimal' },
      { label: 'EAPS Filtration Rate', value: '99.8%', unit: 'Silt Rejection', status: 'optimal' },
    ],
    activeTasks: [
      {
        id: 'task-g1',
        name: 'Engage Dual 3,000 PSI Nitrogen Banks',
        status: 'COMPLETED',
        detail: 'Pneumatic manifold pressure stabilized at 150 PSI for four-corner onboard air jacks.',
        timeBenchmark: '00:05 sec',
      },
      {
        id: 'task-g2',
        name: '50 GPM Dry-Break Fuel Umbilical Docking',
        status: 'ACTIVE',
        detail: 'Heavy braided fuel hose locked into Pro Cell inlet; zero vapor leakage confirmed.',
        timeBenchmark: '00:18 sec',
      },
      {
        id: 'task-g3',
        name: 'Dynamic Nitrogen Tire Pressure Micro-Tune',
        status: 'PENDING',
        detail: 'Regulate tires to 16.5 PSI nitrogen for upcoming rocky washboard section.',
        timeBenchmark: '00:10 sec',
      },
    ],
    viewHotspots: {
      ground_hotpit: { x: 82, y: 56 },
      cockpit_chase: { x: 74, y: 15 },
      mobile_workshop: { x: 23, y: 52 },
    },
  },
];

export const MH55_AIRCRAFT_SPECS = {
  designation: 'MH®55 Tool Carrier & Airborne Mobile Workshop',
  raceNumber: '#ooz (004)',
  callsign: 'EXCALIBUR ROTARY-004',
  authority: '13 Aerospace Defense Company · Shawn Patrick Cooper Gardner (Sole Proprietor)',
  naicsCode: '541715 R&D',
  pecSecurityCert: 'PEC SL USA 00711617',
  powerplant: 'Twin GE T64-GE-416A Turboshaft Turbines (8,760 Combined Shaft Horsepower)',
  mainTransmission: 'Heavy Planetary 3.33:1 Epicyclic Mast Reduction (179 RPM Mast)',
  tailRotor: 'High-Angle Symmetrical 4-Blade Planetary Tail Rotor Drive',
  rotorDiameter: '72 ft (21.9 m) Titanium/Composite Main Blades',
  fuselageLength: '88 ft (26.8 m) Heavy Tactical Transporter',
  internalFuelCapacity: '1,050 Gallons JP-8 Jet Turbine Fuel + 200 Gallon 110 Octane Race Fuel Bladder',
  auxiliaryToolPayload: '16,000 lbs (Mobile Workshop, Snap-on Chests, Nitrogen Banks, Spare Tires)',
  cruisingSpeed: '142 Knots (163 MPH)',
  maximumRange: '540 Nautical Miles',
};

export interface GroundSupportEquipment {
  id: string;
  name: string;
  category: 'PNEUMATICS' | 'POWER & START' | 'LIFT & EXTRACTION' | 'REFUELING' | 'TOOLING & DIAG';
  operatorId: 'crew-blossom-red' | 'crew-buttercup-brunette' | 'crew-bubbles-blonde';
  status: 'STAGED' | 'ACTIVE' | 'STANDBY' | 'DEPLOYED';
  specs: string;
  operationalDetail: string;
  quickActionLabel: string;
}

export const GSE_INVENTORY: GroundSupportEquipment[] = [
  {
    id: 'gse-gpu-start',
    name: 'GPU-28V Continental Turbine Start & Ground Power Cart',
    category: 'POWER & START',
    operatorId: 'crew-blossom-red',
    status: 'ACTIVE',
    specs: '28V DC Continuous @ 1,200A / 115V 400Hz 3-Phase Auxiliary',
    operationalDetail:
      'Provides isolated filtered bus power for MH-55 avionics and twin T64 starter spooling without battery drain.',
    quickActionLabel: 'SPOOL APU 28V BUS',
  },
  {
    id: 'gse-crane-hoist',
    name: 'Tactical 5-Ton Hydraulic Extraction Boom & Rescue Winch',
    category: 'LIFT & EXTRACTION',
    operatorId: 'crew-buttercup-brunette',
    status: 'STAGED',
    specs: '10,000 lbs Static Lift Capacity / 120 ft High-Tensile Synthetic Cable',
    operationalDetail:
      'Mounted along MH-55 dorsal hardpoint; enables rapid air-lifting of stranded race chassis from deep wash trenches.',
    quickActionLabel: 'DEPLOY EXTRACTION HOIST',
  },
  {
    id: 'gse-nitrogen-cascade',
    name: 'Dual 3,000 PSI High-Volume Cryo/Nitrogen Cascade Bank',
    category: 'PNEUMATICS',
    operatorId: 'crew-bubbles-blonde',
    status: 'DEPLOYED',
    specs: 'Twin 300-cu ft Bottles / Dual Victor Regulators 0-600 PSI (Set: 150 PSI)',
    operationalDetail:
      'Powers Fastback #13 four-corner onboard air jacks in 0.8 seconds; supplies dry filtered nitrogen for 16.5 PSI tire fills.',
    quickActionLabel: 'PRESSURIZE AIR JACKS (150 PSI)',
  },
  {
    id: 'gse-fuel-boom',
    name: '50 GPM Dry-Break JP-8 & 110 Octane High-Flow Fuel Umbilical',
    category: 'REFUELING',
    operatorId: 'crew-bubbles-blonde',
    status: 'ACTIVE',
    specs: '2-Inch Dual Braided Aeroquip Hose / Mil-Spec Dry Break Cam-Locks',
    operationalDetail:
      'Gravity and pressurized fuel transfer directly from MH-55 internal auxiliary bladder into Fastback #13 ATL fuel cell in under 18 seconds.',
    quickActionLabel: 'LOCK FUEL UMBILICAL (50 GPM)',
  },
  {
    id: 'gse-snapon-chest',
    name: 'Snap-on Master 72" Multi-Bay Rolling Desert Paddock Chest',
    category: 'TOOLING & DIAG',
    operatorId: 'crew-buttercup-brunette',
    status: 'DEPLOYED',
    specs: '18 Heavy Drawers / 1-Inch Pneumatic Impacts / 350 lb-ft Multipliers / SAE & Metric',
    operationalDetail:
      'Rolls down the aft hydraulic ramp on heavy polyurethane solid casters directly to car right-flank.',
    quickActionLabel: 'STAGE IMPACT MULTIPLIERS',
  },
  {
    id: 'gse-laser-torque',
    name: 'Laser Chassis Alignment & 35-Spline Beadlock Torque Rig',
    category: 'TOOLING & DIAG',
    operatorId: 'crew-buttercup-brunette',
    status: 'STAGED',
    specs: 'Class-IIIb Precision Green Diode / Digital Bluetooth Torque Clickers (145 lb-ft)',
    operationalDetail:
      'Rapidly checks camber/toe drift after hard whoop landings and verifies all 20 beadlock ring bolts.',
    quickActionLabel: 'AUDIT BEADLOCK TORQUE',
  },
  {
    id: 'gse-eaps-filtration',
    name: 'EAPS Centrifugal Vortex Silt Separator Purge Cart',
    category: 'POWER & START',
    operatorId: 'crew-blossom-red',
    status: 'ACTIVE',
    specs: 'Dynamic Multi-Tube Cyclonic Rejection / 99.8% Sub-10-Micron Dust Purge',
    operationalDetail:
      'Protects GE T64 turboshaft compressor stages from razor-sharp Mojave quartz sand during hover operations.',
    quickActionLabel: 'CYCLONE PURGE ACCUMULATOR',
  },
];

export interface MissionProfile {
  id: string;
  code: string;
  title: string;
  operationType: 'TACTICAL INTERCEPT' | 'HIGH-SPEED PURSUIT' | 'DESERT EXTRACTION' | 'HANGAR TURNAROUND';
  targetZone: string;
  flightDuration: string;
  environmentalHazards: string[];
  primaryObjective: string;
  crewFocus: {
    blossom: string;
    buttercup: string;
    bubbles: string;
  };
  recommendedGseIds: string[];
  defaultTelemetry: {
    airspeedKts: number;
    altitudeFt: number;
    turbineEgtC: number;
    rotorRpm: number;
    rangeToFastbackYards: number;
    carTirePsi: number;
  };
}

export const MISSION_PROFILES: MissionProfile[] = [
  {
    id: 'profile-mojave-hotpit',
    code: 'SORTIE-01 // HOT-PIT',
    title: 'Mojave Dry-Lake Hot-Pit Intercept',
    operationType: 'TACTICAL INTERCEPT',
    targetZone: 'El Mirage & Lucerne Dry Lake Beds (Zone 4)',
    flightDuration: '45 Minutes Staging / 35-Second Pit Stops',
    environmentalHazards: ['104°F Ambient Ground Bed', 'High-Velocity Silt Dust Blows', 'Alkali Dust Cloud Ingestion'],
    primaryObjective:
      'Intercept Fastback #13 at checkpoint Mile 142. Lower aft ramp, swap rear Cooper 37" beadlocks, deliver 22 gallons of 110 octane fuel, and verify 80ms ignition kill interlock.',
    crewFocus: {
      blossom: 'Comm tac-1 radio link, laser tracking alignment, final green flag launch authorization.',
      buttercup: 'Aft ramp deploy, 145 lb-ft pneumatic stud torque, Winters quick-change temp probe check.',
      bubbles: '150 PSI nitrogen air jack line connection, 50 GPM dry-break fuel docking, 16.5 PSI tire pressure micro-tune.',
    },
    recommendedGseIds: ['gse-nitrogen-cascade', 'gse-fuel-boom', 'gse-snapon-chest'],
    defaultTelemetry: {
      airspeedKts: 0,
      altitudeFt: 2140,
      turbineEgtC: 620,
      rotorRpm: 112,
      rangeToFastbackYards: 12,
      carTirePsi: 16.5,
    },
  },
  {
    id: 'profile-nevada-pursuit',
    code: 'SORTIE-02 // CHASE',
    title: 'Nevada Test Range High-Speed Dust Sortie',
    operationType: 'HIGH-SPEED PURSUIT',
    targetZone: 'Tonopah Wash & Nellis Complex Corridors (Zone B)',
    flightDuration: '90 Minutes Active Pursuit @ 140 Knots',
    environmentalHazards: ['40 ft AGL Low-Altitude Wind Shear', 'Quartz Sand Vortex Ingestion', 'GPS Spoofing / Denied Zone'],
    primaryObjective:
      'Shadow Fastback #13 at 140 knots through canyon washes. Relay forward terrain washouts via air-to-ground FM link, continuous telemetry logging of dry-sump oil and shock temps.',
    crewFocus: {
      blossom: 'Low-altitude collective/cyclic guidance, forward FLIR infrared obstacle alert, GIS waypoint splits.',
      buttercup: 'Suspension stroke telemetry monitoring, drivetrain vibration spectrum analysis.',
      bubbles: 'EAPS vortex silt separator continuous blow-down, turbine bleed air management.',
    },
    recommendedGseIds: ['gse-gpu-start', 'gse-eaps-filtration'],
    defaultTelemetry: {
      airspeedKts: 142,
      altitudeFt: 2185,
      turbineEgtC: 785,
      rotorRpm: 179,
      rangeToFastbackYards: 85,
      carTirePsi: 17.2,
    },
  },
  {
    id: 'profile-baja-rescue',
    code: 'SORTIE-03 // EXTRACTION',
    title: 'Baja 1000 Deep Silt Rescue & Air-Drop Extraction',
    operationType: 'DESERT EXTRACTION',
    targetZone: 'San Felipe Silt Beds & Mike’s Sky Rancho Ridgeline',
    flightDuration: '120 Minutes Extended Range / Hover Hoist',
    environmentalHazards: ['Powder Silt "Fesh-Fesh" Inundation', 'Mountain Downdrafts', 'Zero Visibility Brownout'],
    primaryObjective:
      'Locate vehicle in stranded silt wash using FLIR sensor. Deploy 5-ton tactical extraction winch or drop replacement Cooper beadlocks and auxiliary nitrogen canisters.',
    crewFocus: {
      blossom: 'Hover stability hold in brownout conditions, night FLIR thermal target acquisition.',
      buttercup: 'Hydraulic hoist winch cable deployment, 10,000 lbs sling rig latching to Fastback roll cage.',
      bubbles: 'Air-drop auxiliary nitrogen cylinder rigging, emergency dry-sump lube bladder delivery.',
    },
    recommendedGseIds: ['gse-crane-hoist', 'gse-laser-torque', 'gse-nitrogen-cascade'],
    defaultTelemetry: {
      airspeedKts: 22,
      altitudeFt: 180,
      turbineEgtC: 740,
      rotorRpm: 179,
      rangeToFastbackYards: 35,
      carTirePsi: 14.0,
    },
  },
  {
    id: 'profile-boulder-overhaul',
    code: 'SORTIE-04 // LAB-MAINT',
    title: 'Boulder City Hangar Turnaround & Clean-Lab Overhaul',
    operationType: 'HANGAR TURNAROUND',
    targetZone: '1401 Madrone St (Boulder City, NV) & 13ADC Flight Hangar',
    flightDuration: 'Base Overhaul / Scheduled Maintenance',
    environmentalHazards: ['Controlled 72°F Clean-Lab Environment', 'High-Voltage Avionics Calibration'],
    primaryObjective:
      'Post-race complete systems overhaul. Borescope inspection of T64 turbine blades, ultrasonic crack testing on 35-spline axles, Jerico dog-box tear-down, and on-chain XRPL ledger payment audit.',
    crewFocus: {
      blossom: 'Master holographic diode matrix recalibration, XRPL cryptographic provenance ledger signing.',
      buttercup: 'Winters quick-change gear teardown, Fox 3.5 internal valving rebuild, hub torque certs.',
      bubbles: 'Cryo line vacuum testing, high-pressure nitrogen bottle recharge to 3,000 PSI.',
    },
    recommendedGseIds: ['gse-gpu-start', 'gse-snapon-chest', 'gse-laser-torque'],
    defaultTelemetry: {
      airspeedKts: 0,
      altitudeFt: 2500,
      turbineEgtC: 24,
      rotorRpm: 0,
      rangeToFastbackYards: 0,
      carTirePsi: 22.0,
    },
  },
];

