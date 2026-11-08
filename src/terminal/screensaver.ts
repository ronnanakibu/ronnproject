/**
 * Retro-Arcade 3D Forza Cinematic Screensaver
 * Procedural low-poly car engine & endless highway rendered in Canvas 2D.
 * Ultra-lightweight: zero external 3D libraries, ~3KB footprint, locked 60 FPS.
 */

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export class ScreensaverEngine {
  private overlay: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number | null = null;
  private isActive = false;
  private idleTimeoutId: number | null = null;
  private idleTimeMs: number;
  private hudSpeed: HTMLElement | null = null;
  private hudRpm: HTMLElement | null = null;
  private hudGear: HTMLElement | null = null;

  // Cinematic scene state
  private time = 0;
  private camAngle = 0; // Current camera view (0..3)
  private camTimer = 0;
  private currentSpeed = 238;
  private targetSpeed = 245;
  private rpm = 7400;
  private gear = 5;

  constructor(idleSeconds = 20) {
    this.idleTimeMs = idleSeconds * 1000;

    // Create or select overlay DOM
    let existingOverlay = document.getElementById('screensaver');
    if (!existingOverlay) {
      existingOverlay = document.createElement('div');
      existingOverlay.id = 'screensaver';
      existingOverlay.className = 'screensaver-overlay';
      existingOverlay.setAttribute('aria-hidden', 'true');
      existingOverlay.hidden = true;

      existingOverlay.innerHTML = `
        <canvas id="screensaver-canvas" class="screensaver-canvas"></canvas>
        <div class="screensaver-hud">
          <div class="screensaver-telemetry">
            <span class="hud-tag">RONN MOTORS // ATTRACT MODE</span>
            <span class="hud-stats">
              SPEED: <span id="hud-speed">238</span> KM/H ·
              RPM: <span id="hud-rpm">7400</span> ·
              GEAR: <span id="hud-gear">5</span>
            </span>
          </div>
          <div class="screensaver-hint">TEKAN APAPUN ATAU TAP UNTUK KEMBALI</div>
        </div>
      `;
      document.body.appendChild(existingOverlay);
    }

    this.overlay = existingOverlay;
    this.canvas = this.overlay.querySelector<HTMLCanvasElement>('#screensaver-canvas')!;
    this.ctx = this.canvas.getContext('2d', { alpha: false })!;
    this.hudSpeed = this.overlay.querySelector('#hud-speed');
    this.hudRpm = this.overlay.querySelector('#hud-rpm');
    this.hudGear = this.overlay.querySelector('#hud-gear');

    this.initListeners();
    this.resetIdleTimer();
  }

  private initListeners(): void {
    // Dismiss triggers: any user interaction
    const dismiss = () => {
      if (this.isActive) {
        this.stop();
      }
      this.resetIdleTimer();
    };

    window.addEventListener('keydown', dismiss, { passive: true });
    window.addEventListener('mousemove', dismiss, { passive: true });
    window.addEventListener('mousedown', dismiss, { passive: true });
    window.addEventListener('touchstart', dismiss, { passive: true });
    window.addEventListener('wheel', dismiss, { passive: true });

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.isActive) this.stop();
        if (this.idleTimeoutId) window.clearTimeout(this.idleTimeoutId);
      } else {
        this.resetIdleTimer();
      }
    });

    window.addEventListener('resize', () => {
      if (this.isActive) this.resizeCanvas();
    });
  }

  public resetIdleTimer(): void {
    if (this.idleTimeoutId) {
      window.clearTimeout(this.idleTimeoutId);
    }

    // Do not activate if prefers-reduced-motion is enabled
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.idleTimeoutId = window.setTimeout(() => {
      this.start();
    }, this.idleTimeMs);
  }

  public start(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.overlay.hidden = false;
    this.overlay.setAttribute('aria-hidden', 'false');

    // Trigger CSS fade-in
    requestAnimationFrame(() => {
      this.overlay.classList.add('is-active');
    });

    this.resizeCanvas();
    this.time = 0;
    this.camAngle = 0;
    this.camTimer = 0;
    this.loop();
  }

  public stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.overlay.classList.remove('is-active');
    this.overlay.setAttribute('aria-hidden', 'true');

    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    setTimeout(() => {
      if (!this.isActive) {
        this.overlay.hidden = true;
      }
    }, 400);

    // Refocus terminal input on desktop
    const input = document.getElementById('terminal-input') as HTMLInputElement | null;
    if (input && !('ontouchstart' in window)) {
      input.focus();
    }
  }

  private resizeCanvas(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
  }

  private loop = (): void => {
    if (!this.isActive) return;

    this.time += 0.016;
    this.camTimer += 0.016;

    // Switch Forza cinematic camera angle every 6 seconds
    if (this.camTimer > 6) {
      this.camTimer = 0;
      this.camAngle = (this.camAngle + 1) % 4;
      this.targetSpeed = 220 + Math.random() * 45;
    }

    // Update telemetry simulation
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.02;
    this.rpm = Math.floor(6200 + ((this.currentSpeed - 220) / 45) * 1800 + Math.sin(this.time * 20) * 80);
    this.gear = this.currentSpeed > 240 ? 6 : 5;

    if (this.hudSpeed && Math.floor(this.time * 60) % 6 === 0) {
      this.hudSpeed.textContent = Math.floor(this.currentSpeed).toString();
      if (this.hudRpm) this.hudRpm.textContent = this.rpm.toString();
      if (this.hudGear) this.hudGear.textContent = this.gear.toString();
    }

    this.render();
    this.animId = requestAnimationFrame(this.loop);
  };

  private render(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h * 0.45; // Horizon height
    const isEmber = document.documentElement.dataset['theme'] === 'ember';

    // Base colors
    const colSky = isEmber ? '#0c0704' : '#141416';
    const colRoad = isEmber ? '#160c07' : '#0d0d0f';
    const colGrid = isEmber ? '#8a3d14' : '#2430ff';
    const colAccent = isEmber ? '#e07b39' : '#3344ff';
    const colCar = isEmber ? '#ef7c35' : '#e6e8eb';
    const colTail = '#ff2222';

    // 1. Clear & Sky
    ctx.fillStyle = colSky;
    ctx.fillRect(0, 0, w, h);

    // 2. Horizon Sun / Monolith Grid
    const sunGrad = ctx.createLinearGradient(0, cy - 140, 0, cy);
    sunGrad.addColorStop(0, colAccent);
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, cy - 140, w, 140);

    // Distant mountain skyline
    ctx.fillStyle = isEmber ? '#1a0d08' : '#181a24';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    const peaks = [0.1, 0.22, 0.35, 0.48, 0.62, 0.78, 0.9, 1.0];
    peaks.forEach((pct, i) => {
      const px = w * pct;
      const ph = (Math.sin(i * 1.5) * 0.5 + 0.5) * 60 + 20;
      ctx.lineTo(px - w * 0.05, cy - ph);
      ctx.lineTo(px, cy);
    });
    ctx.lineTo(w, cy);
    ctx.closePath();
    ctx.fill();

    // 3. Ground / Highway Plane
    ctx.fillStyle = colRoad;
    ctx.fillRect(0, cy, w, h - cy);

    // Speed lines & perspective grid
    const roadWidth = w * 0.85;
    const fov = 340;
    const speedOffset = (this.time * this.currentSpeed * 0.8) % 40;

    ctx.strokeStyle = colGrid;
    ctx.lineWidth = 1.5;

    // Lateral perspective road borders
    ctx.beginPath();
    // Center divider
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, h);

    // Road left / right edges
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx - roadWidth, h);
    ctx.moveTo(cx + 20, cy);
    ctx.lineTo(cx + roadWidth, h);
    ctx.stroke();

    // Horizontal moving grid lines on asphalt
    for (let z = 10; z < 400; z += 20) {
      const realZ = (z - speedOffset + 400) % 400;
      if (realZ < 15) continue;
      const scale = fov / realZ;
      const py = cy + scale * 45;
      const leftX = cx - (roadWidth * (py - cy)) / (h - cy);
      const rightX = cx + (roadWidth * (py - cy)) / (h - cy);

      if (py > cy && py < h) {
        ctx.strokeStyle = `rgba(${isEmber ? '224, 123, 57' : '36, 48, 255'}, ${Math.min(1, (py - cy) / (h * 0.4))})`;
        ctx.beginPath();
        ctx.moveTo(leftX, py);
        ctx.lineTo(rightX, py);
        ctx.stroke();
      }
    }

    // 4. Render Procedural 3D Sports Car
    this.renderCar(ctx, cx, cy, colCar, colAccent, colTail);
  }

  private renderCar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    carColor: string,
    accentColor: string,
    tailColor: string
  ): void {
    // Camera angle interpolation
    let camYaw = 0;
    let camPitch = 0.15;
    let camDist = 260;
    let carOffsetZ = 0;
    let carOffsetX = 0;

    switch (this.camAngle) {
      case 0: // Rear chase camera (classic racing perspective)
        camYaw = Math.sin(this.time * 0.8) * 0.08;
        camPitch = 0.18 + Math.sin(this.time * 1.5) * 0.02;
        camDist = 230;
        break;
      case 1: // Side low wheel track camera
        camYaw = 1.25 + Math.sin(this.time * 0.5) * 0.15;
        camPitch = 0.08;
        camDist = 250;
        carOffsetX = 30;
        break;
      case 2: // 3/4 Front cinematic orbit
        camYaw = 2.7 + Math.sin(this.time * 0.6) * 0.35;
        camPitch = 0.18;
        camDist = 280;
        break;
      case 3: // Front low-angle attack
        camYaw = Math.PI + Math.sin(this.time * 0.7) * 0.15;
        camPitch = 0.12;
        camDist = 260;
        break;
    }

    // Vibration from engine & road speed
    const vibY = Math.sin(this.time * 50) * 1.2;
    const cyCar = cy + 180 + vibY;

    // 3D Car Model Definition (Polygonal Coupe)
    const L = 95;  // Half length
    const W = 46;  // Half width
    const H = 22;  // Body height
    const R = 38;  // Roof height

    // Vertices (x = right, y = up, z = forward)
    const rawVertices: Point3D[] = [
      // Bumper Front
      { x: -W * 0.9, y: 0, z: L }, // 0 FL
      { x: W * 0.9, y: 0, z: L },  // 1 FR
      { x: -W * 0.85, y: H * 0.7, z: L * 0.9 }, // 2 FL Hood
      { x: W * 0.85, y: H * 0.7, z: L * 0.9 },  // 3 FR Hood

      // Windshield base
      { x: -W * 0.85, y: H, z: L * 0.3 }, // 4 Windshield base L
      { x: W * 0.85, y: H, z: L * 0.3 },  // 5 Windshield base R

      // Roof top
      { x: -W * 0.65, y: R, z: -L * 0.1 }, // 6 Roof front L
      { x: W * 0.65, y: R, z: -L * 0.1 },  // 7 Roof front R
      { x: -W * 0.65, y: R, z: -L * 0.5 }, // 8 Roof rear L
      { x: W * 0.65, y: R, z: -L * 0.5 },  // 9 Roof rear R

      // Rear Deck / Spoiler
      { x: -W * 0.85, y: H * 0.95, z: -L * 0.85 }, // 10 Rear deck L
      { x: W * 0.85, y: H * 0.95, z: -L * 0.85 },  // 11 Rear deck R
      { x: -W * 0.9, y: 0, z: -L }, // 12 Rear bumper L
      { x: W * 0.9, y: 0, z: -L },  // 13 Rear bumper R

      // Spoiler wing
      { x: -W * 0.85, y: H + 12, z: -L * 0.9 }, // 14 Wing L
      { x: W * 0.85, y: H + 12, z: -L * 0.9 },  // 15 Wing R
    ];

    // Rotate and project points
    const cosY = Math.cos(camYaw);
    const sinY = Math.sin(camYaw);
    const cosP = Math.cos(camPitch);
    const sinP = Math.sin(camPitch);

    const projected = rawVertices.map((p) => {
      // Offset position
      const px = p.x + carOffsetX;
      const py = p.y;
      const pz = p.z + carOffsetZ;

      // Yaw rotation (Y axis)
      const x1 = px * cosY - pz * sinY;
      const z1 = px * sinY + pz * cosY;

      // Pitch rotation (X axis)
      const y2 = py * cosP - z1 * sinP;
      const z2 = py * sinP + z1 * cosP + camDist;

      // Perspective projection
      const fov = 320;
      const scale = fov / Math.max(10, z2);
      return {
        x: cx + x1 * scale,
        y: cyCar - y2 * scale,
        z: z2,
      };
    });

    // Shadow on asphalt
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(cx, cyCar + 4, W * 1.6, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Faces to draw
    const faces = [
      // Hood
      { idx: [0, 1, 3, 2], col: carColor },
      // Windshield
      { idx: [2, 3, 5, 4], col: '#0d1117' },
      // Roof
      { idx: [6, 7, 9, 8], col: carColor },
      // Rear window
      { idx: [8, 9, 11, 10], col: '#0d1117' },
      // Left side
      { idx: [0, 2, 4, 6, 8, 10, 12], col: carColor },
      // Right side
      { idx: [1, 3, 5, 7, 9, 11, 13], col: carColor },
      // Front bumper
      { idx: [0, 1, 3, 2], col: accentColor },
      // Rear bumper / Taillights
      { idx: [10, 11, 13, 12], col: tailColor },
    ];

    // Sort faces painter's algorithm
    const sortedFaces = faces
      .map((f) => {
        const avgZ = f.idx.reduce((sum, i) => sum + (projected[i]?.z || 0), 0) / f.idx.length;
        return { ...f, avgZ };
      })
      .sort((a, b) => b.avgZ - a.avgZ);

    // Draw polygons
    for (const face of sortedFaces) {
      ctx.beginPath();
      const first = projected[face.idx[0]!];
      if (!first) continue;
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < face.idx.length; i++) {
        const pt = projected[face.idx[i]!];
        if (pt) ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      ctx.fillStyle = face.col;
      ctx.fill();

      // Sharp brutalist wireframe outlines
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // Spoiler Wing
    const wL = projected[14];
    const wR = projected[15];
    const dL = projected[10];
    const dR = projected[11];
    if (wL && wR && dL && dR) {
      // Struts
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(dL.x, dL.y);
      ctx.lineTo(wL.x, wL.y);
      ctx.moveTo(dR.x, dR.y);
      ctx.lineTo(wR.x, wR.y);
      ctx.stroke();

      // Top wing plate
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(wL.x, wL.y);
      ctx.lineTo(wR.x, wR.y);
      ctx.stroke();
    }

    // Taillight / Exhaust heat trails when viewed from rear
    if (Math.abs(camYaw) < 1.0) {
      ctx.fillStyle = 'rgba(255, 30, 30, 0.35)';
      const rL = projected[12];
      const rR = projected[13];
      if (rL && rR) {
        ctx.beginPath();
        ctx.moveTo(rL.x, rL.y);
        ctx.lineTo(rL.x - 30, rL.y + 12);
        ctx.lineTo(rL.x, rL.y + 6);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(rR.x, rR.y);
        ctx.lineTo(rR.x + 30, rR.y + 12);
        ctx.lineTo(rR.x, rR.y + 6);
        ctx.fill();
      }
    }

    // Headlight light beams when viewed from front
    if (Math.abs(camYaw) > 2.0) {
      ctx.fillStyle = 'rgba(255, 255, 230, 0.25)';
      const fL = projected[0];
      const fR = projected[1];
      if (fL && fR) {
        ctx.beginPath();
        ctx.moveTo(fL.x, fL.y);
        ctx.lineTo(fL.x - 120, fL.y + 80);
        ctx.lineTo(fL.x + 40, fL.y + 80);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(fR.x, fR.y);
        ctx.lineTo(fR.x - 40, fR.y + 80);
        ctx.lineTo(fR.x + 120, fR.y + 80);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}
