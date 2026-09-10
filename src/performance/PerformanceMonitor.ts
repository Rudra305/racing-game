import * as THREE from 'three';
import { VehicleTelemetry } from '../physics/VehiclePhysics';
import { EnvironmentMetrics } from '../environment/EnvironmentManager';

export class PerformanceMonitor {
  private containerEl: HTMLElement | null;
  private fpsEl: HTMLElement | null;
  private msEl: HTMLElement | null;
  private callsEl: HTMLElement | null;
  private trianglesEl: HTMLElement | null;
  private geometriesEl: HTMLElement | null;
  private texturesEl: HTMLElement | null;

  // Telemetry elements
  private rpmEl: HTMLElement | null;
  private gearEl: HTMLElement | null;
  private slipEl: HTMLElement | null;
  private latgEl: HTMLElement | null;
  private latvelEl: HTMLElement | null;
  private accelEl: HTMLElement | null;
  private surfaceEl: HTMLElement | null;
  private airEl: HTMLElement | null;

  // Track & terrain telemetry elements
  private elevationEl: HTMLElement | null;
  private distanceEl: HTMLElement | null;
  private gradientEl: HTMLElement | null;
  private bankingEl: HTMLElement | null;

  // Environment & LOD telemetry elements
  private chunksEl: HTMLElement | null;
  private instancesEl: HTMLElement | null;
  private lod0El: HTMLElement | null;
  private lod1El: HTMLElement | null;
  private lod2El: HTMLElement | null;

  private isVisible: boolean = false;
  private frameCount: number = 0;
  private timeAccumulator: number = 0;
  private lastFps: number = 60;
  private lastMs: number = 16.6;

  constructor() {
    this.containerEl = document.getElementById('perf-monitor');
    this.fpsEl = document.getElementById('perf-fps');
    this.msEl = document.getElementById('perf-ms');
    this.callsEl = document.getElementById('perf-calls');
    this.trianglesEl = document.getElementById('perf-triangles');
    this.geometriesEl = document.getElementById('perf-geometries');
    this.texturesEl = document.getElementById('perf-textures');

    this.rpmEl = document.getElementById('perf-rpm');
    this.gearEl = document.getElementById('perf-gear');
    this.slipEl = document.getElementById('perf-slip');
    this.latgEl = document.getElementById('perf-latg');
    this.latvelEl = document.getElementById('perf-latvel');
    this.accelEl = document.getElementById('perf-accel');
    this.surfaceEl = document.getElementById('perf-surface');
    this.airEl = document.getElementById('perf-air');

    this.elevationEl = document.getElementById('perf-elevation');
    this.distanceEl = document.getElementById('perf-distance');
    this.gradientEl = document.getElementById('perf-gradient');
    this.bankingEl = document.getElementById('perf-banking');

    this.chunksEl = document.getElementById('perf-chunks');
    this.instancesEl = document.getElementById('perf-instances');
    this.lod0El = document.getElementById('perf-lod0');
    this.lod1El = document.getElementById('perf-lod1');
    this.lod2El = document.getElementById('perf-lod2');

    const toggleBtn = document.getElementById('btn-toggle-perf');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }
  }

  public toggle(): boolean {
    this.isVisible = !this.isVisible;
    if (this.containerEl) {
      this.containerEl.style.display = this.isVisible ? 'block' : 'none';
    }
    return this.isVisible;
  }

  public update(
    delta: number,
    renderer: THREE.WebGLRenderer,
    telemetry?: VehicleTelemetry,
    envMetrics?: EnvironmentMetrics
  ): void {
    if (!this.isVisible) return;

    this.frameCount++;
    this.timeAccumulator += delta;

    // Refresh telemetry 4 times per second (every 250ms)
    if (this.timeAccumulator >= 0.25) {
      this.lastFps = Math.round(this.frameCount / this.timeAccumulator);
      this.lastMs = (this.timeAccumulator / this.frameCount) * 1000;
      this.frameCount = 0;
      this.timeAccumulator = 0;

      if (this.fpsEl) this.fpsEl.textContent = this.lastFps.toString();
      if (this.msEl) this.msEl.textContent = this.lastMs.toFixed(1);

      // Three.js renderer metrics
      const info = renderer.info;
      if (this.callsEl) this.callsEl.textContent = info.render.calls.toString();
      if (this.trianglesEl) this.trianglesEl.textContent = info.render.triangles.toLocaleString();
      if (this.geometriesEl) this.geometriesEl.textContent = info.memory.geometries.toString();
      if (this.texturesEl) this.texturesEl.textContent = info.memory.textures.toString();

      // Vehicle telemetry metrics
      if (telemetry) {
        if (this.rpmEl) this.rpmEl.textContent = telemetry.rpm.toString();
        if (this.gearEl) this.gearEl.textContent = telemetry.gear;
        if (this.slipEl) this.slipEl.textContent = `${telemetry.driftAngle.toFixed(1)}°`;
        if (this.latgEl) this.latgEl.textContent = telemetry.lateralG.toFixed(2);
        if (this.latvelEl) this.latvelEl.textContent = telemetry.lateralVelocity.toFixed(1);
        if (this.accelEl) this.accelEl.textContent = telemetry.acceleration.toFixed(1);
        if (this.surfaceEl) this.surfaceEl.textContent = telemetry.surface;
        if (this.airEl) this.airEl.textContent = telemetry.isAirborne ? 'YES' : 'NO';

        if (this.elevationEl) this.elevationEl.textContent = telemetry.elevation.toFixed(1);
        if (this.distanceEl) this.distanceEl.textContent = telemetry.trackDistance.toFixed(0);
        if (this.gradientEl) this.gradientEl.textContent = telemetry.gradient.toFixed(1);
        if (this.bankingEl) this.bankingEl.textContent = telemetry.banking.toFixed(1);
      }

      // Environment & LOD metrics
      if (envMetrics) {
        if (this.chunksEl) this.chunksEl.textContent = `${envMetrics.visibleChunks}/${envMetrics.totalChunks}`;
        if (this.instancesEl) this.instancesEl.textContent = envMetrics.totalInstances.toLocaleString();
        if (this.lod0El) this.lod0El.textContent = envMetrics.lod0Count.toString();
        if (this.lod1El) this.lod1El.textContent = envMetrics.lod1Count.toString();
        if (this.lod2El) this.lod2El.textContent = envMetrics.lod2Count.toString();
      }
    }
  }
}
