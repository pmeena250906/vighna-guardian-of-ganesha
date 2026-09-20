/**
 * VIGHNA: GUARDIAN OF GANESHA - UNIFIED STANDALONE GAME ENGINE
 * High-performance 2D/2.5D Cinematic Indian Mythological Action Game
 * Fully self-contained, zero external runtime dependencies, GitHub Pages ready.
 */

// Canvas roundRect polyfill for compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    if (typeof radii === 'number') radii = [radii, radii, radii, radii];
    if (!Array.isArray(radii)) radii = [0, 0, 0, 0];
    const r0 = radii[0] || 0, r1 = radii[1] || r0, r2 = radii[2] || r0, r3 = radii[3] || r1;
    this.moveTo(x + r0, y);
    this.lineTo(x + w - r1, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r1);
    this.lineTo(x + w, y + h - r2);
    this.quadraticCurveTo(x + w, y + h, x + w - r2, y + h);
    this.lineTo(x + r3, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r3);
    this.lineTo(x, y + r0);
    this.quadraticCurveTo(x, y, x + r0, y);
    this.closePath();
  };
}

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicTimer = null;
    this.musicStep = 0;
    this.musicBpm = 110;
    this.intensity = 1.0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    return this.enabled;
  }

  playTempleBell(pitch = 587.33, duration = 3.5, gainLevel = 0.4) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const partials = [
      { ratio: 1.0, gain: 0.8, decay: duration },
      { ratio: 2.0, gain: 0.5, decay: duration * 0.8 },
      { ratio: 2.76, gain: 0.35, decay: duration * 0.6 },
      { ratio: 4.07, gain: 0.25, decay: duration * 0.45 },
      { ratio: 5.43, gain: 0.15, decay: duration * 0.3 }
    ];

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(gainLevel, t);
    masterGain.connect(this.ctx.destination);

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch * p.ratio, t);
      pGain.gain.setValueAtTime(p.gain, t);
      pGain.gain.exponentialRampToValueAtTime(0.0001, t + p.decay);
      osc.connect(pGain);
      pGain.connect(masterGain);
      osc.start(t);
      osc.stop(t + p.decay);
    });
  }

  playSwordLight() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.12;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.linearRampToValueAtTime(600, t + dur);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  playSwordHeavy() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.22;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + dur);

    const oscFilter = this.ctx.createBiquadFilter();
    oscFilter.type = 'lowpass';
    oscFilter.frequency.setValueAtTime(1200, t);
    oscFilter.frequency.exponentialRampToValueAtTime(200, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(oscFilter);
    oscFilter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + dur);
    this.playSwordLight();
  }

  playHitSlash(isCrit = false) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = isCrit ? 0.25 : 0.15;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isCrit ? 0.6 : 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isCrit ? 180 : 130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  playDash() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.25;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  playLightning() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.65;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  playFireBurst() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.55;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(260, t);
    filter.frequency.exponentialRampToValueAtTime(750, t + 0.2);
    filter.frequency.exponentialRampToValueAtTime(140, t + dur);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  playGajaRoar() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 1.8;
    [130.81, 164.81, 196.00, 261.63].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f * 0.9, t);
      osc.frequency.linearRampToValueAtTime(f * 1.15, t + 0.4);
      osc.frequency.exponentialRampToValueAtTime(f, t + dur);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + dur);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    });
  }

  playTempleAlarm() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(740, t + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playUiClick() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  startBattleMusic(isBoss = false) {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicBpm = isBoss ? 134 : 112;
    this.intensity = isBoss ? 1.25 : 1.0;
    const stepDurationMs = (60 / this.musicBpm / 4) * 1000;

    const pattern = isBoss ? [
      1, 0, 3, 0,  2, 0, 1, 3,
      1, 3, 2, 0,  1, 1, 2, 3
    ] : [
      1, 0, 0, 3,  2, 0, 1, 0,
      1, 0, 3, 0,  2, 0, 0, 3
    ];

    this.musicStep = 0;
    this.musicTimer = setInterval(() => {
      if (!this.enabled) return;
      const hit = pattern[this.musicStep % 16];
      if (hit === 1) this.playBassDrum();
      else if (hit === 2) this.playSnareDrum();
      else if (hit === 3) this.playTablaHigh();

      if (this.musicStep % 32 === 0) {
        this.playTempleBell(440, 2.0, 0.15);
      }
      this.musicStep++;
    }, stepDurationMs);
  }

  playBassDrum() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45 * this.intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playSnareDrum() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.12;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1100, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22 * this.intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  playTablaHigh() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2 * this.intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  stopBattleMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

/* =========================================================================
   2. PARTICLE & VFX SYSTEM (Hit-Stop, Screen Shake, Sparks, Lightning)
   ========================================================================= */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.damageTexts = [];
    this.shockwaves = [];
    this.lightningBolts = [];
    this.ambientPetals = [];

    this.shakeTrauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeRotation = 0;
    this.hitStopFrames = 0;

    this.initAmbient();
  }

  initAmbient() {
    for (let i = 0; i < 35; i++) {
      this.ambientPetals.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * 1400 - 300,
        vx: 0.3 + Math.random() * 0.7,
        vy: 0.2 + Math.random() * 0.5,
        size: 3 + Math.random() * 4,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.04,
        color: Math.random() > 0.4 ? '#f39c12' : '#e67e22',
        alpha: 0.5 + Math.random() * 0.4
      });
    }
  }

  triggerHitStop(frames = 4) {
    this.hitStopFrames = Math.max(this.hitStopFrames, frames);
  }

  addShake(amount = 0.5) {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + amount);
  }

  emitSparks(x, y, count = 12, color = '#ffd700', speed = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.5 + Math.random()) * speed;
      this.particles.push({
        type: 'spark',
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.04,
        size: 2.5 + Math.random() * 3,
        color
      });
    }
  }

  emitSlashArc(x, y, angle, radius = 50, color = '#ffd700', isHeavy = false) {
    this.particles.push({
      type: 'slash',
      x, y,
      angle,
      radius,
      life: 1.0,
      decay: isHeavy ? 0.09 : 0.14,
      color,
      isHeavy
    });
  }

  emitShockwave(x, y, maxRadius = 90, color = 'rgba(245, 176, 65, 0.8)', duration = 0.3) {
    this.shockwaves.push({
      x, y,
      radius: 8,
      maxRadius,
      life: 1.0,
      decay: 1.0 / (duration * 60),
      color
    });
  }

  emitFireBurst(x, y, count = 28) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 6;
      this.particles.push({
        type: 'fire',
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.035,
        size: 6 + Math.random() * 8,
        color: Math.random() > 0.5 ? '#e74c3c' : '#f39c12'
      });
    }
    this.emitShockwave(x, y, 120, 'rgba(230, 126, 34, 0.75)', 0.35);
  }

  emitLightningBolt(startX, startY, endX, endY) {
    const segments = [];
    let curX = startX;
    let curY = startY;
    const steps = 9;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const targetX = startX + (endX - startX) * t;
      const targetY = startY + (endY - startY) * t;
      const jitter = (1.0 - t) * 35;
      const nextX = i === steps ? endX : targetX + (Math.random() - 0.5) * jitter;
      const nextY = i === steps ? endY : targetY + (Math.random() - 0.5) * jitter;

      segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
      curX = nextX;
      curY = nextY;
    }

    this.lightningBolts.push({
      segments,
      life: 1.0,
      decay: 0.12,
      color: '#ffd700'
    });

    this.emitSparks(endX, endY, 16, '#ffd700', 7);
    this.emitShockwave(endX, endY, 70, 'rgba(255, 215, 0, 0.8)', 0.25);
  }

  emitDamageText(x, y, text, isCrit = false, isPlayer = false) {
    this.damageTexts.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 20,
      text,
      life: 1.0,
      decay: 0.022,
      isCrit,
      isPlayer,
      vy: -1.6
    });
  }

  update() {
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      return false;
    }

    if (this.shakeTrauma > 0) {
      const shakePower = Math.pow(this.shakeTrauma, 2);
      this.shakeX = (Math.random() * 2 - 1) * 16 * shakePower;
      this.shakeY = (Math.random() * 2 - 1) * 16 * shakePower;
      this.shakeRotation = (Math.random() * 2 - 1) * 0.04 * shakePower;
      this.shakeTrauma = Math.max(0, this.shakeTrauma - 0.035);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeRotation = 0;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx || 0;
      p.y += p.vy || 0;
      if (p.type === 'spark') p.vy += 0.12;
      else if (p.type === 'fire') p.size *= 0.96;
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.life -= s.decay;
      if (s.life <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      s.radius += (s.maxRadius - s.radius) * 0.18;
    }

    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const l = this.lightningBolts[i];
      l.life -= l.decay;
      if (l.life <= 0) this.lightningBolts.splice(i, 1);
    }

    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const d = this.damageTexts[i];
      d.life -= d.decay;
      if (d.life <= 0) {
        this.damageTexts.splice(i, 1);
        continue;
      }
      d.y += d.vy;
      d.vy *= 0.94;
    }

    for (const petal of this.ambientPetals) {
      petal.x += petal.vx;
      petal.y += petal.vy;
      petal.angle += petal.vAngle;
      if (petal.x > 2200) petal.x = -200;
      if (petal.y > 1500) petal.y = -200;
    }

    return true;
  }

  drawWorld(ctx) {
    ctx.save();
    for (const s of this.shockwaves) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.lineWidth = 3 * s.life;
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = s.life;
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    for (const l of this.lightningBolts) {
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4 * l.life;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.globalAlpha = l.life;
      for (const seg of l.segments) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = 7 * l.life;
      for (const seg of l.segments) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'fire') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'slash') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, -0.65, 0.65);
        ctx.lineWidth = p.isHeavy ? 10 * p.life : 5 * p.life;
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.isHeavy ? 20 : 10;
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    ctx.save();
    for (const petal of this.ambientPetals) {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.angle);
      ctx.fillStyle = petal.color;
      ctx.globalAlpha = petal.alpha * 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size * 1.5, petal.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    ctx.save();
    for (const d of this.damageTexts) {
      ctx.globalAlpha = Math.max(0, d.life);
      ctx.font = d.isCrit ? 'bold 20px Cinzel, serif' : 'bold 15px Outfit, sans-serif';
      ctx.fillStyle = d.isPlayer ? '#ff4757' : (d.isCrit ? '#ffd700' : '#ffffff');
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.fillText(d.text, d.x, d.y);
    }
    ctx.restore();
  }
}

/* =========================================================================
   3. SPRITE RENDERER (Characters, Bosses, Gaja Form, Telegraphed Attacks)
   ========================================================================= */
class SpriteRenderer {
  constructor() {
    this.sprites = {};
    this.loaded = false;
    this.loadSprites();
  }

  loadSprites() {
    const list = {
      player: 'assets/player_guardian.png',
      enemyMelee: 'assets/vighna_melee.png',
      enemyFast: 'assets/vighna_fast.png',
      enemyRanged: 'assets/vighna_ranged.png',
      enemyArmored: 'assets/vighna_armored.png',
      enemyElite: 'assets/vighna_elite.png',
      bossGateBreaker: 'assets/boss_gate_breaker.png',
      bossStormVighna: 'assets/boss_storm_vighna.png',
      bossVighnaLord: 'assets/boss_vighna_lord.png',
      gajaAvatar: 'assets/divine_gaja.png'
    };

    let count = 0;
    const total = Object.keys(list).length;

    for (const [key, src] of Object.entries(list)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.sprites[key] = img;
        count++;
        if (count >= total) this.loaded = true;
      };
      img.onerror = () => {
        console.warn(`Could not load sprite: ${src}`);
      };
    }
  }

  drawGuardian(ctx, p, time) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Invulnerability Blink Feedback
    if (p.iFrames > 0 && Math.floor(p.iFrames / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Dashing Ghost Trail (Vayu Dash)
    if (p.isDashing) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.ellipse(-p.vx * 2.2, -p.vy * 2.2, 30, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Translucent after-image silhouette if sprite is ready
      const pImg = this.sprites.player;
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        ctx.globalAlpha = 0.25;
        const facingLeft = Math.cos(p.facingAngle) < 0;
        ctx.save();
        ctx.translate(-p.vx * 2.0, -p.vy * 2.0);
        if (facingLeft) ctx.scale(-1, 1);
        ctx.drawImage(pImg, -55, -135, 110, 145);
        ctx.restore();
      }
      ctx.restore();
    }

    // Ground Shadow & Subtle Golden Lotus Aura
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
    ctx.beginPath();
    ctx.ellipse(0, 14, p.isGaja ? 44 : 26, p.isGaja ? 20 : 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Golden Floor Ring
    ctx.strokeStyle = p.bladeActive ? 'rgba(255, 215, 0, 0.65)' : 'rgba(245, 176, 65, 0.35)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 14, p.isGaja ? 50 : 32, p.isGaja ? 24 : 15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Gaja Form Override
    if (p.isGaja) {
      this.drawGajaTitan(ctx, p, time);
      ctx.restore();
      return;
    }

    // Defeat Pose (Guardian slowly sinks with golden dissolution)
    if (p.isDefeated) {
      ctx.translate(0, 10);
      ctx.globalAlpha = Math.max(0.2, 1.0 - (p.defeatTimer || 0) * 0.02);
      ctx.rotate(0.18);
    }

    // 2.5D Directional Facing (flip horizontally without distorting upright warrior stature)
    const facingLeft = Math.cos(p.facingAngle) < 0;
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    // Procedural Movement, Breathing & Stride Animation
    const isMoving = Math.hypot(p.vx, p.vy) > 0.2;
    const runBob = isMoving ? Math.sin(time * 15) * 4.5 : 0;
    const breath = Math.sin(time * 3.5);
    const breatheScaleX = isMoving ? 1.0 : (1.0 + breath * 0.015);
    const breatheScaleY = isMoving ? 1.0 : (1.0 - breath * 0.02);
    const runTilt = isMoving ? (p.vx * (facingLeft ? -0.025 : 0.025)) : 0;

    ctx.translate(0, runBob);
    ctx.rotate(runTilt);
    ctx.scale(breatheScaleX, breatheScaleY);

    // Forward Attack Step Lunge
    const lungeDist = (p.attackAnim || 0) * 14;
    ctx.translate(lungeDist * (facingLeft ? -1 : 1), -Math.abs(lungeDist * 0.2));

    // Hit Vibration Shudder
    if (p.iFrames > 0) {
      ctx.translate(Math.sin(time * 60) * 2.5, 0);
    }

    // Render High-Definition Temple Guardian Sprite
    const pSprite = this.sprites.player;
    if (pSprite && pSprite.complete && pSprite.naturalWidth > 0) {
      const sw = 115;
      const sh = 150;
      const sx = -sw / 2;
      const sy = -sh + 16;

      ctx.save();
      // Divine Blade Golden Solar Radiance
      if (p.bladeActive) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 24;
      }
      ctx.drawImage(pSprite, sx, sy, sw, sh);
      ctx.restore();

      // Dynamic Blade Energy Trail & Crescent Slash Arc
      const attackSwing = p.attackAnim || 0;
      const weaponGlow = p.bladeActive ? '#ffd700' : '#f5b041';

      if (attackSwing > 0.1) {
        ctx.save();
        ctx.strokeStyle = weaponGlow;
        ctx.shadowColor = weaponGlow;
        ctx.shadowBlur = p.bladeActive ? 26 : 14;
        ctx.lineWidth = p.isHeavyAttacking ? 7 : 4;
        ctx.beginPath();
        // Dynamic crescent slash arc sweep across front of guardian
        ctx.arc(15, -45, p.isHeavyAttacking ? 62 : 48, -Math.PI * 0.65, Math.PI * 0.35);
        ctx.stroke();

        // Extra solar flash core during heavy attack
        if (p.isHeavyAttacking) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(15, -45, 50, -Math.PI * 0.5, Math.PI * 0.2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Divine Blade Sacred Aura Aura Flames
      if (p.bladeActive) {
        ctx.save();
        const flare = Math.sin(time * 12) * 4;
        const auraGrad = ctx.createRadialGradient(10, -50, 10, 10, -50, 45 + flare);
        auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
        auraGrad.addColorStop(0.5, 'rgba(243, 156, 18, 0.20)');
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(10, -50, 45 + flare, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      // Graceful procedural fallback while asset finishes loading
      this.drawProceduralGuardian(ctx, p, time, runBob, breath, lungeDist);
    }

    ctx.restore();
  }

  drawProceduralGuardian(ctx, p, time, runCycle, breath, lungeDist) {
    ctx.scale(2.35, 2.35);
    ctx.rotate(p.facingAngle + Math.PI / 2);
    ctx.translate(0, -lungeDist);

    ctx.fillStyle = '#b7791f';
    ctx.fillRect(-9, 6 + runCycle, 6, 15);
    ctx.fillRect(3, 6 - runCycle, 6, 15);

    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-9, 17 + runCycle, 6, 4);
    ctx.fillRect(3, 17 - runCycle, 6, 4);

    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.ellipse(0, 2, 13, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    const armorGrad = ctx.createLinearGradient(-12, -10, 12, 10);
    armorGrad.addColorStop(0, '#f5b041');
    armorGrad.addColorStop(0.4, '#ffd700');
    armorGrad.addColorStop(1, '#b7791f');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-10, -10, 20, 20, [4, 4, 7, 7]);
    else ctx.rect(-10, -10, 20, 20);
    ctx.fill();

    ctx.fillStyle = '#f3a683';
    ctx.beginPath();
    ctx.arc(0, -15, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-7, -19); ctx.lineTo(0, -26); ctx.lineTo(7, -19); ctx.closePath();
    ctx.fill();
  }

  drawGajaTitan(ctx, p, time) {
    const gImg = this.sprites.gajaAvatar;
    const pulse = Math.sin(time * 5) * 8;

    // Colossal Solar Mandala Aura on Ground
    ctx.save();
    ctx.scale(1, 0.45);
    const auraGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 95 + pulse);
    auraGlow.addColorStop(0, 'rgba(255, 215, 0, 0.65)');
    auraGlow.addColorStop(0.5, 'rgba(243, 156, 18, 0.35)');
    auraGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 95 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Rotating Mandala Lotus Pattern
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + time * 0.5;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * 65, Math.sin(ang) * 65, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    const facingLeft = Math.cos(p.facingAngle) < 0;
    if (facingLeft) ctx.scale(-1, 1);

    if (gImg && gImg.complete && gImg.naturalWidth > 0) {
      const gw = 175;
      const gh = 185;
      ctx.save();
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 32;
      ctx.drawImage(gImg, -gw / 2, -gh + 24, gw, gh);
      ctx.restore();

      // Dynamic Gada Mace Attack Swing
      const attackSwing = p.attackAnim || 0;
      if (attackSwing > 0.1) {
        ctx.save();
        ctx.strokeStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(30, -60, 75, -Math.PI * 0.7, Math.PI * 0.4);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Fallback
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, -40, 35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawEnemy(ctx, e, time) {
    ctx.save();
    ctx.translate(e.x, e.y);

    // Ground Void Shadow & Demonic Floor Runes
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
    ctx.beginPath();
    ctx.ellipse(0, 10, e.radius * 0.9, e.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(192, 57, 43, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, 10, e.radius * 1.15, e.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2.5D Directional Facing
    const facingLeft = Math.cos(e.angle) < 0;
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    // Procedural Stride / Hover Bob
    const gait = e.type === 'ranged'
      ? Math.sin(time * 5 + (e.x + e.y) * 0.05) * 5.5
      : Math.sin(time * 12 + (e.x + e.y) * 0.05) * 3.2;
    ctx.translate(0, gait);

    // Attack Windup Cue (Crimson warning aura & pull back)
    if (e.isWindingUp) {
      ctx.translate(facingLeft ? 7 : -7, 2);
      ctx.shadowColor = '#e74c3c';
      ctx.shadowBlur = 20;

      // Pulsing floor hazard cue
      ctx.save();
      ctx.strokeStyle = 'rgba(231, 76, 60, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 10, e.radius * 1.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Forward Attack Lunge Snap
    if (e.attackLunge > 0) {
      ctx.translate((facingLeft ? -1 : 1) * e.attackLunge * 0.9, 0);
    }

    // Hit Flash Reaction
    if (e.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -e.radius * 0.6, e.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (e.hp < e.maxHp) this.drawEntityHealthBar(ctx, e);
      return;
    }

    // Select High-Definition Sprite based on Enemy Type
    let spr = null;
    let sw = 100, sh = 120;
    let offsetY = 14;

    switch (e.type) {
      case 'fast':
        spr = this.sprites.enemyFast;
        sw = 95; sh = 95;
        offsetY = 10;
        break;
      case 'ranged':
        spr = this.sprites.enemyRanged;
        sw = 105; sh = 125;
        offsetY = 16;
        break;
      case 'armored':
        spr = this.sprites.enemyArmored;
        sw = 135; sh = 140;
        offsetY = 18;
        break;
      case 'elite':
        spr = this.sprites.enemyElite;
        sw = 130; sh = 135;
        offsetY = 16;
        break;
      case 'melee':
      default:
        spr = this.sprites.enemyMelee;
        sw = 110; sh = 125;
        offsetY = 14;
        break;
    }

    if (spr && spr.complete && spr.naturalWidth > 0) {
      ctx.drawImage(spr, -sw / 2, -sh + offsetY, sw, sh);

      // Special VFX for specific enemy archetypes
      if (e.type === 'ranged') {
        // Floating arcane orb glow
        ctx.save();
        const orbGlow = ctx.createRadialGradient(0, -sh * 0.55, 3, 0, -sh * 0.55, 20);
        orbGlow.addColorStop(0, 'rgba(155, 89, 182, 0.9)');
        orbGlow.addColorStop(0.6, 'rgba(142, 68, 173, 0.4)');
        orbGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGlow;
        ctx.beginPath();
        ctx.arc(0, -sh * 0.55, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (e.type === 'elite') {
        // Flickering void flame sword trails
        ctx.save();
        ctx.strokeStyle = 'rgba(231, 76, 60, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw * 0.28, -sh * 0.45, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Procedural fallback
      this.drawProceduralEnemy(ctx, e, time);
    }

    ctx.restore();

    if (e.hp < e.maxHp) {
      this.drawEntityHealthBar(ctx, e);
    }
  }

  drawProceduralEnemy(ctx, e, time) {
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.ellipse(0, -e.radius * 0.7, e.radius * 0.8, e.radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff3838';
    ctx.beginPath();
    ctx.arc(3, -e.radius * 0.9, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBoss(ctx, b, time) {
    // Telegraphed Attack Indicator (High-Contrast Red Hazard Zone)
    if (b.telegraphTimer > 0) {
      ctx.save();
      const pulse = Math.sin(time * 12) * 0.15;
      ctx.fillStyle = `rgba(231, 76, 60, ${0.28 + pulse})`;
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(b.telegraphX || b.x, b.telegraphY || b.y, b.telegraphRadius || 135, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Countdown Warning Sweep
      const sweepProgress = 1.0 - (b.telegraphTimer / (b.telegraphDuration || 1.2));
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(b.telegraphX || b.x, b.telegraphY || b.y, (b.telegraphRadius || 135) * sweepProgress, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(b.x, b.y);

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    ctx.beginPath();
    ctx.ellipse(0, 18, b.radius * 0.95, b.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark Demonic Void Circle
    ctx.strokeStyle = 'rgba(192, 57, 43, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 18, b.radius * 1.25, b.radius * 0.58, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2.5D Directional Facing
    const facingLeft = Math.cos(b.angle) < 0;
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    if (b.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -b.radius * 0.7, b.radius * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Select High-Definition Boss Sprite
    let bSpr = null;
    let bw = 180, bh = 180;
    let bOffsetY = 20;

    if (b.name === 'THE VIGHNA LORD') {
      bSpr = this.sprites.bossVighnaLord;
      bw = 230; bh = 230;
      bOffsetY = 24;
    } else if (b.name === 'GATE BREAKER') {
      bSpr = this.sprites.bossGateBreaker;
      bw = 195; bh = 195;
      bOffsetY = 20;
    } else if (b.name === 'STORM VIGHNA') {
      bSpr = this.sprites.bossStormVighna;
      bw = 205; bh = 205;
      bOffsetY = 20;
    } else if (b.name === 'GUARDIAN DESTROYER') {
      bSpr = this.sprites.bossGateBreaker;
      bw = 200; bh = 200;
      bOffsetY = 20;
    } else { // Vighna Commander
      bSpr = this.sprites.enemyElite;
      bw = 185; bh = 190;
      bOffsetY = 20;
    }

    if (bSpr && bSpr.complete && bSpr.naturalWidth > 0) {
      ctx.save();
      // Boss Aura Glow
      if (b.name === 'THE VIGHNA LORD') {
        const lordPulse = Math.sin(time * 4) * 8;
        ctx.shadowColor = '#9b59b6';
        ctx.shadowBlur = 35 + lordPulse;
      } else if (b.name === 'STORM VIGHNA') {
        ctx.shadowColor = '#3498db';
        ctx.shadowBlur = 28;
      } else {
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 24;
      }

      ctx.drawImage(bSpr, -bw / 2, -bh + bOffsetY, bw, bh);
      ctx.restore();

      // Atmospheric Boss VFX (Lightning for Storm Vighna, Cosmic Void for Vighna Lord)
      if (b.name === 'STORM VIGHNA') {
        ctx.save();
        ctx.strokeStyle = '#00d2d3';
        ctx.lineWidth = 2.5;
        const sparkAng = time * 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sparkAng) * 40, -bh * 0.6 + Math.sin(sparkAng) * 40);
        ctx.lineTo(Math.cos(sparkAng + 1) * 75, -bh * 0.6 + Math.sin(sparkAng + 1) * 60);
        ctx.stroke();
        ctx.restore();
      } else if (b.name === 'THE VIGHNA LORD') {
        ctx.save();
        const pulseRing = Math.sin(time * 3) * 12;
        ctx.strokeStyle = 'rgba(155, 89, 182, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -bh * 0.55, 75 + pulseRing, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Procedural Fallback
      if (b.name === 'THE VIGHNA LORD') {
        this.drawVighnaLord(ctx, b, time);
      } else {
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(0, -b.radius * 0.7, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawVighnaLord(ctx, b, time) {
    const pulse = Math.sin(time * 5) * 5;
    const aura = ctx.createRadialGradient(0, 0, 18, 0, 0, 90 + pulse);
    aura.addColorStop(0, 'rgba(142, 68, 173, 0.8)');
    aura.addColorStop(0.5, 'rgba(192, 57, 43, 0.45)');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 90 + pulse, 0, Math.PI * 2);
    ctx.fill();

    const armAngles = [-1.8, -1.2, -0.6, 0.6, 1.2, 1.8];
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 5;
    armAngles.forEach((ang, i) => {
      const armWave = Math.sin(time * 6 + i) * 9;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const ex = Math.cos(ang) * (58 + armWave);
      const ey = Math.sin(ang) * (58 + armWave);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.fill();
    });

    ctx.fillStyle = '#0a0910';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = b.phase === 3 ? '#ff3838' : '#a29bfe';
    ctx.beginPath();
    ctx.ellipse(0, -6, 9, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEntityHealthBar(ctx, e) {
    ctx.save();
    const barW = 54;
    const barH = 6;
    const pct = Math.max(0, e.hp / e.maxHp);
    const barY = e.y - e.radius - 24;

    ctx.fillStyle = 'rgba(10, 12, 18, 0.88)';
    ctx.fillRect(e.x - barW / 2 - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = '#ff3838';
    ctx.fillRect(e.x - barW / 2, barY, barW * pct, barH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(e.x - barW / 2, barY, barW, barH);
    ctx.restore();
  }

  drawSacredWard(ctx, wardX, wardY, radius, integrityPct, time) {
    ctx.save();
    ctx.translate(wardX, wardY);

    const wardAlpha = 0.45 + (integrityPct / 100) * 0.45;

    // Floor Perspective Projection (isometric courtyard ellipse)
    ctx.save();
    ctx.scale(1, 0.46);

    // Subtle Ground Glow
    const groundGrad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.25);
    groundGrad.addColorStop(0, `rgba(255, 215, 0, ${0.12 * wardAlpha})`);
    groundGrad.addColorStop(0.6, `rgba(245, 176, 65, ${0.08 * wardAlpha})`);
    groundGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // Outer Golden Ring with notches (matching reference prototype)
    ctx.strokeStyle = `rgba(255, 215, 0, ${wardAlpha * 0.85})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(245, 176, 65, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary Saffron Yantra Ring
    ctx.strokeStyle = `rgba(230, 126, 34, ${wardAlpha * 0.75})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // Sacred Lotus Petals on Floor (Golden geometry)
    const petals = 12;
    ctx.strokeStyle = `rgba(255, 215, 0, ${wardAlpha * 0.6})`;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < petals; i++) {
      const ang = (i / petals) * Math.PI * 2 + time * 0.08;
      const px = Math.cos(ang) * (radius * 0.88);
      const py = Math.sin(ang) * (radius * 0.88);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Inner Sacred Lotus Bloom
    ctx.strokeStyle = `rgba(255, 235, 150, ${wardAlpha * 0.8})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore(); // Restore perspective scale

    // Overhead Floating Golden Title "SACRED WARD" (matching reference prototype image)
    ctx.save();
    ctx.font = '600 13px "Cinzel", serif, Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = `rgba(255, 230, 140, ${0.75 + 0.25 * Math.sin(time * 2.5)})`;
    ctx.shadowColor = 'rgba(245, 176, 65, 0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText('SACRED WARD', 0, -radius * 0.52);

    // Integrity indicator text when damaged
    if (integrityPct < 100) {
      ctx.font = '500 10px "Outfit", sans-serif';
      ctx.fillStyle = integrityPct < 40 ? '#ff4757' : 'rgba(255, 215, 0, 0.85)';
      ctx.fillText(`${Math.round(integrityPct)}%`, 0, -radius * 0.52 + 13);
    }
    ctx.restore();

    ctx.restore();
  }

  drawDiya(ctx, x, y, time) {
    ctx.save();
    ctx.translate(x, y);

    // Brass Oil Lamp
    ctx.fillStyle = '#b7791f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Flickering Sacred Flame
    const flicker = Math.sin(time * 16 + x) * 2;
    const flameGrad = ctx.createRadialGradient(0, -6 + flicker, 1, 0, -6 + flicker, 14);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#ffd700');
    flameGrad.addColorStop(0.7, '#e67e22');
    flameGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(0, -6 + flicker, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* =========================================================================
   4. VIGHNA GAME CORE (State, Inputs, Mobile Touch, Waves, Bosses)
   ========================================================================= */
class VighnaGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    this.width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    this.height = typeof window !== 'undefined' ? window.innerHeight : 720;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.worldWidth = 1600;
    this.worldHeight = 900;

    // States: 'MENU', 'PLAYING', 'PAUSED', 'LEVEL_CLEAR', 'GAME_OVER', 'VICTORY'
    this.state = 'MENU';
    this.currentArea = 1;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.gameTime = 0;

    this.ward = {
      x: 800,
      y: 390,
      radius: 95,
      integrity: 100,
      maxIntegrity: 100,
      invulnTimer: 0
    };

    this.bgImages = {
      1: this.loadImg('assets/temple_gates_bg.jpg'),
      2: this.loadImg('assets/area2_courtyard.jpg'),
      3: this.loadImg('assets/area3_halls.jpg'),
      4: this.loadImg('assets/area4_corrupted.jpg'),
      5: this.loadImg('assets/area5_final_sanctum.jpg')
    };

    this.cameraModes = ['action', 'topdown', 'close', 'cinematic'];
    this.cameraModeIndex = 0;
    this.camera = {
      x: 800, y: 540,
      targetX: 800, targetY: 540,
      zoom: 1.0, targetZoom: 1.0,
      zoomImpulse: 0,
      angle: 0, targetAngle: 0
    };

    this.player = {
      x: 800, y: 620,
      vx: 0, vy: 0,
      speed: 5.5,
      radius: 36,
      hp: 120, maxHp: 120,
      energy: 100, maxEnergy: 100,
      gajaMeter: 0,
      isGaja: false, gajaTimer: 0,
      facingAngle: -Math.PI / 2,
      isMoving: false,
      isDashing: false, dashTimer: 0,
      iFrames: 0,
      attackAnim: 0, attackChain: 0,
      lastAttackTime: 0,
      bladeActive: false, bladeTimer: 0,
      isHeavyAttacking: false,
      heavyAttackTimer: 0,
      isDefeated: false,
      defeatTimer: 0
    };

    this.powers = {
      blade: { unlocked: true, cd: 12000, lastUsed: -99999, cost: 25 },
      dash: { unlocked: false, cd: 3500, lastUsed: -99999, cost: 15 },
      lightning: { unlocked: false, cd: 9000, lastUsed: -99999, cost: 40 },
      fire: { unlocked: false, cd: 7000, lastUsed: -99999, cost: 35 },
      gaja: { unlocked: false, cd: 25000, lastUsed: -99999, cost: 0 }
    };

    this.enemies = [];
    this.projectiles = [];
    this.boss = null;

    // 5-Wave Structure: Wave 1, Wave 2, Wave 3, Elite Wave, Boss
    this.waveNumber = 1;
    this.maxNormalWaves = 3;
    this.isEliteWave = false;
    this.isBossWave = false;

    this.keys = {};
    this.mouse = { x: this.width / 2, y: this.height / 2, isDown: false, rightDown: false };
    this.touchMoveVector = { x: 0, y: 0 };
    this.joystickTouchId = null;

    this.diyas = [
      { x: 620, y: 390 }, { x: 980, y: 390 },
      { x: 540, y: 440 }, { x: 1060, y: 440 },
      { x: 260, y: 520 }, { x: 1340, y: 520 },
      { x: 280, y: 780 }, { x: 1320, y: 780 },
      { x: 660, y: 840 }, { x: 940, y: 840 }
    ];

    window.soundEngine = new SoundEngine();
    window.particleSystem = new ParticleSystem();
    window.spriteRenderer = new SpriteRenderer();

    this.setupInputs();
    this.setupMobileTouchControls();
    this.setupUIButtons();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  loadImg(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  resizeCanvas() {
    this.dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    this.width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    this.height = typeof window !== 'undefined' ? window.innerHeight : 720;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      this.keys[code] = true;

      if (code === 'KeyC') this.cycleCamera();
      if (code === 'Escape') this.togglePause();
      if (code === 'KeyJ') this.handleLightAttack();
      if (code === 'KeyK') this.handleHeavyAttack();
      if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') this.handleDodge();

      if (code === 'Digit1') this.useAbility('blade');
      if (code === 'Digit2') this.useAbility('dash');
      if (code === 'Digit3') this.useAbility('lightning');
      if (code === 'Digit4') this.useAbility('fire');
      if (code === 'KeyG') this.useAbility('gaja');
      if (code === 'KeyM') this.toggleSound();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (window.soundEngine) window.soundEngine.ensureContext();
      if (e.button === 0) {
        this.mouse.isDown = true;
        this.handleLightAttack();
      } else if (e.button === 2) {
        this.mouse.rightDown = true;
        this.handleHeavyAttack();
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.isDown = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  setupMobileTouchControls() {
    const mobileLayer = document.getElementById('mobileControls');
    const isTouchOnly = typeof window !== 'undefined' &&
      ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1)) &&
      window.matchMedia && window.matchMedia('(max-width: 900px) and (hover: none)').matches;

    if (!isTouchOnly) {
      if (mobileLayer) mobileLayer.style.display = 'none';
      return;
    }

    const joyBase = document.getElementById('touchJoystickBase');
    const joyKnob = document.getElementById('touchJoystickKnob');
    if (!joyBase || !joyKnob) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      if (window.soundEngine) window.soundEngine.ensureContext();
      const touch = e.changedTouches[0];
      this.joystickTouchId = touch.identifier;
      updateJoystick(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          updateJoystick(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.touchMoveVector = { x: 0, y: 0 };
          joyKnob.style.transform = `translate(0px, 0px)`;
          break;
        }
      }
    };

    const updateJoystick = (clientX, clientY) => {
      const rect = joyBase.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = rect.width / 2 - 10;

      if (dist === 0) {
        this.touchMoveVector = { x: 0, y: 0 };
        joyKnob.style.transform = `translate(0px, 0px)`;
        return;
      }

      const clampedDist = Math.min(dist, maxRadius);
      const nx = (dx / dist) * clampedDist;
      const ny = (dy / dist) * clampedDist;

      joyKnob.style.transform = `translate(${nx}px, ${ny}px)`;
      this.touchMoveVector = { x: dx / dist, y: dy / dist };
      this.player.facingAngle = Math.atan2(dy, dx);
    };

    joyBase.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Mobile Action buttons
    const bindTouch = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (window.soundEngine) window.soundEngine.ensureContext();
        fn();
      }, { passive: false });
    };

    bindTouch('touchBtnLight', () => this.handleLightAttack());
    bindTouch('touchBtnHeavy', () => this.handleHeavyAttack());
    bindTouch('touchBtnDodge', () => this.handleDodge());
    bindTouch('touchBtnBlade', () => this.useAbility('blade'));
    bindTouch('touchBtnDash', () => this.useAbility('dash'));
    bindTouch('touchBtnLightning', () => this.useAbility('lightning'));
    bindTouch('touchBtnFire', () => this.useAbility('fire'));
    bindTouch('touchBtnGaja', () => this.useAbility('gaja'));
  }

  setupUIButtons() {
    document.getElementById('btnPlayGame')?.addEventListener('click', () => this.startGameplay());
    document.getElementById('btnHowToPlay')?.addEventListener('click', () => this.showModal('howToPlayModal'));
    document.getElementById('btnCloseHowTo')?.addEventListener('click', () => this.hideModal('howToPlayModal'));

    document.getElementById('pauseToggleBtn')?.addEventListener('click', () => this.togglePause());
    document.getElementById('btnResume')?.addEventListener('click', () => this.togglePause());
    document.getElementById('btnRestartLevel')?.addEventListener('click', () => this.restartCurrentArea());
    document.getElementById('btnPauseSound')?.addEventListener('click', () => this.toggleSound());
    document.getElementById('btnQuitToMenu')?.addEventListener('click', () => this.quitToTitle());

    document.getElementById('camToggleBtn')?.addEventListener('click', () => this.cycleCamera());
    document.getElementById('soundToggleBtn')?.addEventListener('click', () => this.toggleSound());

    document.getElementById('btnNextLevel')?.addEventListener('click', () => this.nextArea());
    document.getElementById('btnRetryLevel')?.addEventListener('click', () => this.restartCurrentArea());
    document.getElementById('btnDefeatMenu')?.addEventListener('click', () => this.quitToTitle());
    document.getElementById('btnGrandRestart')?.addEventListener('click', () => this.quitToTitle());

    document.getElementById('slotBlade')?.addEventListener('click', () => this.useAbility('blade'));
    document.getElementById('slotDash')?.addEventListener('click', () => this.useAbility('dash'));
    document.getElementById('slotLightning')?.addEventListener('click', () => this.useAbility('lightning'));
    document.getElementById('slotFire')?.addEventListener('click', () => this.useAbility('fire'));
    document.getElementById('slotGaja')?.addEventListener('click', () => this.useAbility('gaja'));

    document.getElementById('btnDodge')?.addEventListener('click', () => this.handleDodge());
    document.getElementById('btnHeavy')?.addEventListener('click', () => this.handleHeavyAttack());
    document.getElementById('btnLight')?.addEventListener('click', () => this.handleLightAttack());
  }

  showModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
  hideModal(id) { document.getElementById(id)?.classList.add('hidden'); }

  toggleSound() {
    if (!window.soundEngine) return;
    const enabled = window.soundEngine.toggleSound();
    const icon = document.getElementById('soundIcon');
    if (icon) icon.textContent = enabled ? '🔊' : '🔇';
  }

  cycleCamera() {
    this.cameraModeIndex = (this.cameraModeIndex + 1) % this.cameraModes.length;
    const mode = this.cameraModes[this.cameraModeIndex];
    const lbl = document.getElementById('camLabelText');
    if (lbl) lbl.textContent = `CAM: ${mode.toUpperCase()}`;

    const container = document.getElementById('gameContainer');
    if (mode === 'cinematic') container.classList.add('cinematic-active');
    else container.classList.remove('cinematic-active');

    this.announceCombat(`CAMERA: ${mode.toUpperCase()}`);
    if (window.soundEngine) window.soundEngine.playUiClick();
  }

  /* =========================================================================
     AREAS & 5-WAVE SYSTEM (Wave 1, 2, 3, Elite Wave, Boss)
     ========================================================================= */
  startGameplay() {
    document.getElementById('mainMenu')?.classList.add('hidden');
    document.getElementById('hudOverlay')?.classList.remove('hidden');
    this.state = 'PLAYING';
    this.startArea(this.currentArea);
  }

  startArea(area) {
    this.currentArea = area;
    this.waveNumber = 1;
    this.isEliteWave = false;
    this.isBossWave = false;
    this.enemies = [];
    this.projectiles = [];
    this.boss = null;
    this.ward.integrity = 100;
    this.ward.invulnTimer = 0;

    // Reset player position & state cleanly
    this.player.x = 800;
    this.player.y = 620;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hp = this.player.maxHp;
    this.player.energy = this.player.maxEnergy;
    this.player.isDefeated = false;
    this.player.defeatTimer = 0;
    this.player.iFrames = 0;
    this.updatePlayerHUD();

    const templeFill = document.getElementById('templeFill');
    const templePercent = document.getElementById('templePercentText');
    if (templeFill) templeFill.style.width = '100%';
    if (templePercent) templePercent.textContent = '100%';

    const titles = {
      1: 'TEMPLE GATES',
      2: 'SACRED COURTYARD',
      3: 'ANCIENT TEMPLE HALLS',
      4: 'SANCTUM OF VIGHNAS',
      5: 'FINAL SANCTUM'
    };

    document.getElementById('areaChapterText').textContent = `AREA 0${area} / 05`;
    document.getElementById('areaNameText').textContent = titles[area];

    // Ability unlocks by area
    if (area >= 2) this.unlockPower('dash', 'slotDash', 'cdDashText', 'READY');
    if (area >= 3) {
      this.unlockPower('lightning', 'slotLightning', 'cdLightningText', 'READY');
      this.unlockPower('fire', 'slotFire', 'cdFireText', 'READY');
    }
    if (area >= 4) {
      this.unlockPower('gaja', 'slotGaja', 'cdGajaText', 'READY');
    }

    this.startWave(1);

    if (window.soundEngine) {
      window.soundEngine.startBattleMusic(false);
      window.soundEngine.playTempleBell(440, 3.0, 0.35);
    }
    this.announceCombat(`DEFEND THE ${titles[area]}!`);
  }

  unlockPower(key, slotId, textId, text) {
    this.powers[key].unlocked = true;
    const card = document.getElementById(slotId);
    if (card) card.classList.remove('locked');
    const txt = document.getElementById(textId);
    if (txt) txt.textContent = text;
  }

  startWave(wave) {
    this.waveNumber = wave;
    const assaultText = document.getElementById('assaultCounterText');

    if (wave <= 3) {
      // Normal Waves 1, 2, 3
      this.isEliteWave = false;
      this.isBossWave = false;

      let count = 4;
      let interval = 850;
      if (this.currentArea === 1) {
        count = wave === 1 ? 2 : (wave === 2 ? 3 : 4);
        interval = wave === 1 ? 1600 : (wave === 2 ? 1400 : 1200);
      } else {
        count = 3 + (this.currentArea * 2) + (wave * 2);
        interval = Math.max(500, 850 - this.currentArea * 60);
      }

      if (assaultText) assaultText.textContent = `WAVE ${wave}/4 • ${count} FOES`;
      this.announceCombat(`WAVE ${wave} ADVANCING!`);

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (this.state === 'PLAYING') this.spawnEnemy(false);
        }, i * interval);
      }
    } else if (wave === 4) {
      // Elite Wave
      this.isEliteWave = true;
      this.isBossWave = false;
      const count = this.currentArea === 1 ? 2 : (2 + this.currentArea);
      if (assaultText) assaultText.textContent = `ELITE WAVE • ${count} CHAMPIONS`;
      this.announceCombat(`ELITE WAVE APPROACHING!`);
      window.particleSystem.addShake(0.6);

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (this.state === 'PLAYING') this.spawnEnemy(true);
        }, i * 1100);
      }
    } else {
      // Boss Encounter
      this.isEliteWave = false;
      this.isBossWave = true;
      if (assaultText) assaultText.textContent = `CRITICAL ASSAULT: BOSS ENGAGED`;
      this.spawnBoss();
    }
  }

  spawnEnemy(forceElite = false) {
    let chosenType = 'melee';

    if (forceElite) {
      chosenType = Math.random() > 0.4 ? 'elite' : 'armored';
    } else {
      const types = ['melee', 'fast'];
      if (this.currentArea >= 2) types.push('ranged');
      if (this.currentArea >= 3) types.push('armored');
      if (this.currentArea >= 4) types.push('elite');
      chosenType = types[Math.floor(Math.random() * types.length)];
    }

    // Believable spawn points around courtyard perimeter
    const spawnPoints = [
      { x: 700 + Math.random() * 200, y: 370 }, // Temple stairs
      { x: 220, y: 480 + Math.random() * 240 }, // Left colonnade
      { x: 1380, y: 480 + Math.random() * 240 }, // Right colonnade
      { x: 650 + Math.random() * 300, y: 840 }  // Foreground entrance
    ];
    const pt = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    const x = pt.x;
    const y = pt.y;

    const areaFactor = 1 + (this.currentArea - 1) * 0.35;
    let hp = Math.round(30 * areaFactor);
    let speed = this.currentArea === 1 ? 1.15 : 1.45;
    let radius = 38;
    let attackPower = this.currentArea === 1 ? 2 : Math.round(3 * areaFactor);

    if (chosenType === 'fast') {
      hp = Math.round(20 * areaFactor);
      speed = this.currentArea === 1 ? 1.5 : 2.2;
      radius = 32;
      attackPower = this.currentArea === 1 ? 2 : Math.round(2 * areaFactor);
    } else if (chosenType === 'ranged') {
      hp = Math.round(32 * areaFactor);
      speed = 1.3;
      radius = 36;
      attackPower = Math.round(4 * areaFactor);
    } else if (chosenType === 'armored') {
      hp = Math.round(75 * areaFactor);
      speed = 1.0;
      radius = 45;
      attackPower = Math.round(6 * areaFactor);
    } else if (chosenType === 'elite') {
      hp = Math.round(100 * areaFactor);
      speed = 1.6;
      radius = 50;
      attackPower = Math.round(8 * areaFactor);
    }

    // Introductory Area 1: Wave 1 targets player, later waves mostly target player
    let targetObjective = 'player';
    if (this.currentArea === 1) {
      targetObjective = this.waveNumber === 1 ? 'player' : (Math.random() > 0.65 ? 'ward' : 'player');
    } else {
      targetObjective = Math.random() > 0.45 ? 'ward' : 'player';
    }

    this.enemies.push({
      type: chosenType,
      x, y,
      vx: 0, vy: 0,
      radius, speed, hp, maxHp: hp,
      attackPower,
      angle: 0,
      hitFlash: 0,
      isWindingUp: false,
      windupTimer: 0,
      attackLunge: 0,
      attackCooldown: 50 + Math.random() * 40,
      targetObjective
    });
  }

  spawnBoss() {
    const bossConfigs = {
      1: { name: 'GATE BREAKER', sub: 'DEMONIC BATTERING CHAMPION', hp: 650, radius: 65, speed: 1.5, power: 12 },
      2: { name: 'STORM VIGHNA', sub: 'CELESTIAL TEMPEST FIEND', hp: 1100, radius: 65, speed: 2.1, power: 18 },
      3: { name: 'GUARDIAN DESTROYER', sub: 'FALLEN FOUR-ARMED SENTINEL', hp: 1600, radius: 72, speed: 1.8, power: 24 },
      4: { name: 'VIGHNA COMMANDER', sub: 'DARK VOID WARLORD', hp: 2100, radius: 70, speed: 2.3, power: 28 },
      5: { name: 'THE VIGHNA LORD', sub: 'SUPREME CORRUPTED DEITY', hp: 3500, radius: 85, speed: 2.0, power: 35 }
    };

    const config = bossConfigs[this.currentArea];
    this.boss = {
      name: config.name,
      subtitle: config.sub,
      x: 800,
      y: 380,
      vx: 0, vy: 0,
      radius: config.radius,
      speed: config.speed,
      hp: config.hp,
      maxHp: config.hp,
      attackPower: config.power,
      phase: 1,
      angle: 0,
      hitFlash: 0,
      attackCooldown: 70,
      specialTimer: 180,
      telegraphTimer: 0,
      telegraphX: 0,
      telegraphY: 0,
      telegraphRadius: 130
    };

    const bossHud = document.getElementById('bossHud');
    if (bossHud) bossHud.classList.remove('hidden');
    document.getElementById('bossNameText').textContent = config.name;
    document.getElementById('bossSubtitleText').textContent = config.sub;
    document.getElementById('bossPhaseBadge').textContent = 'PHASE 1';
    this.updateBossHpBar();

    this.announceCombat(`WARNING: ${config.name} EMERGES!`);
    window.particleSystem.addShake(0.8);
    if (window.soundEngine) {
      window.soundEngine.startBattleMusic(true);
      window.soundEngine.playGajaRoar();
    }
  }

  /* =========================================================================
     COMBAT ACTIONS, COMBOS & DIVINE ABILITIES
     ========================================================================= */
  handleLightAttack() {
    if (this.state !== 'PLAYING') return;
    const now = performance.now();

    if (now - this.player.lastAttackTime < 750) {
      this.player.attackChain = (this.player.attackChain + 1) % 4;
    } else {
      this.player.attackChain = 0;
    }
    this.player.lastAttackTime = now;
    this.player.attackAnim = 1.0;

    const chain = this.player.attackChain;
    // Step-in forward lunge
    const lungeSpd = chain === 3 ? 6.5 : 4.0;
    this.player.vx += Math.cos(this.player.facingAngle) * lungeSpd;
    this.player.vy += Math.sin(this.player.facingAngle) * lungeSpd;

    const baseDamage = [35, 45, 55, 80][chain];
    const dmg = (this.player.bladeActive ? baseDamage * 2 : baseDamage) * (this.player.isGaja ? 2.5 : 1);
    const reach = this.player.isGaja ? 140 : (this.player.bladeActive ? 95 : 80);

    if (window.soundEngine) window.soundEngine.playSwordLight();
    window.particleSystem.emitSlashArc(
      this.player.x + Math.cos(this.player.facingAngle) * 30,
      this.player.y + Math.sin(this.player.facingAngle) * 30,
      this.player.facingAngle,
      reach,
      this.player.isGaja ? '#ffd700' : (this.player.bladeActive ? '#f1c40f' : '#ffffff'),
      chain === 3
    );

    this.camera.zoomImpulse = chain === 3 ? 0.05 : 0.02;

    if (this.player.bladeActive && chain === 3) {
      this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(this.player.facingAngle) * 12,
        vy: Math.sin(this.player.facingAngle) * 12,
        radius: 32,
        damage: 95,
        life: 45,
        isPlayer: true,
        color: '#ffd700'
      });
    }

    this.checkMeleeHits(reach, dmg, chain === 3);
  }

  handleHeavyAttack() {
    if (this.state !== 'PLAYING') return;
    this.player.attackAnim = 1.4;
    this.player.isHeavyAttacking = true;
    this.player.heavyAttackTimer = 22;

    // Strong forward lunge
    this.player.vx += Math.cos(this.player.facingAngle) * 8.5;
    this.player.vy += Math.sin(this.player.facingAngle) * 8.5;

    const dmg = (this.player.bladeActive ? 160 : 110) * (this.player.isGaja ? 2.5 : 1);
    const reach = this.player.isGaja ? 180 : 115;

    if (window.soundEngine) window.soundEngine.playSwordHeavy();
    window.particleSystem.addShake(0.75);
    window.particleSystem.triggerHitStop(5);
    this.camera.zoomImpulse = 0.08;

    window.particleSystem.emitSlashArc(
      this.player.x + Math.cos(this.player.facingAngle) * 45,
      this.player.y + Math.sin(this.player.facingAngle) * 45,
      this.player.facingAngle,
      reach,
      '#e67e22',
      true
    );
    window.particleSystem.emitShockwave(this.player.x, this.player.y, reach + 25, 'rgba(230, 126, 34, 0.75)');

    this.checkMeleeHits(reach, dmg, true);
  }

  handleDodge() {
    if (this.state !== 'PLAYING' || this.player.dashTimer > 0) return;
    this.player.isDashing = true;
    this.player.dashTimer = 18;
    this.player.iFrames = 25;

    const moveAngle = Math.hypot(this.player.vx, this.player.vy) > 0.1
      ? Math.atan2(this.player.vy, this.player.vx)
      : this.player.facingAngle;

    this.player.vx = Math.cos(moveAngle) * 15;
    this.player.vy = Math.sin(moveAngle) * 15;

    if (window.soundEngine) window.soundEngine.playDash();
    window.particleSystem.emitSparks(this.player.x, this.player.y, 10, '#ffd700', 5);
  }

  checkMeleeHits(range, damage, isHeavy = false) {
    let hitCount = 0;

    for (const e of this.enemies) {
      const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      if (dist < range + e.radius) {
        const angleToEnemy = Math.atan2(e.y - this.player.y, e.x - this.player.x);
        const diff = Math.abs(this.angleDiff(angleToEnemy, this.player.facingAngle));

        if (diff < Math.PI * 0.85) {
          this.damageEnemy(e, damage, isHeavy);
          hitCount++;
          const kb = isHeavy ? 16 : 8.5;
          e.vx = Math.cos(angleToEnemy) * kb;
          e.vy = Math.sin(angleToEnemy) * kb;
        }
      }
    }

    if (this.boss) {
      const dist = Math.hypot(this.boss.x - this.player.x, this.boss.y - this.player.y);
      if (dist < range + this.boss.radius) {
        this.damageBoss(damage, isHeavy);
        hitCount++;
      }
    }

    if (hitCount > 0) {
      this.addCombo(hitCount);
      this.addGajaMeter(hitCount * 4);
      window.particleSystem.triggerHitStop(isHeavy ? 5 : 2);
      window.particleSystem.addShake(isHeavy ? 0.6 : 0.2);
    }
  }

  angleDiff(a, b) {
    return Math.atan2(Math.sin(a - b), Math.cos(a - b));
  }

  useAbility(key) {
    if (this.state !== 'PLAYING') return;
    const now = performance.now();
    const p = this.powers[key];

    if (!p.unlocked) {
      this.announceCombat('ABILITY LOCKED IN THIS SANCTUM');
      return;
    }
    if (now - p.lastUsed < p.cd) return;
    if (this.player.energy < p.cost) {
      this.announceCombat('NOT ENOUGH DIVINE ENERGY');
      return;
    }

    this.player.energy -= p.cost;
    p.lastUsed = now;

    if (key === 'blade') {
      this.player.bladeActive = true;
      this.player.bladeTimer = 12 * 60;
      window.particleSystem.emitSparks(this.player.x, this.player.y, 25, '#ffd700', 8);
      if (window.soundEngine) window.soundEngine.playTempleBell(880, 2.5, 0.4);
      this.announceCombat('DIVINE BLADE EMPOWERED!');
    } else if (key === 'dash') {
      this.handleDodge();
      window.particleSystem.emitShockwave(this.player.x, this.player.y, 140, 'rgba(46, 204, 113, 0.7)', 0.35);
      this.enemies.forEach(e => {
        if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < 130) {
          this.damageEnemy(e, 65, true);
        }
      });
      this.announceCombat('VAYU WHIRLWIND!');
    } else if (key === 'lightning') {
      if (window.soundEngine) window.soundEngine.playLightning();
      this.flashScreen('lightningFlash', 180);
      window.particleSystem.addShake(0.85);

      this.enemies.forEach(e => {
        window.particleSystem.emitLightningBolt(e.x, e.y - 450, e.x, e.y);
        this.damageEnemy(e, 110, true);
      });
      if (this.boss) {
        window.particleSystem.emitLightningBolt(this.boss.x, this.boss.y - 450, this.boss.x, this.boss.y);
        this.damageBoss(220, true);
      }
      this.announceCombat('INDRA CELESTIAL LIGHTNING!');
    } else if (key === 'fire') {
      if (window.soundEngine) window.soundEngine.playFireBurst();
      window.particleSystem.emitFireBurst(this.player.x, this.player.y, 36);
      window.particleSystem.addShake(0.75);

      this.enemies.forEach(e => {
        const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (d < 180) {
          this.damageEnemy(e, 95, true);
          const ang = Math.atan2(e.y - this.player.y, e.x - this.player.x);
          e.vx = Math.cos(ang) * 14;
          e.vy = Math.sin(ang) * 14;
        }
      });
      this.announceCombat('AGNI BURST SUPERNOVA!');
    } else if (key === 'gaja') {
      this.activateGajaForm();
    }
  }

  activateGajaForm() {
    this.player.isGaja = true;
    this.player.gajaTimer = 18 * 60;
    this.player.gajaMeter = 0;

    const modal = document.getElementById('gajaAwakenCard');
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => modal.classList.add('hidden'), 2200);
    }

    this.flashScreen('gajaTransformFlash', 450);
    window.particleSystem.addShake(1.0);
    window.particleSystem.triggerHitStop(12);

    if (window.soundEngine) {
      window.soundEngine.playGajaRoar();
      window.soundEngine.playTempleBell(440, 4.0, 0.5);
    }

    window.particleSystem.emitShockwave(this.player.x, this.player.y, 280, 'rgba(255, 215, 0, 0.9)', 0.6);
    this.announceCombat('GAJA FORM AWAKENED!');
  }

  flashScreen(id, ms) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, ms);
  }

  /* =========================================================================
     DAMAGE, BOSS PHASES, TELEGRAPHED ATTACKS & DEFENSE
     ========================================================================= */
  damageEnemy(e, dmg, isCrit = false) {
    e.hp -= dmg;
    e.hitFlash = 5;
    window.particleSystem.emitDamageText(e.x, e.y, Math.round(dmg), isCrit, false);
    window.particleSystem.emitSparks(e.x, e.y, isCrit ? 16 : 8, isCrit ? '#ffd700' : '#ff4757', 6);
    if (window.soundEngine) window.soundEngine.playHitSlash(isCrit);

    if (e.hp <= 0) this.killEnemy(e);
  }

  killEnemy(e) {
    const idx = this.enemies.indexOf(e);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
      this.score += 70;
      document.getElementById('scoreValText').textContent = this.score;
      window.particleSystem.emitFireBurst(e.x, e.y, 14);

      if (!this.isBossWave && this.enemies.length === 0) {
        if (this.waveNumber < 4) {
          // Progress: Wave 1 -> Wave 2 -> Wave 3 -> Elite Wave (4)
          setTimeout(() => this.startWave(this.waveNumber + 1), 1200);
        } else if (this.waveNumber === 4) {
          // Progress from Elite Wave -> Boss Encounter (Wave 5)
          setTimeout(() => this.startWave(5), 1500);
        }
      }
    }
  }

  damageBoss(dmg, isCrit = false) {
    if (!this.boss) return;
    this.boss.hp -= dmg;
    this.boss.hitFlash = 6;
    window.particleSystem.emitDamageText(this.boss.x, this.boss.y, Math.round(dmg), isCrit, false);
    window.particleSystem.emitSparks(this.boss.x, this.boss.y, 18, '#ffd700', 8);
    if (window.soundEngine) window.soundEngine.playHitSlash(isCrit);

    const hpPct = this.boss.hp / this.boss.maxHp;
    if (this.boss.phase === 1 && hpPct <= 0.6) {
      this.boss.phase = 2;
      document.getElementById('bossPhaseBadge').textContent = 'PHASE 2';
      this.announceCombat(`${this.boss.name}: ENRAGED PHASE 2!`);
      window.particleSystem.addShake(0.8);
      this.spawnEnemy(false);
      this.spawnEnemy(false);
    } else if (this.boss.phase === 2 && hpPct <= 0.25) {
      this.boss.phase = 3;
      document.getElementById('bossPhaseBadge').textContent = 'PHASE 3';
      this.announceCombat(`${this.boss.name}: FINAL FORM AWAKENED!`);
      window.particleSystem.addShake(1.0);
      this.spawnEnemy(true);
      this.spawnEnemy(true);
    }

    this.updateBossHpBar();
    if (this.boss.hp <= 0) this.defeatBoss();
  }

  updateBossHpBar() {
    if (!this.boss) return;
    const pct = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
    const fill = document.getElementById('bossHpFill');
    if (fill) fill.style.width = `${pct}%`;
    const ghost = document.getElementById('bossHpGhost');
    if (ghost) setTimeout(() => { ghost.style.width = `${pct}%`; }, 180);
  }

  defeatBoss() {
    this.announceCombat(`${this.boss.name} VANQUISHED!`);
    window.particleSystem.addShake(1.0);
    window.particleSystem.emitFireBurst(this.boss.x, this.boss.y, 50);

    if (window.soundEngine) {
      window.soundEngine.playTempleBell(587.33, 5.0, 0.6);
      window.soundEngine.stopBattleMusic();
    }

    this.boss = null;
    document.getElementById('bossHud')?.classList.add('hidden');
    this.score += 1500;
    document.getElementById('scoreValText').textContent = this.score;

    setTimeout(() => {
      if (this.currentArea < 5) this.triggerLevelClear();
      else this.triggerGrandVictory();
    }, 1800);
  }

  damagePlayer(amount, sourceX = 0, sourceY = 0) {
    if (this.player.iFrames > 0 || this.player.isDefeated) return;
    const actualDmg = this.player.isGaja ? amount * 0.35 : amount;
    this.player.hp = Math.max(0, this.player.hp - actualDmg);
    this.player.iFrames = 45; // 0.75 seconds invulnerability window

    if (sourceX !== 0 || sourceY !== 0) {
      const recoilAng = Math.atan2(this.player.y - sourceY, this.player.x - sourceX);
      this.player.vx += Math.cos(recoilAng) * 6.5;
      this.player.vy += Math.sin(recoilAng) * 6.5;
    }

    this.flashScreen('damageFlash', 140);
    window.particleSystem.addShake(0.5);
    window.particleSystem.emitDamageText(this.player.x, this.player.y, Math.round(actualDmg), false, true);

    this.updatePlayerHUD();
    if (this.player.hp <= 0 && !this.player.isDefeated) {
      this.player.isDefeated = true;
      this.player.defeatTimer = 75; // 1.25s readable defeat animation
      this.announceCombat('THE GUARDIAN HAS FALLEN');
      window.particleSystem.addShake(0.6);
      window.particleSystem.emitFireBurst(this.player.x, this.player.y, 25);
    }
  }

  damageWard(amount) {
    if (this.ward.invulnTimer > 0) return; // Prevent multi-enemy instant destruction
    this.ward.invulnTimer = 45; // 0.75s grace buffer between damage ticks

    // In Area 1, temple damage is low (1 to 2.0)
    const scaledDamage = this.currentArea === 1 ? Math.min(amount, 2.0) : amount;
    this.ward.integrity = Math.max(0, this.ward.integrity - scaledDamage);
    if (window.soundEngine) window.soundEngine.playTempleAlarm();

    window.particleSystem.emitSparks(this.ward.x, this.ward.y, 14, '#ffd700', 6);
    window.particleSystem.addShake(0.3);

    const fill = document.getElementById('templeFill');
    const txt = document.getElementById('templePercentText');
    if (fill) fill.style.width = `${this.ward.integrity}%`;
    if (txt) txt.textContent = `${Math.round(this.ward.integrity)}%`;

    if (this.ward.integrity <= 0) {
      this.triggerGameOver('GAME OVER', 'Temple Integrity Failed');
    }
  }

  addCombo(amount = 1) {
    this.combo += amount;
    this.comboTimer = 160;

    const banner = document.getElementById('comboBanner');
    const count = document.getElementById('comboCount');
    const rating = document.getElementById('comboRating');

    if (banner) banner.classList.remove('hidden');
    if (count) count.textContent = this.combo;

    const ranks = ['DIVINE STRIKE!', 'VALIANT FURY!', 'SACRED WRATH!', 'IMMORTAL VALOR!', 'GODLIKE POWER!'];
    const rank = ranks[Math.min(ranks.length - 1, Math.floor(this.combo / 4))];
    if (rating) rating.textContent = rank;
  }

  addGajaMeter(amount) {
    this.player.gajaMeter = Math.min(100, this.player.gajaMeter + amount);
    const fill = document.getElementById('gajaFill');
    const txt = document.getElementById('gajaText');
    if (fill) fill.style.width = `${this.player.gajaMeter}%`;
    if (txt) txt.textContent = `${Math.round(this.player.gajaMeter)}%`;

    if (this.player.gajaMeter >= 100 && this.currentArea >= 4) {
      this.announceCombat('GAJA FORM READY! PRESS [G]');
    }
  }

  announceCombat(text) {
    const el = document.getElementById('combatAnnounce');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(this.announceTimeout);
    this.announceTimeout = setTimeout(() => { el.classList.add('hidden'); }, 1900);
  }

  /* =========================================================================
     STATE TRANSITIONS, UPDATE LOOP & RENDER
     ========================================================================= */
  triggerLevelClear() {
    this.state = 'LEVEL_CLEAR';
    document.getElementById('levelClearModal')?.classList.remove('hidden');

    document.getElementById('clearTempleStat').textContent = `${Math.round(this.ward.integrity)}%`;
    document.getElementById('clearScoreStat').textContent = this.score;

    const powerCard = document.getElementById('powerUnlockedBanner');
    const unlockTitle = document.getElementById('unlockTitle');
    const unlockDesc = document.getElementById('unlockDesc');

    if (this.currentArea === 1) {
      powerCard?.classList.remove('hidden');
      unlockTitle.textContent = 'DIVINE POWER: VAYU DASH';
      unlockDesc.textContent = 'Whirlwind dash through foes! Press [2] or tap Dash.';
    } else if (this.currentArea === 2) {
      powerCard?.classList.remove('hidden');
      unlockTitle.textContent = 'DIVINE POWERS: INDRA LIGHTNING & AGNI BURST';
      unlockDesc.textContent = 'Call thunderbolts [3] and explosive fire supernovas [4]!';
    } else if (this.currentArea === 3) {
      powerCard?.classList.remove('hidden');
      unlockTitle.textContent = 'SUPER TRANSFORMATION: GAJA FORM';
      unlockDesc.textContent = 'Channel the supernatural elephant titan! Press [G].';
    } else {
      powerCard?.classList.add('hidden');
    }
  }

  nextArea() {
    document.getElementById('levelClearModal')?.classList.add('hidden');
    this.startArea(this.currentArea + 1);
    this.state = 'PLAYING';
  }

  triggerGameOver(title, subtitle) {
    this.state = 'GAME_OVER';
    if (window.soundEngine) window.soundEngine.stopBattleMusic();

    document.getElementById('gameOverModal')?.classList.remove('hidden');
    document.getElementById('defeatReasonSub').textContent = subtitle;
    document.getElementById('defeatAreaStat').textContent = `AREA 0${this.currentArea}`;
    document.getElementById('defeatScoreStat').textContent = this.score;
  }

  restartCurrentArea() {
    document.getElementById('gameOverModal')?.classList.add('hidden');
    document.getElementById('pauseMenu')?.classList.add('hidden');
    document.getElementById('grandVictoryModal')?.classList.add('hidden');
    this.player.hp = this.player.maxHp;
    this.player.energy = this.player.maxEnergy;
    this.startArea(this.currentArea);
    this.state = 'PLAYING';
  }

  triggerGrandVictory() {
    this.state = 'VICTORY';
    document.getElementById('grandVictoryModal')?.classList.remove('hidden');
    document.getElementById('finalScoreVal').textContent = this.score;
    if (window.soundEngine) window.soundEngine.playTempleBell(587.33, 6.0, 0.7);
  }

  quitToTitle() {
    this.state = 'MENU';
    if (window.soundEngine) window.soundEngine.stopBattleMusic();
    document.querySelectorAll('.screen-overlay').forEach(el => el.classList.add('hidden'));
    document.getElementById('mainMenu')?.classList.remove('hidden');
    document.getElementById('hudOverlay')?.classList.add('hidden');
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      document.getElementById('pauseMenu')?.classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      document.getElementById('pauseMenu')?.classList.add('hidden');
    }
  }

  update() {
    if (this.state !== 'PLAYING') return;
    this.gameTime += 0.016;

    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        document.getElementById('comboBanner')?.classList.add('hidden');
      }
    }

    this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 0.08);
    this.updatePlayerHUD();

    if (this.player.bladeTimer > 0) {
      this.player.bladeTimer--;
      if (this.player.bladeTimer <= 0) this.player.bladeActive = false;
    }
    if (this.player.gajaTimer > 0) {
      this.player.gajaTimer--;
      if (this.player.gajaTimer <= 0) this.player.isGaja = false;
    }
    if (this.player.iFrames > 0) this.player.iFrames--;

    if (this.player.heavyAttackTimer > 0) {
      this.player.heavyAttackTimer--;
      if (this.player.heavyAttackTimer <= 0) this.player.isHeavyAttacking = false;
    }
    if (this.player.attackAnim > 0) {
      this.player.attackAnim = Math.max(0, this.player.attackAnim - 0.08);
    }

    this.updateAbilityCooldownOverlays();

    // Desktop Key Movement
    let moveX = 0, moveY = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Mobile Virtual Joystick input
    if (this.touchMoveVector.x !== 0 || this.touchMoveVector.y !== 0) {
      moveX = this.touchMoveVector.x;
      moveY = this.touchMoveVector.y;
    }

    const inputLen = Math.hypot(moveX, moveY);
    if (inputLen > 0) {
      const normX = moveX / inputLen;
      const normY = moveY / inputLen;
      this.player.vx += normX * 0.9;
      this.player.vy += normY * 0.9;
      this.player.isMoving = true;
    } else {
      this.player.isMoving = false;
    }

    // Defeat sequence handling
    if (this.player.isDefeated) {
      this.player.defeatTimer--;
      this.player.vx *= 0.7;
      this.player.vy *= 0.7;
      this.player.x += this.player.vx;
      this.player.y += this.player.vy;
      if (this.player.defeatTimer <= 0) {
        this.triggerGameOver('GAME OVER', 'The Guardian Has Fallen');
      }
      return;
    }

    if (this.ward.invulnTimer > 0) this.ward.invulnTimer--;

    // Drag / friction
    this.player.vx *= 0.84;
    this.player.vy *= 0.84;

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Courtyard arena boundary clamp
    const minX = this.currentArea === 1 ? 220 : 160;
    const maxX = this.currentArea === 1 ? 1380 : this.worldWidth - 160;
    const minY = this.currentArea === 1 ? 430 : 200;
    const maxY = this.currentArea === 1 ? 840 : this.worldHeight - 160;
    this.player.x = Math.max(minX, Math.min(maxX, this.player.x));
    this.player.y = Math.max(minY, Math.min(maxY, this.player.y));

    // Dash decay
    if (this.player.isDashing) {
      this.player.dashTimer--;
      if (this.player.dashTimer <= 0) this.player.isDashing = false;
    }

    // Facing Angle
    if (this.touchMoveVector.x !== 0 || this.touchMoveVector.y !== 0) {
      this.player.facingAngle = Math.atan2(this.touchMoveVector.y, this.touchMoveVector.x);
    } else {
      const scX = this.width / 2;
      const scY = this.height / 2;
      this.player.facingAngle = Math.atan2(this.mouse.y - scY, this.mouse.x - scX);
    }

    // Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life--;

      if (proj.isPlayer) {
        for (const e of this.enemies) {
          if (Math.hypot(e.x - proj.x, e.y - proj.y) < e.radius + proj.radius) {
            this.damageEnemy(e, proj.damage, true);
            proj.life = 0; break;
          }
        }
        if (this.boss && Math.hypot(this.boss.x - proj.x, this.boss.y - proj.y) < this.boss.radius + proj.radius) {
          this.damageBoss(proj.damage, true);
          proj.life = 0;
        }
      } else {
        if (Math.hypot(this.player.x - proj.x, this.player.y - proj.y) < this.player.radius + proj.radius) {
          this.damagePlayer(proj.damage, proj.x, proj.y);
          proj.life = 0;
        } else if (Math.hypot(this.ward.x - proj.x, this.ward.y - proj.y) < this.ward.radius) {
          this.damageWard(proj.damage * 0.4);
          proj.life = 0;
        }
      }
      if (proj.life <= 0) this.projectiles.splice(i, 1);
    }

    this.updateEnemiesAI();
    if (this.boss) this.updateBossAI();
    this.updateCamera();
  }

  updateEnemiesAI() {
    for (const e of this.enemies) {
      if (e.hitFlash > 0) e.hitFlash--;
      if (e.attackLunge > 0) e.attackLunge *= 0.82;

      let targetX = this.player.x;
      let targetY = this.player.y;

      if (e.targetObjective === 'ward') {
        targetX = this.ward.x;
        targetY = this.ward.y;
      }

      const dx = targetX - e.x;
      const dy = targetY - e.y;
      const dist = Math.hypot(dx, dy);
      e.angle = Math.atan2(dy, dx);

      if (e.attackCooldown > 0) e.attackCooldown--;

      if (e.type === 'ranged') {
        if (dist > 320) {
          e.vx = Math.cos(e.angle) * e.speed;
          e.vy = Math.sin(e.angle) * e.speed;
        } else if (dist < 200) {
          e.vx = -Math.cos(e.angle) * e.speed;
          e.vy = -Math.sin(e.angle) * e.speed;
        } else {
          e.vx *= 0.8; e.vy *= 0.8;
        }

        if (e.attackCooldown <= 0) {
          e.attackCooldown = 120 + Math.random() * 40;
          this.projectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(e.angle) * 4.2,
            vy: Math.sin(e.angle) * 4.2,
            radius: 12,
            damage: e.attackPower,
            life: 140,
            isPlayer: false,
            color: '#8e44ad'
          });
        }
      } else {
        const playerDist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
        const wardDist = Math.hypot(this.ward.x - e.x, this.ward.y - e.y);

        // Windup & attack telegraph
        if (e.isWindingUp) {
          e.windupTimer--;
          e.vx *= 0.35;
          e.vy *= 0.35;

          if (e.windupTimer <= 0) {
            e.isWindingUp = false;
            e.attackLunge = 12;
            e.attackCooldown = 95 + Math.random() * 45; // ~1.6 to 2.3s cooldown between strikes!

            if (e.isAttackingWard) {
              e.isAttackingWard = false;
              if (wardDist < this.ward.radius + 30) {
                this.damageWard(e.attackPower * 0.35);
              }
            } else if (playerDist < this.player.radius + e.radius + 20) {
              this.damagePlayer(e.attackPower, e.x, e.y);
            }
          }
        } else {
          // Normal tracking movement
          if (dist > (this.player.radius + e.radius) * 0.8) {
            e.vx = Math.cos(e.angle) * e.speed;
            e.vy = Math.sin(e.angle) * e.speed;
          } else {
            e.vx *= 0.7; e.vy *= 0.7;
          }

          // Trigger attack windup when close to player
          if (playerDist < this.player.radius + e.radius + 20 && e.attackCooldown <= 0) {
            e.isWindingUp = true;
            e.windupTimer = 22; // ~0.35s anticipation telegraph
            e.isAttackingWard = false;
          }

          // Trigger attack windup when close to ward (with damage event, NOT continuous per-frame)
          if (wardDist < this.ward.radius && e.attackCooldown <= 0 && !e.isWindingUp) {
            e.isWindingUp = true;
            e.windupTimer = 28; // ~0.45s telegraph before striking temple
            e.isAttackingWard = true;
          }
        }
      }

      e.x += e.vx;
      e.y += e.vy;
    }
  }

  updateBossAI() {
    const b = this.boss;
    if (b.hitFlash > 0) b.hitFlash--;

    const dx = this.player.x - b.x;
    const dy = this.player.y - b.y;
    const dist = Math.hypot(dx, dy);
    b.angle = Math.atan2(dy, dx);

    if (dist > 90) {
      b.vx = Math.cos(b.angle) * b.speed;
      b.vy = Math.sin(b.angle) * b.speed;
    } else {
      b.vx *= 0.8; b.vy *= 0.8;
    }

    b.x += b.vx;
    b.y += b.vy;

    if (dist < this.player.radius + b.radius) {
      this.damagePlayer(b.attackPower);
    }

    // Telegraphed Boss Heavy Attacks
    if (b.telegraphTimer > 0) {
      b.telegraphTimer--;
      if (b.telegraphTimer <= 0) {
        // Impact!
        window.particleSystem.emitShockwave(b.telegraphX, b.telegraphY, b.telegraphRadius, 'rgba(231, 76, 60, 0.8)', 0.4);
        window.particleSystem.addShake(0.7);
        if (Math.hypot(this.player.x - b.telegraphX, this.player.y - b.telegraphY) < b.telegraphRadius) {
          this.damagePlayer(b.attackPower * 1.6);
        }
      }
    }

    // Boss Special attacks
    b.specialTimer--;
    if (b.specialTimer <= 0) {
      b.specialTimer = 170;
      // Telegraph attack at player position
      b.telegraphTimer = 45; // ~0.75s warning
      b.telegraphX = this.player.x;
      b.telegraphY = this.player.y;
      b.telegraphRadius = 110;

      // Also fire radial void bolts
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        this.projectiles.push({
          x: b.x, y: b.y,
          vx: Math.cos(ang) * 5.2,
          vy: Math.sin(ang) * 5.2,
          radius: 12,
          damage: b.attackPower,
          life: 120,
          isPlayer: false,
          color: '#e74c3c'
        });
      }
    }
  }

  updateCamera() {
    const mode = this.cameraModes[this.cameraModeIndex];

    const aimLeadX = (this.mouse.x - this.width / 2) * 0.08;
    const aimLeadY = (this.mouse.y - this.height / 2) * 0.08;

    const baseFitZoom = Math.max(this.width / 1600, this.height / 900);

    if (mode === 'action') {
      this.camera.targetX = 800 + (this.player.x - 800) * 0.35 + aimLeadX;
      this.camera.targetY = 540 + (this.player.y - 540) * 0.35 + aimLeadY;
      this.camera.targetZoom = baseFitZoom + (this.camera.zoomImpulse || 0);
    } else if (mode === 'topdown') {
      this.camera.targetX = 800;
      this.camera.targetY = 520;
      this.camera.targetZoom = baseFitZoom * 0.92 + (this.camera.zoomImpulse || 0);
    } else if (mode === 'close') {
      this.camera.targetX = this.player.x + aimLeadX * 0.5;
      this.camera.targetY = this.player.y + aimLeadY * 0.5;
      this.camera.targetZoom = baseFitZoom * 1.35 + (this.camera.zoomImpulse || 0);
    } else if (mode === 'cinematic') {
      const focusTarget = this.boss || this.player;
      this.camera.targetX = (this.player.x + focusTarget.x) / 2;
      this.camera.targetY = (this.player.y + focusTarget.y) / 2 - 15;
      this.camera.targetZoom = baseFitZoom * 1.15 + (this.camera.zoomImpulse || 0);
    }

    if (this.camera.zoomImpulse > 0) {
      this.camera.zoomImpulse *= 0.88;
      if (this.camera.zoomImpulse < 0.005) this.camera.zoomImpulse = 0;
    }

    const lerpSpeed = 0.10;
    this.camera.x += (this.camera.targetX - this.camera.x) * lerpSpeed;
    this.camera.y += (this.camera.targetY - this.camera.y) * lerpSpeed;
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.08;
  }

  updatePlayerHUD() {
    const hpFill = document.getElementById('hpFill');
    const hpText = document.getElementById('hpText');
    if (hpFill) hpFill.style.width = `${(this.player.hp / this.player.maxHp) * 100}%`;
    if (hpText) hpText.textContent = `${Math.round(this.player.hp)} / ${this.player.maxHp}`;

    const energyFill = document.getElementById('energyFill');
    const energyText = document.getElementById('energyText');
    if (energyFill) energyFill.style.width = `${(this.player.energy / this.player.maxEnergy) * 100}%`;
    if (energyText) energyText.textContent = `${Math.round(this.player.energy)} / ${this.player.maxEnergy}`;
  }

  updateAbilityCooldownOverlays() {
    const now = performance.now();
    const map = [
      { key: 'blade', overlay: 'cdOverlayBlade' },
      { key: 'dash', overlay: 'cdOverlayDash' },
      { key: 'lightning', overlay: 'cdOverlayLightning' },
      { key: 'fire', overlay: 'cdOverlayFire' },
      { key: 'gaja', overlay: 'cdOverlayGaja' }
    ];

    map.forEach(item => {
      const p = this.powers[item.key];
      const el = document.getElementById(item.overlay);
      if (!el) return;

      const elapsed = now - p.lastUsed;
      if (elapsed < p.cd) {
        const pct = (1.0 - elapsed / p.cd) * 100;
        el.style.height = `${pct}%`;
      } else {
        el.style.height = '0%';
      }
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.ctx.translate(
      this.width / 2 + window.particleSystem.shakeX,
      this.height / 2 + window.particleSystem.shakeY
    );
    this.ctx.rotate(window.particleSystem.shakeRotation);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);

    this.drawEnvironmentBackground();

    window.spriteRenderer.drawSacredWard(
      this.ctx,
      this.ward.x,
      this.ward.y,
      this.ward.radius,
      this.ward.integrity,
      this.gameTime
    );

    this.diyas.forEach(d => {
      window.spriteRenderer.drawDiya(this.ctx, d.x, d.y, this.gameTime);
    });

    this.projectiles.forEach(p => {
      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    this.enemies.forEach(e => {
      window.spriteRenderer.drawEnemy(this.ctx, e, this.gameTime);
    });

    if (this.boss) {
      window.spriteRenderer.drawBoss(this.ctx, this.boss, this.gameTime);
    }

    window.spriteRenderer.drawGuardian(this.ctx, this.player, this.gameTime);
    window.particleSystem.drawWorld(this.ctx);

    this.ctx.restore();
  }

  drawEnvironmentBackground() {
    const img = this.bgImages[this.currentArea];
    if (img && img.complete && img.naturalWidth > 0) {
      this.ctx.drawImage(img, 0, 0, this.worldWidth, this.worldHeight);
    } else {
      this.ctx.fillStyle = '#1e1c18';
      this.ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);
    }
  }

  gameLoop(timestamp) {
    const shouldUpdate = window.particleSystem.update();
    if (shouldUpdate !== false) {
      this.update();
    }
    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

if (typeof window !== 'undefined') {
  window.VighnaGame = VighnaGame;
  window.addEventListener('DOMContentLoaded', () => {
    window.vighnaGame = new VighnaGame();
  });
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VighnaGame, SoundEngine, ParticleSystem, SpriteRenderer };
}
