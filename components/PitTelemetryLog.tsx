import React, { useState, useEffect } from 'react';
import { Vehicle } from '../data/vehicles';
import { audioEngine } from '../services/AudioEngine';

interface PitTelemetryLogProps {
  vehicle: Vehicle;
  soundEnabled: boolean;
}

interface RadioMessage {
  id: string;
  time: string;
  sender: 'Crew Chief' | 'Car 13 Driver' | 'Spotter Ridge' | 'Chase Truck';
  message: string;
  tone: 'info' | 'urgent' | 'confirm';
}

interface SectorCheckpoint {
  id: number;
  name: string;
  distance: string;
  targetSplit: string;
  actualSplit: string;
  deltaSec: number;
  avgSpeedMph: number;
  status: 'completed' | 'in_progress' | 'upcoming';
}

export const PitTelemetryLog: React.FC<PitTelemetryLogProps> = ({ vehicle }) => {
  // Radio Comms State
  const [messages, setMessages] = useState<RadioMessage[]>([
    {
      id: 'm1',
      time: '18:42:10',
      sender: 'Crew Chief',
      message: 'Green flag is out! Car 13 away clean, blower boost holding steady at 12 PSI off the line.',
      tone: 'confirm',
    },
    {
      id: 'm2',
      time: '18:54:32',
      sender: 'Spotter Ridge',
      message: 'Visual on Jean Wash. You are pulling away from the trophy truck pack. Line up high along the berm.',
      tone: 'info',
    },
    {
      id: 'm3',
      time: '19:08:15',
      sender: 'Car 13 Driver',
      message: 'Suspension soaking up the square-edges nicely. Engine temps 205 coolant, 230 oil. Looking strong.',
      tone: 'info',
    },
    {
      id: 'm4',
      time: '19:22:40',
      sender: 'Chase Truck',
      message: 'Caution at Mile 64 silt bed—stuck class 10 buggy on driver right. Cut hard left into the gravel track.',
      tone: 'urgent',
    },
    {
      id: 'm5',
      time: '19:35:12',
      sender: 'Crew Chief',
      message: 'Car 13, you are +48 seconds ahead of pace. Pit 2 is prepped for fuel and right rear tire check next lap.',
      tone: 'confirm',
    },
  ]);

  const [customMsg, setCustomMsg] = useState<string>('');

  // Sector Checkpoints
  const [sectors] = useState<SectorCheckpoint[]>([
    {
      id: 1,
      name: 'Start Line · Primm Lake Bed',
      distance: '0.0 - 24.5 MI',
      targetSplit: '14:20.0',
      actualSplit: '13:48.2',
      deltaSec: -31.8,
      avgSpeedMph: 106.4,
      status: 'completed',
    },
    {
      id: 2,
      name: 'Jean Wash Rock Boulder Section',
      distance: '24.5 - 58.2 MI',
      targetSplit: '28:15.0',
      actualSplit: '27:42.5',
      deltaSec: -32.5,
      avgSpeedMph: 72.8,
      status: 'completed',
    },
    {
      id: 3,
      name: 'Sand Mountain Whoop Rhythm Bed',
      distance: '58.2 - 86.4 MI',
      targetSplit: '21:50.0',
      actualSplit: '21:12.1',
      deltaSec: -37.9,
      avgSpeedMph: 79.5,
      status: 'completed',
    },
    {
      id: 4,
      name: 'Cal-Nev-Ari Canyon Ridge Track',
      distance: '86.4 - 118.0 MI',
      targetSplit: '25:30.0',
      actualSplit: 'IN PROGRESS',
      deltaSec: -18.0,
      avgSpeedMph: 84.2,
      status: 'in_progress',
    },
    {
      id: 5,
      name: 'Mojave Main Paddock & Finish',
      distance: '118.0 - 145.0 MI',
      targetSplit: '22:10.0',
      actualSplit: '--:--',
      deltaSec: 0,
      avgSpeedMph: 0,
      status: 'upcoming',
    },
  ]);

  // Dynamic Tire Telemetry Jitter
  const [tireFL, setTireFL] = useState({ psi: 24.2, tempF: 178, shockF: 224 });
  const [tireFR, setTireFR] = useState({ psi: 24.8, tempF: 184, shockF: 231 });
  const [tireRL, setTireRL] = useState({ psi: 26.1, tempF: 196, shockF: 248 });
  const [tireRR, setTireRR] = useState({ psi: 26.5, tempF: 202, shockF: 254 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTireFL((prev) => ({
        psi: Number((prev.psi + (Math.random() - 0.5) * 0.2).toFixed(1)),
        tempF: Math.round(prev.tempF + (Math.random() - 0.5) * 1.5),
        shockF: Math.round(prev.shockF + (Math.random() - 0.5) * 2),
      }));
      setTireRR((prev) => ({
        psi: Number((prev.psi + (Math.random() - 0.5) * 0.2).toFixed(1)),
        tempF: Math.round(prev.tempF + (Math.random() - 0.5) * 1.5),
        shockF: Math.round(prev.shockF + (Math.random() - 0.5) * 2),
      }));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Pit Stop Simulation Timer
  const [pitTimerRunning, setPitTimerRunning] = useState<boolean>(false);
  const [pitSeconds, setPitSeconds] = useState<number>(0);
  const [pitStatus, setPitStatus] = useState<string>('CREW ON STANDBY');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pitTimerRunning) {
      interval = setInterval(() => {
        setPitSeconds((s) => {
          const next = Number((s + 0.1).toFixed(1));
          if (next < 5.0) setPitStatus('JACKS DOWN · IMPACT GUNS SPINNING');
          else if (next < 14.0) setPitStatus('4 BEADLOCK TIRES SWAPPED · 40 GAL FUEL DUMP IN PROGRESS');
          else if (next < 22.0) setPitStatus('FUEL DUMP SEALED · VISOR TEAR-OFF & WATER DISPENSE');
          else if (next < 26.0) setPitStatus('CHASSIS PINS SECURED · CAR DROPPING OFF JACKS');
          else {
            setPitStatus('GO GO GO! PIT COMPLETE (25.8s)');
            setPitTimerRunning(false);
            audioEngine.playRogerBeep();
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pitTimerRunning]);

  const handleStartPitStop = () => {
    setPitSeconds(0);
    setPitTimerRunning(true);
    setPitStatus('CAR ENTERING BOX · JACKS DEPLOYING');
    audioEngine.playRadioBurst();
  };

  const handleSendRadio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    audioEngine.playRadioBurst();

    const newEntry: RadioMessage = {
      id: 'm-' + Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      sender: 'Car 13 Driver',
      message: customMsg.trim(),
      tone: 'info',
    };

    setMessages((prev) => [newEntry, ...prev]);
    setCustomMsg('');

    // Follow up Roger Beep
    setTimeout(() => {
      audioEngine.playRogerBeep();
    }, 400);
  };

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [snapshotJson, setSnapshotJson] = useState<string>('');
  const [snapshotHash, setSnapshotHash] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Compute SHA-256 hash using Web Crypto API
  const computeSha256 = async (str: string): Promise<string> => {
    try {
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'UNAVAILABLE';
    }
  };

  // Generate the snapshot object
  const createSnapshotData = () => ({
    schemaVersion: '1.0.0',
    sessionType: 'PIT_TELEMETRY_SESSION_SNAPSHOT',
    sessionId: `PIT-MOJAVE250-${vehicle.number}-${Date.now()}`,
    exportedAt: new Date().toISOString(),
    event: 'Mojave Desert 250 - Primm Lake Bed to Cal-Nev-Ari',
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      number: vehicle.number,
      category: vehicle.category,
      specs: vehicle.specs,
    },
    pitStopBenchmark: {
      elapsedSeconds: pitSeconds,
      status: pitStatus,
      targetBenchmarkSeconds: 28.0,
    },
    frictionTelemetry: {
      frontLeft: tireFL,
      frontRight: tireFR,
      rearLeft: tireRL,
      rearRight: tireRR,
    },
    sectorSplits: sectors,
    radioCommsLog: messages,
  });

  const handleOpenExport = async () => {
    const data = createSnapshotData();
    const formatted = JSON.stringify(data, null, 2);
    setSnapshotJson(formatted);
    const hash = await computeSha256(formatted);
    setSnapshotHash(hash);
    setIsExportModalOpen(true);
  };

  const handleDownloadSnapshot = async () => {
    const data = createSnapshotData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pit_telemetry_car${vehicle.number}_snapshot_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySnapshot = () => {
    navigator.clipboard.writeText(snapshotJson);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePlayAudioCue = () => {
    audioEngine.playRadioBurst();
    setTimeout(() => {
      audioEngine.playRogerBeep();
    }, 250);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070A0F] text-slate-100 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-[#0B0F17] border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="font-['Barlow_Condensed',sans-serif] text-2xl font-black uppercase tracking-wider text-white">
              PIT CREW TELEMETRY LOG & LIVE RADIO CHATTER
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-amber-300 font-semibold uppercase">
              CAR #{vehicle.number} · MOJAVE 250
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-Time Sector Splits · 4-Corner Tire Friction Telemetry · Procedural Comms Audio
          </p>
        </div>

        {/* Action Group: Export Snapshot, Quick Download & Radio Squelch */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            title="Inspect and export full JSON telemetry session snapshot"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            EXPORT JSON SNAPSHOT
          </button>

          <button
            onClick={handleDownloadSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs font-mono font-semibold transition-colors cursor-pointer"
            title="Direct download .json file"
          >
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            DOWNLOAD
          </button>

          <button
            onClick={handlePlayAudioCue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs font-mono font-bold text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            RADIO SQUELCH
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Radio Comms & Pit Stopwatch (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Radio Comms Feed */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h2 className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-white">
                  Tactical Radio Transmissions (CH-13)
                </h2>
              </div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                UHF 462.5625 MHz
              </span>
            </div>

            {/* Radio Log Stream */}
            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg border text-xs font-mono transition-colors ${
                    m.tone === 'urgent'
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : m.tone === 'confirm'
                      ? 'bg-emerald-950/25 border-emerald-500/30'
                      : 'bg-black/40 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-bold uppercase ${
                        m.sender === 'Crew Chief'
                          ? 'text-amber-400'
                          : m.sender === 'Car 13 Driver'
                          ? 'text-cyan-400'
                          : m.sender === 'Spotter Ridge'
                          ? 'text-emerald-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {m.sender}
                    </span>
                    <span className="text-[10px] text-slate-500">{m.time}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{m.message}</p>
                </div>
              ))}
            </div>

            {/* Driver Push-To-Talk input */}
            <form onSubmit={handleSendRadio} className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder="Key microphone / transmit message to pit wall..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="flex-1 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                PTT TRANSMIT
              </button>
            </form>
          </div>

          {/* Pit Stop Crew Stopwatch Simulator */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-white">
                Pit Box Crew Stopwatch Benchmark
              </h2>
              <span className="font-mono text-xs text-amber-400 font-bold">
                TARGET: &lt; 28.0 SEC
              </span>
            </div>

            <div className="flex items-center justify-between bg-black/40 rounded-xl p-5 border border-white/5">
              <div>
                <div className="text-slate-400 text-[10px] font-mono uppercase">STOPWATCH CLOCK</div>
                <div className="text-4xl font-extrabold font-mono text-white tracking-wider">
                  {pitSeconds.toFixed(1)} <span className="text-sm text-slate-400 font-normal">SEC</span>
                </div>
              </div>

              <button
                onClick={handleStartPitStop}
                disabled={pitTimerRunning}
                className={`px-5 py-3 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                  pitTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                }`}
              >
                {pitTimerRunning ? 'PIT STOP RUNNING...' : 'TRIGGER PIT SERVICE'}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-xs flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-semibold">{pitStatus}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Checkpoint Sector Splits & 4-Corner Tire Heat (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Sector Splits */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-white">
                Mojave Checkpoint Sector Splits
              </h2>
              <span className="font-mono text-xs text-emerald-400 font-bold">
                OVERALL: -102.2s (LEADER)
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {sectors.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-lg border flex flex-col gap-1 font-mono text-xs ${
                    s.status === 'completed'
                      ? 'bg-black/30 border-white/10'
                      : s.status === 'in_progress'
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-black/10 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-amber-400">S{s.id}</span>
                      <span>{s.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        s.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : s.status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-white/5">
                    <span>{s.distance}</span>
                    <span>ACTUAL: <strong className="text-white">{s.actualSplit}</strong></span>
                    <span>
                      DELTA:{' '}
                      <strong className={s.deltaSec < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                        {s.deltaSec < 0 ? `${s.deltaSec}s` : '--'}
                      </strong>
                    </span>
                    <span>SPEED: <strong className="text-amber-400">{s.avgSpeedMph > 0 ? `${s.avgSpeedMph} MPH` : '--'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Corner Tire & Shock Absorber Telemetry */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-white">
                4-Corner Tire & Bypass Shock Temperatures
              </h2>
              <span className="font-mono text-xs text-slate-400">
                COOPER DISCOVERER 39&quot;
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Front Left */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>FRONT LEFT</span>
                  <span className="text-emerald-400">{tireFL.psi} PSI</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">TREAD TEMP:</span>
                  <span className="text-amber-400 font-semibold">{tireFL.tempF}°F</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">FOX BYPASS:</span>
                  <span className="text-rose-400 font-semibold">{tireFL.shockF}°F</span>
                </div>
                {/* Visual heat gauge */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${Math.min(100, (tireFL.tempF / 230) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Front Right */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>FRONT RIGHT</span>
                  <span className="text-emerald-400">{tireFR.psi} PSI</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">TREAD TEMP:</span>
                  <span className="text-amber-400 font-semibold">{tireFR.tempF}°F</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">FOX BYPASS:</span>
                  <span className="text-rose-400 font-semibold">{tireFR.shockF}°F</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${Math.min(100, (tireFR.tempF / 230) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Rear Left */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>REAR LEFT</span>
                  <span className="text-emerald-400">{tireRL.psi} PSI</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">TREAD TEMP:</span>
                  <span className="text-amber-400 font-semibold">{tireRL.tempF}°F</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">FOX BYPASS:</span>
                  <span className="text-rose-400 font-semibold">{tireRL.shockF}°F</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all"
                    style={{ width: `${Math.min(100, (tireRL.tempF / 230) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Rear Right */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>REAR RIGHT (DRIVE)</span>
                  <span className="text-emerald-400">{tireRR.psi} PSI</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">TREAD TEMP:</span>
                  <span className="text-rose-400 font-semibold">{tireRR.tempF}°F</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">FOX BYPASS:</span>
                  <span className="text-rose-400 font-semibold">{tireRR.shockF}°F</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{ width: `${Math.min(100, (tireRR.tempF / 230) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session JSON Snapshot Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D131F] border border-cyan-500/40 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/50">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#080C14] rounded-t-xl">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Telemetry Session Snapshot
                </div>
                <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase text-white tracking-wide mt-0.5">
                  Pit Telemetry JSON Snapshot & Cryptographic Digest
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 font-mono text-xs">
              {/* Telemetry Digest Card */}
              <div className="p-3.5 bg-black/50 border border-cyan-500/30 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-bold text-cyan-400">SHA-256 DIGEST (WEB CRYPTO DIGEST)</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(snapshotHash);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="text-cyan-300 hover:underline cursor-pointer"
                  >
                    {isCopied ? '[ COPIED HASH ]' : '[ COPY HASH ]'}
                  </button>
                </div>
                <div className="p-2 bg-[#060A11] rounded border border-white/10 text-cyan-300 break-all select-all font-mono text-xs">
                  {snapshotHash}
                </div>
              </div>

              {/* Snapshot Metadata Quick Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="p-2.5 rounded bg-black/30 border border-white/5">
                  <div className="text-slate-500">PAYLOAD SIZE</div>
                  <div className="text-white font-bold mt-0.5">
                    {new TextEncoder().encode(snapshotJson).length.toLocaleString()} bytes
                  </div>
                </div>
                <div className="p-2.5 rounded bg-black/30 border border-white/5">
                  <div className="text-slate-500">COMMS LOGS</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{messages.length} Transmissions</div>
                </div>
                <div className="p-2.5 rounded bg-black/30 border border-white/5">
                  <div className="text-slate-500">CHECKPOINTS</div>
                  <div className="text-amber-400 font-bold mt-0.5">{sectors.length} Sectors</div>
                </div>
                <div className="p-2.5 rounded bg-black/30 border border-white/5">
                  <div className="text-slate-500">VEHICLE REF</div>
                  <div className="text-cyan-300 font-bold mt-0.5">Car #{vehicle.number}</div>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  Structured Payload Data Preview
                </span>
                <pre className="bg-[#05080E] p-4 rounded-lg border border-white/10 text-cyan-300/90 text-xs overflow-x-auto max-h-72 select-text font-mono leading-relaxed">
                  {snapshotJson}
                </pre>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-[#080C14] rounded-b-xl flex flex-wrap items-center justify-between gap-3">
              <span className="text-slate-500 text-xs font-mono">
                Compliant with Payload Validator inspection engine
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopySnapshot}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  {isCopied ? 'COPIED TO CLIPBOARD!' : 'COPY FULL JSON'}
                </button>
                <button
                  onClick={handleDownloadSnapshot}
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold transition-all shadow-md shadow-amber-400/20 cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  DOWNLOAD .JSON FILE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
