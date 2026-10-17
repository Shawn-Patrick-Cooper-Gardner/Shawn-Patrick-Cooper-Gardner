export interface VehicleComponent {
  id: string;
  name: string;
  category: 'Induction' | 'Engine' | 'Suspension' | 'Drivetrain' | 'Safety';
  spec: string;
  description: string;
  xPercent: number; // For hotspot positioning on image (0-100)
  yPercent: number;
}

export interface Vehicle {
  id: string;
  name: string;
  year: number;
  class: string;
  tagline: string;
  raceNumber: string;
  image: string;
  baseHp: number;
  baseTorque: number;
  displacement: string;
  induction: string;
  ignition: string;
  exhaust: string;
  transmission: string;
  rearEnd: string;
  frontSuspension: string;
  rearSuspension: string;
  tires: string;
  wheelbase: string;
  weightLbs: number;
  fuelCapacity: string;
  enduranceRaces: string[];
  components: VehicleComponent[];
}

export const VEHICLES: Vehicle[] = [
  {
    id: 'fastback-1970-runner',
    name: '1970 Fastback GTA Desert Runner',
    year: 1970,
    class: 'Classic Desert Trophy Conversion',
    tagline: 'High-clearance desert endurance conversion built on classic American muscle.',
    raceNumber: '13',
    image: '/src/assets/images/fastback_desert_runner_1792218566826.jpg',
    baseHp: 820,
    baseTorque: 760,
    displacement: '429 cu. in. Big Block Ford V8',
    induction: 'Roots 8-71 Supercharger with Dual 750 CFM Holley Double-Pumpers',
    ignition: 'Mallory Super-Mag Magneto with high-output copper core leads',
    exhaust: 'Custom ceramic-coated long-tube headers with 3.5" side-exit collectors',
    transmission: 'Heavy-duty C6 3-speed automatic with manual reverse valve body & auxiliary cooler',
    rearEnd: 'Full-floating Ford 9-inch housing with 4.56 Richmond gears & 35-spline axles',
    frontSuspension: 'Custom equal-length fabricated I-beams with Fox 3.0 Internal Bypass coilovers (22" travel)',
    rearSuspension: 'Triangulated 4-link rear geometry with Fox 3.5 5-tube bypass shocks (26" travel)',
    tires: '37x12.50R17 Cooper Discoverer STT Pro mounted on forged beadlock alloys',
    wheelbase: '112.5 inches',
    weightLbs: 4650,
    fuelCapacity: '42 Gallon Fuel Safe Pro Cell with dual Bosch 044 fuel pumps',
    enduranceRaces: ['Mint 400 - Vintage Open Class', 'Vegas to Reno Desert Challenge', 'SCORE Baja 1000 - Sportsman Class'],
    components: [
      {
        id: 'c1',
        name: 'Roots 8-71 Blower & Twin Holleys',
        category: 'Induction',
        spec: '8-71 Billet Roots Supercharger @ 12 PSI Boost',
        description: 'Polished positive displacement supercharger paired with dual sync-link Holley carbs, delivering instant off-idle torque for sand wash acceleration.',
        xPercent: 67,
        yPercent: 37,
      },
      {
        id: 'c2',
        name: 'Long-Travel Front Coilovers',
        category: 'Suspension',
        spec: 'Fox 3.0 Factory Race Series Internal Bypass',
        description: 'Coilover shocks valved specifically for desert whoops, rough washboard, and wash crossings at high speed.',
        xPercent: 57,
        yPercent: 67,
      },
      {
        id: 'c3',
        name: '37" Cooper Discoverer STT Pro Beadlocks',
        category: 'Drivetrain',
        spec: '37x12.50R17 with true mechanical locking ring',
        description: 'Deep mud/sand lug pattern capable of running down to 14 PSI without losing the bead in deep silt beds.',
        xPercent: 26,
        yPercent: 62,
      },
      {
        id: 'c4',
        name: 'Aerodynamic Roof Light Cage',
        category: 'Safety',
        spec: 'TIG-welded 4130 Chromoly rack with 5x 50W LED pods',
        description: 'Provides 240-degree illuminated field of view for high-speed night runs across open Mojave dry lake beds.',
        xPercent: 51,
        yPercent: 26,
      },
    ],
  },
  {
    id: 'desert-trophy-runner',
    name: 'Trophy Class Desert Runner',
    year: 2025,
    class: 'Unlimited Desert Pre-Runner Spec',
    tagline: 'Modern tubular chassis endurance platform engineered for non-stop desert pounding.',
    raceNumber: '77',
    image: '/src/assets/images/desert_trophy_runner_1792218544265.jpg',
    baseHp: 750,
    baseTorque: 690,
    displacement: '454 cu. in. All-Aluminum Dry-Sump V8',
    induction: 'Multi-port EFI with custom carbon velocity intake plenum',
    ignition: 'Multi-coil digital direct ignition with MoTeC engine management',
    exhaust: '8-into-1 tuned Inconel crossover headers',
    transmission: 'Sequential 6-speed paddle-shift race box with torque converter lockup',
    rearEnd: 'Billet trophy truck rear axle with 5.43 ring and pinion & spool',
    frontSuspension: 'A-arm independent suspension with King 4.0 bypass shocks (26" travel)',
    rearSuspension: 'Trailed-arm trailing links with King 4.5 bypass & coilovers (32" travel)',
    tires: '39x13.50R17 BFGoodrich Baja T/A KR3 on 17x9 forged beadlocks',
    wheelbase: '128 inches',
    weightLbs: 5200,
    fuelCapacity: '65 Gallon Harmon Racing Fuel Cell',
    enduranceRaces: ['Baja 1000 - Trophy Truck Spec', 'Mint 400 - Unlimited', 'San Felipe 250'],
    components: [
      {
        id: 't1',
        name: 'Front King 4.0 Bypass Coilover',
        category: 'Suspension',
        spec: '26" Measured Wheel Travel with dual rate springs',
        description: 'Absorbs multi-foot G-outs and high-speed boulder impacts without chassis deflection.',
        xPercent: 60,
        yPercent: 55,
      },
      {
        id: 't2',
        name: '39" BFGoodrich KR3 Desert Slicks',
        category: 'Drivetrain',
        spec: 'Steel-belted desert racing compound',
        description: 'Puncture-resistant Kevlar sidewalls engineered specifically for punishing volcanic rock and silt.',
        xPercent: 57,
        yPercent: 69,
      },
      {
        id: 't3',
        name: 'Baja High-Output Roof Bar',
        category: 'Safety',
        spec: '50-inch Curved LED Array @ 45,000 Lumens',
        description: 'Throws a 1,000-yard spot beam down desert washes during zero-visibility dust conditions.',
        xPercent: 54,
        yPercent: 25,
      },
      {
        id: 't4',
        name: 'Dual Bed Spare Carrier',
        category: 'Safety',
        spec: 'Quick-release dual 39" tire carriage & hydraulic jack',
        description: 'Allows under-45-second tire swaps during remote desert fuel stops without pit crew support.',
        xPercent: 26,
        yPercent: 38,
      },
    ],
  },
  {
    id: 'blown-v8-bench',
    name: 'C.O.R.E. Blown V8 Racing Engine',
    year: 2026,
    class: 'Race Dyno & Powertrain Test Bed',
    tagline: 'High-compression endurance crate built for sustained high-RPM desert heat.',
    raceNumber: '00',
    image: '/src/assets/images/blown_v8_racing_engine_1792218544783.jpg',
    baseHp: 910,
    baseTorque: 840,
    displacement: '468 cu. in. Dart Iron Eagle Block',
    induction: 'Polished 8-71 Roots Blower, Dual 850 CFM Holley Carbs with progressive linkage',
    ignition: 'Mallory Super-Mag IV magneto with mechanical tach drive',
    exhaust: 'Custom ceramic thermal-wrapped 2.25" primary zoomies',
    transmission: 'Jerico 4-speed dog-box with Tilton triple-disc metallic clutch',
    rearEnd: 'Quick-change Winters Performance differential',
    frontSuspension: 'Fabricated Dyno mounting cradle with vibration isolators',
    rearSuspension: 'Torsional safety cage & fluid catch pan',
    tires: 'Engine Dyno Test Rig (Water-brake absorber)',
    wheelbase: 'Bench Stand',
    weightLbs: 780,
    fuelCapacity: '110 Octane Sunoco race fuel test canister',
    enduranceRaces: ['Engine Dyno Bench Validation', 'Desert Heat Cycle Stress Test', 'Continuous 4-Hour Redline Pull'],
    components: [
      {
        id: 'e1',
        name: 'Polished 8-71 Supercharger',
        category: 'Induction',
        spec: 'Roots Positive Displacement with 3" Gilmer Belt',
        description: 'Billet aluminum casing with Teflon-stripped rotors generating massive instantaneous cylinder charge density.',
        xPercent: 47,
        yPercent: 42,
      },
      {
        id: 'e2',
        name: 'Dual 850 CFM Holley Carbs',
        category: 'Induction',
        spec: 'Four-barrel mechanical secondary carburetors',
        description: 'Custom metering blocks and high-flow needle and seats tuned to prevent fuel slosh on 35-degree inclines.',
        xPercent: 52,
        yPercent: 22,
      },
      {
        id: 'e3',
        name: 'Thermal Wrapped Headers',
        category: 'Engine',
        spec: 'Equal-length 321 stainless steel runners with titanium heat wrap',
        description: 'Drives scavenging pulses evenly across firing order 1-5-4-2-6-3-7-8 to maximize exhaust evacuation.',
        xPercent: 67,
        yPercent: 78,
      },
      {
        id: 'e4',
        name: 'Deep-Sump High-Capacity Baffled Oil Pan',
        category: 'Engine',
        spec: '10-Quart Canton Racing Pan with windage tray',
        description: 'Prevents oil starvation during aggressive cornering, whoops, and steep sand dune transitions.',
        xPercent: 48,
        yPercent: 92,
      },
    ],
  },
];
