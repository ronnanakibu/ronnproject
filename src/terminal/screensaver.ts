/**
 * Retro-Arcade 3D Forza Cinematic Screensaver
 * Procedural High-Visibility Low-Poly Sports Car & Endless Cyber Highway.
 * Ultra-lightweight: Zero external 3D libraries, ~4KB footprint, locked 60 FPS.
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
  private currentSpeed = 242;
  private targetSpeed = 255;
  private rpm = 7600;
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
            <span class="hud-tag">RONN MOTORS // 3D FORZA ATTRACT MODE</span>
            <span class="hud-stats">
              SPEED: <span id="hud-speed">242</span> KM/H ·
              RPM: <span id="hud-rpm">7600</span> ·
              GEAR: <span id="hud-gear">5</span>
            </span>
          </div>
          <div class="screensaver-hint">TEKAN APAPUN ATAU TAP UNTUK KEMBALI KE TERMINAL</div>
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
      this.targetSpeed = 225 + Math.random() * 45;
    }

    // Telemetry physics
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.02;
    this.rpm = Math.floor(6400 + ((this.currentSpeed - 220) / 50) * 1800 + Math.sin(this.time * 24) * 90);
    this.gear = this.currentSpeed > 245 ? 6 : 5;

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
    const cy = h * 0.42; // Horizon
    const isEmber = document.documentElement.dataset['theme'] === 'ember';

    // Theme palette
    const colSkyTop = isEmber ? '#0d0704' : '#080811';
    const colSkyBottom = isEmber ? '#2b1206' : '#14142b';
    const colRoad = isEmber ? '#140c08' : '#0a0a10';
    const colGrid = isEmber ? '#9c4415' : '#2430ff';
    const colAccent = isEmber ? '#ff7a29' : '#3d4aff';
    const colCarBody = isEmber ? '#ff6614' : '#e6e8eb';
    const colCarShadow = isEmber ? '#9e3a06' : '#88909c';
    const colCockpit = '#070b12';
    const colGlass = isEmber ? '#00f5ff' : '#69b4ff';
    const colTail = '#ff1e38';

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, cy);
    skyGrad.addColorStop(0, colSkyTop);
    skyGrad.addColorStop(1, colSkyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, cy);

    // 2. Retro Neon Sun / Horizon Blind
    const sunRadius = Math.min(w * 0.18, 120);
    const sunGrad = ctx.createLinearGradient(0, cy - sunRadius, 0, cy);
    sunGrad.addColorStop(0, isEmber ? '#ffae33' : '#a26bff');
    sunGrad.addColorStop(1, colAccent);

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius, Math.PI, 0, false);
    ctx.fill();

    // Horizontal blinds on sun
    ctx.fillStyle = colSkyBottom;
    for (let i = 0; i < 7; i++) {
      const bh = 3 + i * 2;
      const by = cy - sunRadius * 0.75 + i * 14;
      if (by < cy) {
        ctx.fillRect(cx - sunRadius, by, sunRadius * 2, bh);
      }
    }

    // Distant mountain skyline
    ctx.fillStyle = isEmber ? '#1a0b05' : '#10101c';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    const peaks = [0.08, 0.2, 0.32, 0.46, 0.6, 0.74, 0.88, 1.0];
    peaks.forEach((pct, i) => {
      const px = w * pct;
      const ph = (Math.sin(i * 1.8) * 0.5 + 0.5) * 55 + 25;
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
    const roadWidth = w * 0.9;
    const fov = 380;
    const speedOffset = (this.time * this.currentSpeed * 1.2) % 60;

    // Perspective Highway Borders
    ctx.strokeStyle = colGrid;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    // Center dashed divider
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, h);

    // Outer road borders
    ctx.moveTo(cx - 30, cy);
    ctx.lineTo(cx - roadWidth, h);
    ctx.moveTo(cx + 30, cy);
    ctx.lineTo(cx + roadWidth, h);
    ctx.stroke();

    // Roadside passing light poles
    for (let z = 30; z < 500; z += 50) {
      const rz = (z - speedOffset + 500) % 500;
      if (rz < 25) continue;
      const scale = fov / rz;
      const py = cy + scale * 50;
      const poleH = scale * 45;
      const pxL = cx - (roadWidth * (py - cy)) / (h - cy) - 20 * scale;
      const pxR = cx + (roadWidth * (py - cy)) / (h - cy) + 20 * scale;

      if (py > cy && py < h) {
        ctx.strokeStyle = colAccent;
        ctx.lineWidth = Math.max(1, scale * 1.8);

        // Left pole
        ctx.beginPath();
        ctx.moveTo(pxL, py);
        ctx.lineTo(pxL, py - poleH);
        ctx.stroke();

        // Right pole
        ctx.beginPath();
        ctx.moveTo(pxR, py);
        ctx.lineTo(pxR, py - poleH);
        ctx.stroke();

        // Neon pole lantern
        ctx.fillStyle = isEmber ? '#ffaa33' : '#66a3ff';
        ctx.fillRect(pxL - 3, py - poleH - 3, 6, 6);
        ctx.fillRect(pxR - 3, py - poleH - 3, 6, 6);
      }
    }

    // Moving horizontal grid lines on asphalt
    for (let z = 15; z < 450; z += 30) {
      const rz = (z - speedOffset + 450) % 450;
      if (rz < 20) continue;
      const scale = fov / rz;
      const py = cy + scale * 50;
      const lx = cx - (roadWidth * (py - cy)) / (h - cy);
      const rx = cx + (roadWidth * (py - cy)) / (h - cy);

      if (py > cy && py < h) {
        const alpha = Math.min(1, ((py - cy) / (h - cy)) * 1.4);
        ctx.strokeStyle = `rgba(${isEmber ? '255, 122, 41' : '36, 48, 255'}, ${alpha})`;
        ctx.lineWidth = Math.max(1, scale * 1.5);
        ctx.beginPath();
        ctx.moveTo(lx, py);
        ctx.lineTo(rx, py);
        ctx.stroke();
      }
    }

    // 4. Render Procedural 3D Sports Car
    this.renderCar(ctx, cx, cy, colCarBody, colCarShadow, colAccent, colCockpit, colGlass, colTail);
  }

  private renderCar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    bodyCol: string,
    shadowCol: string,
    accentCol: string,
    cockpitCol: string,
    glassCol: string,
    tailCol: string
  ): void {
    // Dynamic scale so the car is prominent across all screen sizes
    const baseScale = Math.max(1.1, Math.min(this.canvas.width, this.canvas.height) / 480);

    let camYaw = 0;
    let camPitch = 0.16;
    let camDist = 320;
    let carOffsetX = 0;

    switch (this.camAngle) {
      case 0: // Rear Chase Camera
        camYaw = Math.sin(this.time * 0.7) * 0.12;
        camPitch = 0.16 + Math.sin(this.time * 1.4) * 0.02;
        camDist = 300;
        break;
      case 1: // Side Wheel Tracking Cam
        camYaw = 1.35 + Math.sin(this.time * 0.5) * 0.12;
        camPitch = 0.09;
        camDist = 320;
        carOffsetX = 45 * baseScale;
        break;
      case 2: // 3/4 Front Dramatic Orbit
        camYaw = 2.65 + Math.sin(this.time * 0.6) * 0.3;
        camPitch = 0.17;
        camDist = 340;
        break;
      case 3: // Front Head-on Charge
        camYaw = Math.PI + Math.sin(this.time * 0.8) * 0.14;
        camPitch = 0.12;
        camDist = 310;
        break;
    }

    // Position car right on the highway
    const vibY = Math.sin(this.time * 48) * 2;
    const cyCar = cy + this.canvas.height * 0.26 + vibY;

    // Bold Dimensions
    const L = 160 * baseScale; // Length
    const W = 82 * baseScale;  // Width
    const H = 36 * baseScale;  // Body height
    const R = 72 * baseScale;  // Roof height

    // 3D Model Vertices
    const rawVertices: Point3D[] = [
      // 0..3: Front Bumper & Splitter
      { x: -W * 0.95, y: 0, z: L },
      { x: W * 0.95, y: 0, z: L },
      { x: -W * 0.9, y: H * 0.7, z: L * 0.9 },
      { x: W * 0.9, y: H * 0.7, z: L * 0.9 },

      // 4..5: Hood / Windshield base
      { x: -W * 0.88, y: H * 0.95, z: L * 0.3 },
      { x: W * 0.88, y: H * 0.95, z: L * 0.3 },

      // 6..9: Cabin Roof
      { x: -W * 0.68, y: R, z: -L * 0.05 },
      { x: W * 0.68, y: R, z: -L * 0.05 },
      { x: -W * 0.68, y: R, z: -L * 0.48 },
      { x: W * 0.68, y: R, z: -L * 0.48 },

      // 10..13: Rear Deck & Bumper
      { x: -W * 0.9, y: H * 0.95, z: -L * 0.85 },
      { x: W * 0.9, y: H * 0.95, z: -L * 0.85 },
      { x: -W * 0.95, y: 0, z: -L },
      { x: W * 0.95, y: 0, z: -L },

      // 14..15: GT Spoiler Wing
      { x: -W * 0.92, y: H + 26 * baseScale, z: -L * 0.92 },
      { x: W * 0.92, y: H + 26 * baseScale, z: -L * 0.92 },

      // 16..19: Pop-up Headlights (Left & Right)
      { x: -W * 0.78, y: H * 0.95, z: L * 0.75 },
      { x: -W * 0.45, y: H * 0.95, z: L * 0.75 },
      { x: W * 0.45, y: H * 0.95, z: L * 0.75 },
      { x: W * 0.78, y: H * 0.95, z: L * 0.75 },
    ];

    // Projection calculation
    const cosY = Math.cos(camYaw);
    const sinY = Math.sin(camYaw);
    const cosP = Math.cos(camPitch);
    const sinP = Math.sin(camPitch);
    const fov = 420;

    const projected = rawVertices.map((p) => {
      const px = p.x + carOffsetX;
      const py = p.y;
      const pz = p.z;

      const x1 = px * cosY - pz * sinY;
      const z1 = px * sinY + pz * cosY;

      const y2 = py * cosP - z1 * sinP;
      const z2 = py * sinP + z1 * cosP + camDist;

      const scale = fov / Math.max(10, z2);
      return {
        x: cx + x1 * scale,
        y: cyCar - y2 * scale,
        z: z2,
        scale,
      };
    });

    // 1. Glowing Neon Underglow on Asphalt
    const underglowGrad = ctx.createRadialGradient(cx, cyCar + 8, 20, cx, cyCar + 8, W * 2.2);
    underglowGrad.addColorStop(0, accentCol);
    underglowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = underglowGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cyCar + 8, W * 2.2, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark chassis ground contact shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.ellipse(cx, cyCar + 6, W * 1.8, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Polygonal Faces
    const faces = [
      // Front Bumper Nose
      { idx: [0, 1, 3, 2], col: shadowCol },
      // Hood
      { idx: [2, 3, 5, 4], col: bodyCol },
      // Windshield (Glass with cyan reflection)
      { idx: [4, 5, 7, 6], col: glassCol },
      // Roof
      { idx: [6, 7, 9, 8], col: cockpitCol },
      // Rear Glass
      { idx: [8, 9, 11, 10], col: glassCol },
      // Rear Deck / Boot
      { idx: [10, 11, 13, 12], col: bodyCol },
      // Left Side Body
      { idx: [0, 2, 4, 6, 8, 10, 12], col: shadowCol },
      // Right Side Body
      { idx: [1, 3, 5, 7, 9, 11, 13], col: bodyCol },
      // Rear Continuous Neon Taillight Bar
      { idx: [10, 11, 13, 12], col: tailCol },
    ];

    const sortedFaces = faces
      .map((f) => {
        const avgZ = f.idx.reduce((sum, i) => sum + (projected[i]?.z || 0), 0) / f.idx.length;
        return { ...f, avgZ };
      })
      .sort((a, b) => b.avgZ - a.avgZ);

    // Render body polygons with crisp brutalist 8-bit stroke outlines
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

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 3. Render 3D Wheels (Front Left, Front Right, Rear Left, Rear Right)
    const wheelPositions = [
      { x: -W * 0.95, y: 16 * baseScale, z: L * 0.62 },
      { x: W * 0.95, y: 16 * baseScale, z: L * 0.62 },
      { x: -W * 0.95, y: 18 * baseScale, z: -L * 0.65 },
      { x: W * 0.95, y: 18 * baseScale, z: -L * 0.65 },
    ];

    wheelPositions.forEach((wp) => {
      const px = wp.x + carOffsetX;
      const py = wp.y;
      const pz = wp.z;

      const x1 = px * cosY - pz * sinY;
      const z1 = px * sinY + pz * cosY;
      const y2 = py * cosP - z1 * sinP;
      const z2 = py * sinP + z1 * cosP + camDist;

      const scale = fov / Math.max(10, z2);
      const wx = cx + x1 * scale;
      const wy = cyCar - y2 * scale + 10;
      const wr = 22 * baseScale * scale;

      // Tire
      ctx.fillStyle = '#111317';
      ctx.beginPath();
      ctx.arc(wx, wy, wr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Spinning Rim / Alloy Spokes
      ctx.strokeStyle = accentCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wx, wy, wr * 0.55, 0, Math.PI * 2);
      ctx.stroke();

      // Cross spokes rotating with speed
      const rot = this.time * 30;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(rot) * wr * 0.55, wy + Math.sin(rot) * wr * 0.55);
      ctx.lineTo(wx - Math.cos(rot) * wr * 0.55, wy - Math.sin(rot) * wr * 0.55);
      ctx.moveTo(wx + Math.cos(rot + 1.57) * wr * 0.55, wy + Math.sin(rot + 1.57) * wr * 0.55);
      ctx.lineTo(wx - Math.cos(rot + 1.57) * wr * 0.55, wy - Math.sin(rot + 1.57) * wr * 0.55);
      ctx.stroke();
    });

    // 4. Massive GT Wing Spoiler
    const wL = projected[14];
    const wR = projected[15];
    const dL = projected[10];
    const dR = projected[11];
    if (wL && wR && dL && dR) {
      // Struts
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(dL.x, dL.y);
      ctx.lineTo(wL.x, wL.y);
      ctx.moveTo(dR.x, dR.y);
      ctx.lineTo(wR.x, wR.y);
      ctx.stroke();

      // Main Carbon Wing Blade
      ctx.strokeStyle = accentCol;
      ctx.lineWidth = 6 * baseScale;
      ctx.beginPath();
      ctx.moveTo(wL.x - 8, wL.y);
      ctx.lineTo(wR.x + 8, wR.y);
      ctx.stroke();
    }

    // 5. Headlight Projector Light Beams (when viewed from front)
    if (Math.abs(camYaw) > 1.8) {
      const fL = projected[0];
      const fR = projected[1];
      if (fL && fR) {
        // Pop-up headlights pods
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fL.x - 12, fL.y - 14, 24, 12);
        ctx.fillRect(fR.x - 12, fR.y - 14, 24, 12);

        // Huge forward beam cones illuminating asphalt
        const beamGradL = ctx.createLinearGradient(fL.x, fL.y, fL.x - 220, fL.y + 160);
        beamGradL.addColorStop(0, 'rgba(255, 255, 240, 0.45)');
        beamGradL.addColorStop(1, 'transparent');
        ctx.fillStyle = beamGradL;
        ctx.beginPath();
        ctx.moveTo(fL.x, fL.y);
        ctx.lineTo(fL.x - 240, fL.y + 180);
        ctx.lineTo(fL.x + 60, fL.y + 180);
        ctx.closePath();
        ctx.fill();

        const beamGradR = ctx.createLinearGradient(fR.x, fR.y, fR.x + 220, fR.y + 160);
        beamGradR.addColorStop(0, 'rgba(255, 255, 240, 0.45)');
        beamGradR.addColorStop(1, 'transparent');
        ctx.fillStyle = beamGradR;
        ctx.beginPath();
        ctx.moveTo(fR.x, fR.y);
        ctx.lineTo(fR.x - 60, fR.y + 180);
        ctx.lineTo(fR.x + 240, fR.y + 180);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 6. Taillight Glow & Twin Exhaust Flames (when viewed from rear)
    if (Math.abs(camYaw) < 1.1) {
      const rL = projected[12];
      const rR = projected[13];
      if (rL && rR) {
        // Red LED lightbar glow
        ctx.strokeStyle = '#ff2244';
        ctx.lineWidth = 5 * baseScale;
        ctx.beginPath();
        ctx.moveTo(rL.x, rL.y - 4);
        ctx.lineTo(rR.x, rR.y - 4);
        ctx.stroke();

        // Twin exhaust flame bursts
        const flameLen = 25 + Math.sin(this.time * 60) * 15;
        ctx.fillStyle = 'rgba(255, 120, 20, 0.85)';
        ctx.beginPath();
        ctx.moveTo(rL.x + 10, rL.y + 4);
        ctx.lineTo(rL.x + 15, rL.y + flameLen);
        ctx.lineTo(rL.x + 20, rL.y + 4);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(rR.x - 20, rR.y + 4);
        ctx.lineTo(rR.x - 15, rR.y + flameLen);
        ctx.lineTo(rR.x - 10, rR.y + 4);
        ctx.fill();
      }
    }
  }
}
