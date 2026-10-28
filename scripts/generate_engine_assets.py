#!/usr/bin/env python3
"""
C.O.R.E. Engine Audio Asset Generator
Generates high-fidelity 44.1kHz 16-bit PCM WAV audio samples of a
400 cubic inch Trick-fueled chain-blown racing engine:
1. 400cu_ignition_crank_catch.wav  (Starter crank, Trick fuel ignition catch, flare & settle)
2. 400cu_idle_cam_lope.wav         (Seamless loop of radical cam lope, Roots surge, 8-71 Gilmer cog whine)
3. 400cu_high_rpm_combustion.wav   (Seamless loop of 7000 RPM screaming blower & open zoomie roar)
4. 400cu_decel_overrun_pops.wav    (Staggered unburnt Trick fuel backfires & header crackles)
5. 400cu_twostep_limiter.wav       (26 Hz ignition cut stutter box @ 4600 RPM)
"""

import os
import math
import wave
import struct
import random

SAMPLE_RATE = 44100
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def write_wav(filename, samples):
    """Write mono 16-bit PCM WAV file."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with wave.open(filepath, 'w') as wav_file:
        wav_file.setnchannels(1)        # Mono
        wav_file.setsampwidth(2)        # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        
        # Clip and pack
        packed_frames = bytearray()
        for s in samples:
            val = max(-1.0, min(1.0, s))
            int_val = int(val * 32767.0)
            packed_frames.extend(struct.pack('<h', int_val))
        wav_file.writeframes(packed_frames)
    print(f"Generated {filepath}: {len(samples)} samples ({len(samples)/SAMPLE_RATE:.2f}s)")

def soft_clip(x, drive=2.5):
    """Asymmetric tube / header saturation modeling cylinder pressure blowdown."""
    x = x * drive
    if x > 0:
        return math.tanh(x * 1.15) / 1.15
    else:
        return math.tanh(x * 0.85) / 0.85

def generate_idle_sample():
    """
    Generate seamless 4.0-second loop of 400cu V8 at ~920 RPM idle.
    Features:
    - 61.3 combustion events/sec (crossplane V8 1-8-4-3-6-5-7-2 firing pulses)
    - 4.4 Hz radical solid-roller cam lope (lumpy chop)
    - 2.1 Hz Roots 8-71 manifold surge hunting
    - 662 Hz Gilmer cog/chain belt whine and gear lash rattle
    - 160 Hz open zoomies primary tube acoustic resonance + 920 Hz collector snap
    """
    duration = 4.0
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    rpm = 920.0
    firing_freq = (rpm / 60.0) * 4.0  # ~61.33 Hz
    sub_freq = firing_freq * 0.5      # ~30.66 Hz
    cog_freq = (rpm / 60.0) * 1.35 * 32.0  # 662.4 Hz
    rotor_freq = (rpm / 60.0) * 1.35 * 6.0 # 124.2 Hz
    
    cam_lope_freq = 4.4
    blower_surge_freq = 2.1
    
    # Pre-generate noise for air turbulence
    noise_buffer = [random.uniform(-1.0, 1.0) for _ in range(num_samples)]
    # Simple lowpass on noise
    filtered_noise = [0.0] * num_samples
    val = 0.0
    for i in range(num_samples):
        val += (noise_buffer[i] - val) * 0.08
        filtered_noise[i] = val
        
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        
        # Cam lope modulation (chop)
        cam_mod = 1.0 + 0.35 * math.sin(2.0 * math.pi * cam_lope_freq * t) + \
                  0.15 * math.sin(2.0 * math.pi * (cam_lope_freq * 2.0) * t + 0.4)
                  
        # Blower manifold surge (hunting idle)
        surge_mod = 1.0 + 0.28 * math.sin(2.0 * math.pi * blower_surge_freq * t)
        
        # Organic micro-jitter
        jitter = 1.0 + 0.02 * math.sin(2.0 * math.pi * 17.3 * t)
        
        # Cylinder combustion fundamentals
        # Crossplane V8 primary pulse
        cyl_phase = 2.0 * math.pi * firing_freq * t * jitter
        cyl_pulse = math.sin(cyl_phase) + \
                    0.65 * math.sin(2.0 * cyl_phase) + \
                    0.40 * math.sin(3.0 * cyl_phase) + \
                    0.25 * math.sin(4.0 * cyl_phase)
                    
        # Sub-bass thump (30 Hz deep crankcase pulse)
        sub_thump = math.sin(2.0 * math.pi * sub_freq * t) * 0.7
        
        # Zoomies header acoustic resonance (160 Hz tube reflection)
        tube_res = math.sin(2.0 * math.pi * 162.0 * t) * (0.35 + 0.2 * math.sin(cyl_phase))
        
        # Trick 110 supersonic collector crackle
        collector_snap = math.sin(2.0 * math.pi * 920.0 * t) * (0.18 + 0.12 * math.cos(cyl_phase * 2.0))
        
        # 8-71 Roots blower cog belt whine
        cog_whine = math.sin(2.0 * math.pi * cog_freq * t) * (0.08 * surge_mod)
        # Rotor air chop (124 Hz)
        rotor_chop = math.sin(2.0 * math.pi * rotor_freq * t) * (0.07 * surge_mod)
        
        # Air intake vacuum hiss
        intake_rush = filtered_noise[i] * 0.04 * surge_mod
        
        # Combine layers with cam chop & blower surge modulation
        engine_raw = ((cyl_pulse * 0.55 + sub_thump * 0.35 + tube_res * 0.25 + collector_snap * 0.15) * cam_mod * surge_mod) + \
                     cog_whine + rotor_chop + intake_rush
                     
        # Saturate via asymmetric tube blowdown curve
        saturated = soft_clip(engine_raw, drive=2.4)
        samples[i] = saturated * 0.85

    # Apply seamless loop cross-fade at ends (50ms window)
    fade_len = int(SAMPLE_RATE * 0.05)
    for i in range(fade_len):
        alpha = i / fade_len
        samples[i] = samples[i] * alpha + samples[num_samples - fade_len + i] * (1.0 - alpha)
        
    write_wav("400cu_idle_cam_lope.wav", samples)

def generate_high_rpm_sample():
    """
    Generate seamless 3.5-second loop of 400cu engine screaming at 7000 RPM.
    Features:
    - 466.6 combustion pulses/sec (open zoomie headers thunder)
    - 5040 Hz screaming Gilmer cog/chain mesh howl
    - 945 Hz Roots rotor displacement compression pulses
    - Massive intake airflow rush
    """
    duration = 3.5
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    rpm = 7000.0
    firing_freq = (rpm / 60.0) * 4.0  # 466.67 Hz
    sub_freq = firing_freq * 0.5      # 233.33 Hz
    cog_freq = (rpm / 60.0) * 1.35 * 32.0  # 5040 Hz
    rotor_freq = (rpm / 60.0) * 1.35 * 6.0 # 945 Hz
    
    noise_buffer = [random.uniform(-1.0, 1.0) for _ in range(num_samples)]
    filtered_noise = [0.0] * num_samples
    val = 0.0
    for i in range(num_samples):
        val += (noise_buffer[i] - val) * 0.18
        filtered_noise[i] = val
        
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        jitter = 1.0 + 0.008 * math.sin(2.0 * math.pi * 37.0 * t)
        
        # High-RPM cylinder combustion shockwaves (steep rise time)
        cyl_phase = 2.0 * math.pi * firing_freq * t * jitter
        cyl_pulse = math.sin(cyl_phase) + \
                    0.75 * math.sin(2.0 * cyl_phase) + \
                    0.55 * math.sin(3.0 * cyl_phase) + \
                    0.35 * math.sin(4.0 * cyl_phase) + \
                    0.20 * math.sin(5.0 * cyl_phase)
                    
        sub_body = math.sin(2.0 * math.pi * sub_freq * t) * 0.5
        
        # Screaming 8-71 Roots blower chain cog whine (5040 Hz)
        cog_whine = (math.sin(2.0 * math.pi * cog_freq * t) + \
                     0.45 * math.sin(2.0 * math.pi * (cog_freq * 1.5) * t) + \
                     0.25 * math.sin(2.0 * math.pi * (cog_freq * 2.0) * t)) * 0.32
                     
        # Rotor air compression pulses (945 Hz)
        rotor_whine = math.sin(2.0 * math.pi * rotor_freq * t) * 0.22
        
        # Hurricane intake vacuum airflow
        intake_rush = filtered_noise[i] * 0.18
        
        # Header pipe metallic scream (1800 Hz)
        header_ring = math.sin(2.0 * math.pi * 1850.0 * t) * 0.15 * math.sin(cyl_phase)
        
        engine_raw = cyl_pulse * 0.65 + sub_body * 0.35 + cog_whine + rotor_whine + intake_rush + header_ring
        saturated = soft_clip(engine_raw, drive=3.2)
        samples[i] = saturated * 0.88

    fade_len = int(SAMPLE_RATE * 0.05)
    for i in range(fade_len):
        alpha = i / fade_len
        samples[i] = samples[i] * alpha + samples[num_samples - fade_len + i] * (1.0 - alpha)
        
    write_wav("400cu_high_rpm_combustion.wav", samples)

def generate_ignition_sample():
    """
    Generate authentic 2.8s starter crank and Trick fuel ignition catch sequence:
    0.0s - 1.1s: High-torque gear-reduction starter crank (compression stroke load variation @ 180 RPM)
    1.1s - 1.7s: Ignition catch flare (Mallory magneto sparks Trick 110 fuel, 2400 RPM roar)
    1.7s - 2.8s: Settle into lumpy cam lope
    """
    duration = 2.8
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        
        if t < 1.1:
            # Starter motor stage
            # Starter motor electric whine
            starter_pitch = 180.0 + 35.0 * t
            starter_whine = math.sin(2.0 * math.pi * starter_pitch * t) * 0.25 + \
                            math.sin(2.0 * math.pi * (starter_pitch * 2.2) * t) * 0.12
                            
            # Rhythmic compression drags (4 cylinder compressions per crank rev at ~180 RPM -> ~12 Hz)
            comp_stroke = math.pow(math.sin(2.0 * math.pi * 6.0 * t), 4) * 0.45
            thump = math.sin(2.0 * math.pi * 42.0 * t) * comp_stroke
            
            # Starter gear teeth mesh
            teeth_click = random.uniform(-0.15, 0.15) if comp_stroke > 0.3 else 0.0
            
            fade_in = min(1.0, t / 0.15)
            fade_out = max(0.0, (1.1 - t) / 0.1)
            samples[i] = (starter_whine + thump + teeth_click) * fade_in * fade_out
            
        elif t < 1.7:
            # Ignition catch flare!
            flare_t = t - 1.1
            flare_env = math.exp(-flare_t * 3.8)
            rpm = 1200.0 + 1400.0 * flare_env
            firing_freq = (rpm / 60.0) * 4.0
            
            cyl_pulse = math.sin(2.0 * math.pi * firing_freq * t) + \
                        0.7 * math.sin(4.0 * math.pi * firing_freq * t) + \
                        0.4 * math.sin(6.0 * math.pi * firing_freq * t)
                        
            # Initial explosive combustion shockwave
            pop_impulse = (random.uniform(-1.0, 1.0) * math.exp(-flare_t * 18.0)) * 0.85
            cog_whine = math.sin(2.0 * math.pi * (rpm / 60.0) * 1.35 * 32.0 * t) * 0.18
            
            flare_sound = (cyl_pulse * 0.7 + pop_impulse + cog_whine) * min(1.0, flare_t / 0.05)
            samples[i] = soft_clip(flare_sound, drive=3.5) * 0.92
            
        else:
            # Settle into idle lope
            settle_t = t - 1.7
            rpm = 1100.0 - 180.0 * min(1.0, settle_t / 0.8)
            firing_freq = (rpm / 60.0) * 4.0
            
            cam_mod = 1.0 + 0.3 * math.sin(2.0 * math.pi * 4.4 * t)
            cyl_pulse = math.sin(2.0 * math.pi * firing_freq * t) + \
                        0.6 * math.sin(4.0 * math.pi * firing_freq * t)
            sub_thump = math.sin(2.0 * math.pi * (firing_freq * 0.5) * t) * 0.6
            cog_whine = math.sin(2.0 * math.pi * (rpm / 60.0) * 1.35 * 32.0 * t) * 0.08
            
            engine_settle = (cyl_pulse * 0.6 + sub_thump * 0.4) * cam_mod + cog_whine
            samples[i] = soft_clip(engine_settle, drive=2.5) * 0.85

    write_wav("400cu_ignition_crank_catch.wav", samples)

def generate_decel_pops_sample():
    """
    Generate 2.2s multi-shot unburnt Trick fuel overrun backfire detonations.
    Features violent, staggered header shockwave cracks and hollow tube resonance.
    """
    duration = 2.2
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    # Detonation event timestamps and intensities
    pop_events = [
        (0.08, 0.95, 185.0),
        (0.24, 0.75, 220.0),
        (0.38, 0.60, 160.0),
        (0.65, 0.88, 205.0),
        (0.92, 0.98, 175.0),
        (1.15, 0.70, 240.0),
        (1.42, 0.82, 190.0),
        (1.75, 0.55, 215.0),
    ]
    
    for start_t, intensity, tube_hz in pop_events:
        start_idx = int(start_t * SAMPLE_RATE)
        pop_len = int(SAMPLE_RATE * 0.16)
        for j in range(pop_len):
            idx = start_idx + j
            if idx >= num_samples:
                break
            t_pop = j / SAMPLE_RATE
            
            # Fast supersonic impulse crack
            crack = (random.uniform(-1.0, 1.0) * math.exp(-t_pop * 55.0)) * 0.8
            # Hollow 3.5" stainless zoomie header boom
            boom = math.sin(2.0 * math.pi * tube_hz * t_pop) * math.exp(-t_pop * 24.0) * 0.6
            # Upper collector metallic ping
            ping = math.sin(2.0 * math.pi * 1450.0 * t_pop) * math.exp(-t_pop * 42.0) * 0.3
            
            samples[idx] += (crack + boom + ping) * intensity

    # Soft clip to prevent digital clipping
    for i in range(num_samples):
        samples[i] = soft_clip(samples[i], drive=1.8) * 0.9
        
    write_wav("400cu_decel_overrun_pops.wav", samples)

def generate_twostep_sample():
    """
    Generate seamless 2.0s 2-step launch limiter stutter box @ 4600 RPM.
    Features 26 Hz machine-gun ignition cuts with boost spool explosions.
    """
    duration = 2.0
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    rpm = 4600.0
    firing_freq = (rpm / 60.0) * 4.0 # ~306.6 Hz
    stutter_rate = 26.0               # 26 Hz cut
    cog_freq = (rpm / 60.0) * 1.35 * 32.0 # 3312 Hz
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        
        # 26 Hz ignition cut square gate
        cut_phase = math.sin(2.0 * math.pi * stutter_rate * t)
        is_firing = cut_phase > 0.0
        
        # Engine combustion pulse
        cyl_pulse = math.sin(2.0 * math.pi * firing_freq * t) + \
                    0.6 * math.sin(4.0 * math.pi * firing_freq * t)
                    
        # When ignition cuts, raw fuel detonates in header
        pop_impulse = (random.uniform(-1.0, 1.0) if not is_firing else 0.0) * 0.55
        
        # Screaming 8-71 blower under full 14 PSI boost
        cog_whine = math.sin(2.0 * math.pi * cog_freq * t) * 0.28
        
        engine_raw = (cyl_pulse * (0.75 if is_firing else 0.15)) + pop_impulse + cog_whine
        samples[i] = soft_clip(engine_raw, drive=3.0) * 0.88

    fade_len = int(SAMPLE_RATE * 0.05)
    for i in range(fade_len):
        alpha = i / fade_len
        samples[i] = samples[i] * alpha + samples[num_samples - fade_len + i] * (1.0 - alpha)
        
    write_wav("400cu_twostep_limiter.wav", samples)

if __name__ == "__main__":
    print("Generating high-fidelity 400cu Trick-fueled C.O.R.E. audio assets...")
    generate_idle_sample()
    generate_high_rpm_sample()
    generate_ignition_sample()
    generate_decel_pops_sample()
    generate_twostep_sample()
    print("All audio assets successfully generated in /public/audio!")
