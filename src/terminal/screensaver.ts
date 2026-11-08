/**
 * Retro-Arcade 3D Forza Cinematic Screensaver (Attract Mode)
 * High-performance, pixel-perfect procedural racer engine.
 * Inspired by OutRun, Horizon Chase & Forza attract reels.
 * Ultra-lightweight: zero external 3D libraries, locked 60 FPS.
 */

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

  // Cinematic state
  private time = 0;
  private speed = 246;
  private targetSpeed = 255;
  private rpm = 7600;
  private gear = 5;
  private carX = 0; // Lateral steering (-1..1)
  private carTargetX = 0;
  private steerTimer = 0;
  private camMode = 0; // 0: Chase, 1: Low tarmac, 2: Sweeping curve
  private camTimer = 0;

  constructor(idleSeconds = 20) {
    this.idleTimeMs = idleSeconds * 1000;

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
              SPEED: <span id="hud-speed">246</span> KM/H ·
              RPM: <span id="hud-rpm">7600</span> ·
              GEAR: <span id="hud-gear">5</span>
            </span>
            <span class="hud-controls">KONTROL: [← → / A D] NYETIR · [↑ / W] NITRO</span>
          </div>
          <button id="btn-exit-screensaver" class="screensaver-hint" type="button">TEKAN ESC ATAU KLIK UNTUK KEMBALI KE TERMINAL</button>
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
    const exitBtn = this.overlay.querySelector('#btn-exit-screensaver');
    exitBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stop();
      this.resetIdleTimer();
    });

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.resetIdleTimer();

      if (!this.isActive) return;

      // Interactive Steering & Driving Controls
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        this.carTargetX = Math.max(-0.85, this.carTargetX - 0.28);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        this.carTargetX = Math.min(0.85, this.carTargetX + 0.28);
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.speed = Math.min(290, this.speed + 12);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.speed = Math.max(160, this.speed - 12);
        return;
      }

      // Any other key (Escape, Enter, Space, Q, etc.) exits screensaver
      this.stop();
    });

    // Touch controls: tap left side to steer left, tap right side to steer right
    this.canvas.addEventListener('touchstart', (e: TouchEvent) => {
      this.resetIdleTimer();
      if (!this.isActive) return;

      const touch = e.touches[0];
      if (!touch) return;

      const screenW = window.innerWidth;
      if (touch.clientX < screenW * 0.45) {
        this.carTargetX = Math.max(-0.85, this.carTargetX - 0.35);
      } else if (touch.clientX > screenW * 0.55) {
        this.carTargetX = Math.min(0.85, this.carTargetX + 0.35);
      } else {
        // Tap middle to boost
        this.speed = Math.min(290, this.speed + 15);
      }
    }, { passive: true });

    window.addEventListener('mousemove', () => this.resetIdleTimer(), { passive: true });
    window.addEventListener('mousedown', () => this.resetIdleTimer(), { passive: true });
    window.addEventListener('wheel', () => this.resetIdleTimer(), { passive: true });

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
    this.camMode = 0;
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
    this.steerTimer += 0.016;

    // Switch camera perspective every 7 seconds
    if (this.camTimer > 7) {
      this.camTimer = 0;
      this.camMode = (this.camMode + 1) % 3;
      this.targetSpeed = 230 + Math.random() * 40;
    }

    // Gentle lane weaving (car drifting smoothly across highway lanes)
    if (this.steerTimer > 3.5) {
      this.steerTimer = 0;
      this.carTargetX = (Math.random() - 0.5) * 0.7;
    }
    this.carX += (this.carTargetX - this.carX) * 0.04;

    // Physics simulation
    this.speed += (this.targetSpeed - this.speed) * 0.02;
    this.rpm = Math.floor(6600 + ((this.speed - 220) / 50) * 1600 + Math.sin(this.time * 30) * 100);
    this.gear = this.speed > 248 ? 6 : 5;

    if (this.hudSpeed && Math.floor(this.time * 60) % 5 === 0) {
      this.hudSpeed.textContent = Math.floor(this.speed).toString();
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
    const cy = h * 0.42; // Horizon line
    const isEmber = document.documentElement.dataset['theme'] === 'ember';

    // Color theme
    const colSkyTop = isEmber ? '#090503' : '#05060f';
    const colSkyBottom = isEmber ? '#260e05' : '#14142b';
    const colRoad = isEmber ? '#130c08' : '#0a0a12';
    const colRoadLine = isEmber ? '#ff8c3a' : '#2430ff';
    const colCurbA = isEmber ? '#e03a14' : '#ff2255';
    const colCurbB = isEmber ? '#f2f0ea' : '#ffffff';
    const colSunA = isEmber ? '#ffb03a' : '#c966ff';
    const colSunB = isEmber ? '#ff5214' : '#2430ff';
    const colCarBody = isEmber ? '#ff6a1a' : '#2430ff';
    const colCarTrim = isEmber ? '#1a0c06' : '#0c0d17';

    // 1. Sky & Dusk Horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, cy);
    skyGrad.addColorStop(0, colSkyTop);
    skyGrad.addColorStop(1, colSkyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, cy);

    // 2. Giant Retro Sun with Horizontal Blinds
    const sunR = Math.min(w * 0.18, 130);
    const sunGrad = ctx.createLinearGradient(0, cy - sunR, 0, cy);
    sunGrad.addColorStop(0, colSunA);
    sunGrad.addColorStop(1, colSunB);

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, Math.PI, 0, false);
    ctx.fill();

    // Sun horizontal scanline blinds
    ctx.fillStyle = colSkyBottom;
    for (let i = 0; i < 7; i++) {
      const barH = 2.5 + i * 2;
      const barY = cy - sunR * 0.72 + i * 15;
      if (barY < cy) {
        ctx.fillRect(cx - sunR, barY, sunR * 2, barH);
      }
    }

    // Distant mountain silhouette
    ctx.fillStyle = isEmber ? '#180a05' : '#0e101c';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    const peaks = [0.08, 0.22, 0.35, 0.48, 0.62, 0.75, 0.88, 1.0];
    peaks.forEach((pct, i) => {
      const px = w * pct;
      const ph = (Math.sin(i * 1.7) * 0.5 + 0.5) * 50 + 20;
      ctx.lineTo(px - w * 0.05, cy - ph);
      ctx.lineTo(px, cy);
    });
    ctx.lineTo(w, cy);
    ctx.closePath();
    ctx.fill();

    // 3. Ground / Road Tarmac Plane
    ctx.fillStyle = colRoad;
    ctx.fillRect(0, cy, w, h - cy);

    // 4. Perspective Highway with Curves & Speed Markers
    const roadWidth = w * 0.85;
    const curveAmount = Math.sin(this.time * 0.8) * 90;
    const speedPos = (this.time * this.speed * 1.5) % 100;

    // Render road slices from horizon down to bottom
    const slices = 40;
    for (let i = 0; i < slices; i++) {
      const p1 = i / slices;
      const p2 = (i + 1) / slices;

      const y1 = cy + p1 * p1 * (h - cy);
      const y2 = cy + p2 * p2 * (h - cy);

      const curveOffset1 = curveAmount * p1 * p1;
      const curveOffset2 = curveAmount * p2 * p2;

      const w1 = roadWidth * p1 * 1.2;
      const w2 = roadWidth * p2 * 1.2;

      const x1L = cx + curveOffset1 - w1 / 2;
      const x1R = cx + curveOffset1 + w1 / 2;
      const x2L = cx + curveOffset2 - w2 / 2;
      const x2R = cx + curveOffset2 + w2 / 2;

      // Alternating curb colors (red/white rumble strips)
      const curbAlt = Math.floor((p1 * 400 + speedPos) / 30) % 2 === 0;
      const curbWidth1 = 20 * p1;
      const curbWidth2 = 20 * p2;

      ctx.fillStyle = curbAlt ? colCurbA : colCurbB;

      // Left curb strip
      ctx.beginPath();
      ctx.moveTo(x1L, y1);
      ctx.lineTo(x1L - curbWidth1, y1);
      ctx.lineTo(x2L - curbWidth2, y2);
      ctx.lineTo(x2L, y2);
      ctx.closePath();
      ctx.fill();

      // Right curb strip
      ctx.beginPath();
      ctx.moveTo(x1R, y1);
      ctx.lineTo(x1R + curbWidth1, y1);
      ctx.lineTo(x2R + curbWidth2, y2);
      ctx.lineTo(x2R, y2);
      ctx.closePath();
      ctx.fill();

      // Dashed lane divider markers
      const dashAlt = Math.floor((p1 * 500 + speedPos) / 35) % 2 === 0;
      if (dashAlt && p1 > 0.15) {
        const laneW1 = Math.max(2, 6 * p1);
        const laneW2 = Math.max(2, 6 * p2);
        const laneX1 = cx + curveOffset1;
        const laneX2 = cx + curveOffset2;

        ctx.fillStyle = colRoadLine;
        ctx.beginPath();
        ctx.moveTo(laneX1 - laneW1 / 2, y1);
        ctx.lineTo(laneX1 + laneW1 / 2, y1);
        ctx.lineTo(laneX2 + laneW2 / 2, y2);
        ctx.lineTo(laneX2 - laneW2 / 2, y2);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 5. Draw Sleek Supercar (Clean, Polished, Anatomically Authentic)
    this.drawSportsCar(ctx, cx, cy, h, isEmber, colCarBody, colCarTrim);
  }

  /**
   * Draws a gorgeous, sleek retro-futuristic sports car (like a Porsche 911 Turbo / Countach)
   * with authentic proportions, glowing taillights, massive wing spoiler, and spinning tires.
   */
  private drawSportsCar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    canvasH: number,
    isEmber: boolean,
    bodyColor: string,
    trimColor: string
  ): void {
    const scale = Math.min(this.canvas.width, this.canvas.height) / 600;
    const carW = 320 * scale;
    const carH = 110 * scale;

    // Camera placement & subtle suspension bounce
    let posY = cy + (canvasH - cy) * 0.65;
    if (this.camMode === 1) {
      posY = cy + (canvasH - cy) * 0.76; // Low tarmac camera
    }

    const vibY = Math.sin(this.time * 45) * 1.5;
    const bankAngle = (this.carX * 0.12) + Math.sin(this.time * 3) * 0.02; // banking into curves

    const posX = cx + this.carX * (this.canvas.width * 0.22);

    ctx.save();
    ctx.translate(posX, posY + vibY);
    ctx.rotate(bankAngle);

    // A. Neon Underglow on Asphalt
    const underglow = ctx.createRadialGradient(0, carH * 0.45, 20 * scale, 0, carH * 0.45, carW * 0.7);
    underglow.addColorStop(0, isEmber ? 'rgba(255, 120, 20, 0.75)' : 'rgba(36, 48, 255, 0.75)');
    underglow.addColorStop(1, 'transparent');
    ctx.fillStyle = underglow;
    ctx.beginPath();
    ctx.ellipse(0, carH * 0.45, carW * 0.7, 26 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // B. Ground Contact Tire Shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-carW * 0.36, carH * 0.42, 38 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(carW * 0.36, carH * 0.42, 38 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // C. Massive Wide Racing Slicks (Left & Right Tires)
    const tireW = 54 * scale;
    const tireH = 75 * scale;
    const tireY = carH * 0.1;

    [-carW * 0.38, carW * 0.38].forEach((tx) => {
      // Outer rubber tire
      ctx.fillStyle = '#101217';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(tx - tireW / 2, tireY, tireW, tireH, 8 * scale);
      ctx.fill();
      ctx.stroke();

      // Spinning alloy rim
      ctx.fillStyle = '#1e2430';
      ctx.beginPath();
      ctx.roundRect(tx - tireW * 0.35, tireY + 10 * scale, tireW * 0.7, tireH - 20 * scale, 4 * scale);
      ctx.fill();

      // Rim cross-spokes with rotation blur
      ctx.strokeStyle = isEmber ? '#ff7a29' : '#00f5ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tx, tireY + 12 * scale);
      ctx.lineTo(tx, tireY + tireH - 12 * scale);
      ctx.stroke();
    });

    // D. Lower Rear Diffuser & Exhaust Tips
    const diffW = carW * 0.65;
    const diffH = 26 * scale;
    const diffY = carH * 0.35;

    ctx.fillStyle = trimColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-diffW / 2, diffY, diffW, diffH, 4 * scale);
    ctx.fill();
    ctx.stroke();

    // Diffuser vertical aero fins
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    for (let f = -3; f <= 3; f++) {
      if (f === 0) continue;
      const fx = (f * diffW) / 8;
      ctx.beginPath();
      ctx.moveTo(fx, diffY);
      ctx.lineTo(fx, diffY + diffH);
      ctx.stroke();
    }

    // Twin Quad Exhaust Pipes
    const exhaustFlame = Math.sin(this.time * 50) * 16 * scale + 10 * scale;
    [-diffW * 0.32, -diffW * 0.22, diffW * 0.22, diffW * 0.32].forEach((ex) => {
      // Chrome pipe tips
      ctx.fillStyle = '#1c202a';
      ctx.strokeStyle = '#6a788e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ex, diffY + diffH * 0.6, 7 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // High-RPM blue/orange nitrous exhaust flames!
      const flameGrad = ctx.createLinearGradient(ex, diffY + diffH * 0.8, ex, diffY + diffH * 0.8 + exhaustFlame);
      flameGrad.addColorStop(0, '#00e1ff');
      flameGrad.addColorStop(0.3, isEmber ? '#ff7a18' : '#6b4aff');
      flameGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(ex - 4 * scale, diffY + diffH * 0.8);
      ctx.lineTo(ex, diffY + diffH * 0.8 + exhaustFlame);
      ctx.lineTo(ex + 4 * scale, diffY + diffH * 0.8);
      ctx.fill();
    });

    // E. Main Rear Body Bumper & Wide Haunches
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.beginPath();
    // Start top left shoulder
    ctx.moveTo(-carW * 0.44, carH * 0.05);
    // Across rear deck
    ctx.lineTo(-carW * 0.32, -carH * 0.08);
    ctx.lineTo(carW * 0.32, -carH * 0.08);
    ctx.lineTo(carW * 0.44, carH * 0.05);
    // Down right fender flare
    ctx.lineTo(carW * 0.48, carH * 0.28);
    ctx.lineTo(carW * 0.42, carH * 0.38);
    // Across bottom
    ctx.lineTo(-carW * 0.42, carH * 0.38);
    // Up left fender flare
    ctx.lineTo(-carW * 0.48, carH * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Body shading gradient
    const bodyShade = ctx.createLinearGradient(0, -carH * 0.1, 0, carH * 0.4);
    bodyShade.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    bodyShade.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = bodyShade;
    ctx.fill();

    // F. Continuous Neon Laser Taillight Bar
    const lightW = carW * 0.76;
    const lightH = 14 * scale;
    const lightY = carH * 0.12;

    // Glowing red housing
    ctx.fillStyle = '#2b090c';
    ctx.fillRect(-lightW / 2, lightY, lightW, lightH);

    // Neon laser red LED strip
    ctx.fillStyle = '#ff1a38';
    ctx.shadowColor = '#ff1a38';
    ctx.shadowBlur = 18 * scale;
    ctx.fillRect(-lightW / 2 + 4, lightY + 2, lightW - 8, lightH - 4);
    ctx.shadowBlur = 0; // reset blur

    // Bright core white flare
    ctx.fillStyle = '#ffeedd';
    ctx.fillRect(-lightW / 2 + 10, lightY + 4, lightW - 20, 3 * scale);

    // Center illuminated RONN logo
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(10 * scale)}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RONN', 0, lightY + lightH * 0.5);

    // G. Sleek Cabin & Sloping Rear Windshield (Green/Cyan Sky Tint)
    const cabinW = carW * 0.55;
    const roofW = carW * 0.4;
    const cabinTopY = -carH * 0.42;
    const cabinBaseY = -carH * 0.08;

    // Cabin roof & pillars
    ctx.fillStyle = trimColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-cabinW / 2, cabinBaseY);
    ctx.lineTo(-roofW / 2, cabinTopY);
    ctx.lineTo(roofW / 2, cabinTopY);
    ctx.lineTo(cabinW / 2, cabinBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rear Windshield Glass with Horizon Reflection
    const glassGrad = ctx.createLinearGradient(0, cabinTopY, 0, cabinBaseY);
    glassGrad.addColorStop(0, '#00f5ff');
    glassGrad.addColorStop(0.5, '#0a1d30');
    glassGrad.addColorStop(1, '#050a12');

    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.moveTo(-cabinW * 0.45, cabinBaseY - 2);
    ctx.lineTo(-roofW * 0.44, cabinTopY + 5 * scale);
    ctx.lineTo(roofW * 0.44, cabinTopY + 5 * scale);
    ctx.lineTo(cabinW * 0.45, cabinBaseY - 2);
    ctx.closePath();
    ctx.fill();

    // Engine bay louvers on sloped rear window
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    for (let l = 1; l <= 4; l++) {
      const ly = cabinTopY + ((cabinBaseY - cabinTopY) * l) / 5;
      const lw = roofW * 0.45 + (cabinW * 0.45 - roofW * 0.45) * (l / 5);
      ctx.beginPath();
      ctx.moveTo(-lw, ly);
      ctx.lineTo(lw, ly);
      ctx.stroke();
    }

    // H. Massive Floating Carbon GT Wing Spoiler
    const wingW = carW * 0.88;
    const wingY = -carH * 0.38;
    const strutBaseY = -carH * 0.06;

    // Dual vertical spoiler mounts
    [-carW * 0.25, carW * 0.25].forEach((sx) => {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(sx, strutBaseY);
      ctx.lineTo(sx * 1.05, wingY);
      ctx.stroke();
    });

    // Main carbon wing blade
    ctx.fillStyle = trimColor;
    ctx.strokeStyle = isEmber ? '#ff7a29' : '#00f5ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-wingW / 2, wingY - 6 * scale, wingW, 12 * scale, 3 * scale);
    ctx.fill();
    ctx.stroke();

    // Aerodynamic endplates on spoiler tips
    [-wingW / 2, wingW / 2].forEach((ex) => {
      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.fillRect(ex - 3 * scale, wingY - 14 * scale, 6 * scale, 24 * scale);
      ctx.strokeRect(ex - 3 * scale, wingY - 14 * scale, 6 * scale, 24 * scale);
    });

    ctx.restore();
  }
}
