(function (global) {
  'use strict';

  const BIRDS_CATALOG = [
    { id: 'yalicapkini', name: 'Yalıçapkını', emoji: '🐦', rarity: 'Nadir', color: '#0ea5e9' },
    { id: 'ibibik', name: 'İbibik (Hüthüt)', emoji: '🦜', rarity: 'Nadir', color: '#f97316' },
    { id: 'kizilgerdan', name: 'Kızılgerdan', emoji: '🐤', rarity: 'Yaygın', color: '#ef4444' },
    { id: 'florya', name: 'Florya', emoji: '🐥', rarity: 'Yaygın', color: '#84cc16' },
    { id: 'mavi_bastankara', name: 'Mavi Baştankara', emoji: '🐧', rarity: 'Orta', color: '#3b82f6' },
    { id: 'saka', name: 'Saka Kuşu', emoji: '🕊️', rarity: 'Orta', color: '#eab308' },
    { id: 'arici', name: 'Arı Kuşu', emoji: '🦚', rarity: 'Çok Nadir', color: '#14b8a6' },
    { id: 'baykus', name: 'Kukumav Baykuş', emoji: '🦉', rarity: 'Nadir', color: '#a855f7' },
    { id: 'ispinoz', name: 'Bayağı İspinoz', emoji: '🐦‍🔥', rarity: 'Yaygın', color: '#f43f5e' },
    { id: 'gokce', name: 'Gökçe Güvercin', emoji: '🕊️', rarity: 'Orta', color: '#94a3b8' },
    { id: 'altin_asmakusu', name: 'Altın Asmakuşu', emoji: '🐤', rarity: 'Çok Nadir', color: '#fbbf24' },
    { id: 'zumrut_anka', name: 'Zümrüt Bahçe Ankası', emoji: '🦚', rarity: 'Efsanevi', color: '#10b981' }
  ];

  // Draw crisp 16-bit pixel art sprite of ZeK
  function drawZeKSprite(ctx, x, y, w, h, facingRight, walkFrame, hasShield) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);

    const px = w / 16;
    const py = h / 20;
    const ox = -w / 2;
    const oy = -h / 2;

    const r = (gx, gy, gw, gh, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(ox + gx * px), Math.round(oy + gy * py), Math.ceil(gw * px), Math.ceil(gh * py));
    };

    // Super Chef Shield Aura (for Zor difficulty)
    if (hasShield) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(w, h) * 0.62, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Green trucker cap with red brim (from IMG_9A4EEE619E96-1.jpeg)
    r(3, 0, 10, 3, '#15803d'); // crown
    r(5, 1, 5, 2, '#fef3c7');  // white/cream patch
    r(3, 3, 12, 1.5, '#dc2626'); // red brim sticking forward

    // Head & dark hair
    r(4, 4.5, 8, 5, '#e8b48a'); // face
    r(3, 4.5, 1.5, 3, '#271c19'); // side hair
    r(11, 5.5, 1, 2, '#f8fafc'); // white AirPod!

    // Eyes & eyebrows
    r(5, 5.5, 2, 1, '#1c120e');
    r(9, 5.5, 2, 1, '#1c120e');
    r(5.5, 6.5, 1.2, 1.2, '#111827');
    r(9.5, 6.5, 1.2, 1.2, '#111827');

    // Iconic mustache & silver-tipped beard
    r(4.5, 8, 7, 1.4, '#1f1614'); // mustache
    r(4, 9.2, 8, 2, '#2d2422');   // beard
    r(5, 10.4, 6, 1, '#9ca3af');  // silver beard tips

    // Cream sweater + Mustard apron with brown straps
    r(3, 11.2, 10, 5.5, '#fef3c7'); // sweater
    r(4.5, 11.2, 1.3, 3, '#78350f'); // left brown strap
    r(10.2, 11.2, 1.3, 3, '#78350f'); // right brown strap
    r(4, 13.5, 8, 3.8, '#d97706'); // mustard/yellow apron

    // Legs (animated walk)
    const step = walkFrame % 2 === 0 ? 0 : 1;
    r(4.5, 17, 2.5, 3 - step * 0.5, '#1e293b');
    r(9, 17, 2.5, 3 - (1 - step) * 0.5, '#1e293b');
    r(4.2, 19.2, 3, 1, '#7c2d12');
    r(8.8, 19.2, 3, 1, '#7c2d12');

    ctx.restore();
  }

  function drawZeKPortrait(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawZeKSprite(ctx, 6, 4, canvas.width - 12, canvas.height - 4, true, 0, false);
  }

  class ZeKGameEngine {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.cb = callbacks || {};
      this.mode = 'platform';
      this.running = false;
      this.rafId = null;
      this.lastTime = 0;

      this.keys = { left: false, right: false, up: false, down: false, fire: false, photo: false };
      this.powerTier = 'kolay'; // kolay | orta | zor
      this.rescueMode = false;
      this.ticketUsed = false;

      this.state = null;
      this.bindKeyboard();
      this.bindCanvasPointer();
    }

    bindKeyboard() {
      window.addEventListener('keydown', (e) => {
        if (!this.running) return;
        const map = {
          ArrowLeft: 'left', KeyA: 'left',
          ArrowRight: 'right', KeyD: 'right',
          ArrowUp: 'up', KeyW: 'up',
          ArrowDown: 'down', KeyS: 'down',
          Space: 'fire', KeyF: 'fire',
          KeyE: 'photo', KeyC: 'photo'
        };
        if (map[e.code]) {
          e.preventDefault();
          this.setInput(map[e.code], true);
        }
      });

      window.addEventListener('keyup', (e) => {
        const map = {
          ArrowLeft: 'left', KeyA: 'left',
          ArrowRight: 'right', KeyD: 'right',
          ArrowUp: 'up', KeyW: 'up',
          ArrowDown: 'down', KeyS: 'down',
          Space: 'fire', KeyF: 'fire',
          KeyE: 'photo', KeyC: 'photo'
        };
        if (map[e.code]) {
          this.setInput(map[e.code], false);
        }
      });
    }

    bindCanvasPointer() {
      this.pointer = { active: false, x: 240, y: 180, holdFireTimer: 0 };
      this.touchEffects = [];

      const toCanvasCoords = (clientX, clientY) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
          cx: (clientX - rect.left) * scaleX,
          cy: (clientY - rect.top) * scaleY
        };
      };

      this.canvas.addEventListener('pointerdown', (e) => {
        if (!this.running || !this.state) return;
        e.preventDefault();
        if (this.canvas.setPointerCapture) {
          try { this.canvas.setPointerCapture(e.pointerId); } catch {}
        }
        const { cx, cy } = toCanvasCoords(e.clientX, e.clientY);
        this.pointer.active = true;
        this.pointer.x = cx;
        this.pointer.y = cy;
        this.pointer.holdFireTimer = 0.35;

        if (this.mode === 'platform') {
          this.handlePlatformTouchDown(cx, cy);
        } else if (this.mode === 'safari') {
          this.addTouchRipple(cx, cy, '#4ade80');
          this.state.reticle.x = cx;
          this.state.reticle.y = cy;
          this.triggerSafariSnap();
        } else if (this.mode === 'defense') {
          this.handleDefenseTouchDown(cx, cy);
        }
      });

      this.canvas.addEventListener('pointermove', (e) => {
        if (!this.running || !this.state || !this.pointer.active) return;
        const { cx, cy } = toCanvasCoords(e.clientX, e.clientY);
        this.pointer.x = cx;
        this.pointer.y = cy;

        if (this.mode === 'safari') {
          this.state.reticle.x = cx;
          this.state.reticle.y = cy;
        } else if (this.mode === 'defense') {
          this.snapDefenseLaneToY(cy);
        }
      });

      const releasePointer = () => {
        this.pointer.active = false;
      };
      this.canvas.addEventListener('pointerup', releasePointer);
      this.canvas.addEventListener('pointercancel', releasePointer);
    }

    addTouchRipple(x, y, color = '#fbbf24') {
      this.touchEffects.push({ x, y, r: 6, alpha: 1, color });
    }

    handlePlatformTouchDown(cx, cy) {
      const s = this.state;
      const p = s.player;

      // 1. Check if player tapped directly on a flying bird -> 📸 Snap Photo!
      for (let i = s.birds.length - 1; i >= 0; i--) {
        const b = s.birds[i];
        if (!b.snapped && Math.hypot(cx - (b.x + 12), cy - (b.y + 12)) < 48) {
          b.snapped = true;
          s.score += 120;
          s.photosTaken += 1;
          s.flashMsg = `📸 ${b.catalog.name} Yakalandı! +120`;
          s.flashTimer = 1.6;
          this.addTouchRipple(b.x + 12, b.y + 12, '#38bdf8');
          if (this.cb.onBirdPhotographed) this.cb.onBirdPhotographed(b.catalog);
          if (this.cb.onSfx) this.cb.onSfx('shutter');
          return;
        }
      }

      this.addTouchRipple(cx, cy, '#fbbf24');

      // Face toward tap side if far from ZeK
      if (cx < p.x - 10) p.facingRight = false;
      else if (cx > p.x + p.w + 10) p.facingRight = true;

      // Check if tapped on an enemy/boss or upper air -> jump + aimed croissant throw
      const tappedUpperHalf = cy < 245;
      const tappedNearZeK = Math.abs(cx - (p.x + p.w / 2)) < 58 && cy < 295;
      if (tappedUpperHalf || tappedNearZeK || p.jumps === 0) {
        this.tryPlatformJump();
      }
      this.fireCroissant(cx, cy);
    }

    snapDefenseLaneToY(cy) {
      const s = this.state;
      let bestLane = 0;
      let bestDist = Infinity;
      s.lanesY.forEach((ly, idx) => {
        const d = Math.abs(cy - ly);
        if (d < bestDist) {
          bestDist = d;
          bestLane = idx;
        }
      });
      s.playerLane = bestLane;
    }

    handleDefenseTouchDown(cx, cy) {
      const s = this.state;

      // 1. Tap on Oven Blast button (top-left)
      if (cx <= 155 && cy <= 62) {
        this.addTouchRipple(cx, cy, '#fb923c');
        this.triggerOvenBlast();
        return;
      }

      // 2. Tap directly on a falling Sourdough Starter 🥖 to collect immediately
      for (let i = s.starters.length - 1; i >= 0; i--) {
        const st = s.starters[i];
        const sy = s.lanesY[st.lane];
        if (Math.hypot(cx - st.x, cy - sy) < 42) {
          s.ovenCharge = Math.min(100, s.ovenCharge + 28);
          s.score += 65;
          s.starters.splice(i, 1);
          this.addTouchRipple(cx, cy, '#4ade80');
          if (this.cb.onSfx) this.cb.onSfx('shutter');
          return;
        }
      }

      // 3. Tap any lane -> move ZeK to that lane & fire hot croissants!
      this.addTouchRipple(cx, cy, '#fbbf24');
      this.snapDefenseLaneToY(cy);
      this.fireDefenseCroissant();
    }

    setInput(key, active) {
      const wasActive = this.keys[key];
      this.keys[key] = active;
      if (!this.running || !this.state) return;

      if (active && !wasActive) {
        if (this.mode === 'platform' && key === 'up') {
          this.tryPlatformJump();
        }
        if (this.mode === 'platform' && key === 'fire') {
          this.fireCroissant();
        }
        if (this.mode === 'platform' && key === 'photo') {
          this.snapPlatformBird();
        }
        if (this.mode === 'safari' && (key === 'photo' || key === 'fire')) {
          this.triggerSafariSnap();
        }
        if (this.mode === 'defense') {
          if (key === 'up') this.moveDefenseLane(-1);
          if (key === 'down') this.moveDefenseLane(1);
          if (key === 'fire') this.fireDefenseCroissant();
          if (key === 'photo') this.triggerOvenBlast();
        }
      }
    }

    start(options) {
      this.mode = options.mode || 'platform';
      this.powerTier = options.powerTier || 'kolay';
      this.rescueMode = Boolean(options.rescueMode);
      this.ticketUsed = Boolean(options.ticketUsed);

      this.keys = { left: false, right: false, up: false, down: false, fire: false, photo: false };
      this.initModeState();
      this.running = true;
      this.lastTime = performance.now();

      if (this.rafId) cancelAnimationFrame(this.rafId);
      const loop = (now) => {
        const dt = Math.min(0.05, (now - this.lastTime) / 1000);
        this.lastTime = now;
        if (this.running) {
          this.update(dt);
          this.render();
          this.rafId = requestAnimationFrame(loop);
        }
      };
      this.rafId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    initModeState() {
      const hasShield = this.powerTier === 'zor';
      const maxHp = hasShield ? 4 : 3;

      if (this.mode === 'platform') {
        this.state = {
          hp: maxHp,
          score: 0,
          distance: 0,
          goalDistance: 2200,
          scrollX: 0,
          invuln: 0,
          flashMsg: '👆 Ekrana dokun: Zıpla & At • 🐦 Kuşa dokun: 📸',
          flashTimer: 2.5,
          player: {
            x: 70, y: 266, w: 34, h: 42,
            vy: 0, jumps: 0, maxJumps: 2,
            facingRight: true, walkTimer: 0, walkFrame: 0
          },
          platforms: [
            { x: 160, y: 245, w: 95, h: 14 },
            { x: 320, y: 195, w: 110, h: 14 },
            { x: 500, y: 235, w: 100, h: 14 },
            { x: 690, y: 185, w: 120, h: 14 }
          ],
          projectiles: [],
          enemies: [],
          birds: [],
          collectibles: [],
          spawnTimer: 1.0,
          birdTimer: 2.2,
          bossSpawned: false,
          boss: null,
          photosTaken: 0
        };
      } else if (this.mode === 'safari') {
        this.state = {
          hp: maxHp,
          score: 0,
          timeLeft: 32,
          photosTaken: 0,
          targetPhotos: 7,
          reticle: { x: 240, y: 180, radius: 38 },
          targets: [],
          hazards: [],
          spawnTimer: 0.6,
          shutterFlash: 0,
          flashMsg: '🐦 Kuşların üzerine doğrudan dokun ve çek!',
          flashTimer: 2.5
        };
      } else {
        // Defense mode
        this.state = {
          hp: maxHp,
          score: 0,
          timeLeft: this.rescueMode ? 28 : 30,
          playerLane: 1, // 0, 1, 2
          lanesY: [115, 198, 282],
          ovenCharge: 40,
          projectiles: [],
          enemies: [],
          starters: [],
          spawnTimer: 0.8,
          blastTimer: 0,
          flashMsg: this.rescueMode ? '👆 Şeritlere dokun & KARGALARI KOV!' : '👆 Şeride dokun: Geç & Kruvasan Fırlat!',
          flashTimer: 2.5
        };
      }
      this.emitHud();
    }

    emitHud() {
      if (!this.cb.onHudUpdate || !this.state) return;
      let goalText = '';
      if (this.mode === 'platform') {
        const pct = Math.min(100, Math.round((this.state.distance / this.state.goalDistance) * 100));
        goalText = this.state.boss ? `Boss HP: ${this.state.boss.hp}` : `Yol: %${pct}`;
      } else if (this.mode === 'safari') {
        goalText = `📸 ${this.state.photosTaken}/${this.state.targetPhotos} (${Math.ceil(this.state.timeLeft)}s)`;
      } else {
        goalText = `⏱️ ${Math.ceil(this.state.timeLeft)}s • 🔥%${Math.min(100, Math.round(this.state.ovenCharge))}`;
      }
      this.cb.onHudUpdate({
        hp: this.state.hp,
        score: this.state.score,
        goalText
      });
    }

    finishGame(won, reason) {
      this.stop();
      if (this.cb.onGameEnd) {
        this.cb.onGameEnd({
          mode: this.mode,
          won,
          score: this.state.score,
          photosTaken: this.state.photosTaken || 0,
          rescueMode: this.rescueMode,
          ticketUsed: this.ticketUsed,
          reason
        });
      }
    }

    // ================= MODE 1: PLATFORM =================
    tryPlatformJump() {
      const p = this.state.player;
      if (p.jumps < p.maxJumps) {
        p.vy = -370;
        p.jumps++;
        if (this.cb.onSfx) this.cb.onSfx('jump');
      }
    }

    fireCroissant(targetX = null, targetY = null) {
      const s = this.state;
      const p = s.player;
      if (s.projectiles.length >= 12) return;
      const baseX = p.x + (p.facingRight ? p.w : 0);
      const baseY = p.y + p.h * 0.45;

      let baseVx = (p.facingRight ? 1 : -1) * 360;
      let baseVy = 0;
      if (targetX !== null && targetY !== null) {
        const dx = targetX - baseX;
        const dy = targetY - baseY;
        const len = Math.max(1, Math.hypot(dx, dy));
        baseVx = (dx / len) * 370;
        baseVy = (dy / len) * 370;
      }

      const spread = this.powerTier === 'zor' ? [-55, 0, 55] : this.powerTier === 'orta' ? [-28, 28] : [0];
      spread.forEach((vyOff) => {
        s.projectiles.push({
          x: baseX,
          y: baseY,
          vx: baseVx,
          vy: baseVy + vyOff,
          r: 8,
          rot: 0
        });
      });
      if (this.cb.onSfx) this.cb.onSfx('throw');
    }

    snapPlatformBird() {
      const s = this.state;
      let snapped = false;
      for (let i = s.birds.length - 1; i >= 0; i--) {
        const b = s.birds[i];
        if (!b.snapped) {
          b.snapped = true;
          s.score += 120;
          s.photosTaken += 1;
          s.flashMsg = `📸 ${b.catalog.name} Yakalandı! +120`;
          s.flashTimer = 1.6;
          if (this.cb.onBirdPhotographed) this.cb.onBirdPhotographed(b.catalog);
          if (this.cb.onSfx) this.cb.onSfx('shutter');
          snapped = true;
          break;
        }
      }
      if (!snapped && this.cb.onSfx) this.cb.onSfx('tick');
    }

    updatePlatform(dt) {
      const s = this.state;
      const p = s.player;
      const groundY = 308;

      if (s.invuln > 0) s.invuln -= dt;
      if (s.flashTimer > 0) s.flashTimer -= dt;

      // Horizontal movement (Keyboard OR Touch Hold & Drag)
      let moveX = 0;
      if (this.keys.left) { moveX -= 1; p.facingRight = false; }
      if (this.keys.right) { moveX += 1; p.facingRight = true; }

      if (this.pointer && this.pointer.active) {
        const center = p.x + p.w / 2;
        const diff = this.pointer.x - center;
        if (Math.abs(diff) > 14) {
          moveX = Math.sign(diff);
          p.facingRight = diff > 0;
        }
        this.pointer.holdFireTimer -= dt;
        if (this.pointer.holdFireTimer <= 0) {
          this.pointer.holdFireTimer = 0.38;
          this.fireCroissant(this.pointer.x, this.pointer.y);
        }
      }

      p.x += moveX * 195 * dt;
      p.x = Math.max(12, Math.min(430, p.x));

      if (moveX !== 0) {
        p.walkTimer += dt;
        if (p.walkTimer > 0.14) {
          p.walkTimer = 0;
          p.walkFrame++;
        }
      }

      // Gravity & Platforms
      p.vy += 920 * dt;
      const prevBottom = p.y + p.h;
      p.y += p.vy * dt;

      if (p.y + p.h >= groundY) {
        p.y = groundY - p.h;
        p.vy = 0;
        p.jumps = 0;
      } else if (p.vy > 0) {
        for (const plat of s.platforms) {
          if (
            p.x + p.w * 0.7 > plat.x &&
            p.x + p.w * 0.3 < plat.x + plat.w &&
            prevBottom <= plat.y + 6 &&
            p.y + p.h >= plat.y
          ) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.jumps = 0;
            break;
          }
        }
      }

      // World Scroll progression
      const autoScroll = s.bossSpawned ? 0 : 72;
      s.scrollX += autoScroll * dt;
      s.distance += autoScroll * dt;

      for (const plat of s.platforms) {
        plat.x -= autoScroll * dt;
        if (plat.x + plat.w < 0) {
          plat.x = 500 + Math.random() * 60;
          plat.y = 140 + Math.random() * 65;
        }
      }

      // Spawn enemies
      if (!s.bossSpawned) {
        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0) {
          s.spawnTimer = 1.45 + Math.random() * 0.9;
          const types = [
            { kind: 'snail', emoji: '🐌', hp: 1, y: groundY - 28, speed: 95, pts: 40 },
            { kind: 'crow', emoji: '🐦‍⬛', hp: 1, y: 120 + Math.random() * 85, speed: 135, pts: 60 },
            { kind: 'sloth', emoji: '💤', hp: 2, y: groundY - 34, speed: 75, pts: 80 }
          ];
          const pick = types[Math.floor(Math.random() * types.length)];
          s.enemies.push({
            x: 500, y: pick.y, w: 30, h: 30,
            vx: -pick.speed, hp: pick.hp, emoji: pick.emoji, pts: pick.pts
          });
        }

        // Spawn rare birds for photography
        s.birdTimer -= dt;
        if (s.birdTimer <= 0) {
          s.birdTimer = 3.5 + Math.random() * 2.5;
          const catalog = BIRDS_CATALOG[Math.floor(Math.random() * BIRDS_CATALOG.length)];
          s.birds.push({
            x: 495,
            y: 42 + Math.random() * 75,
            vx: -115,
            catalog,
            snapped: false
          });
        }
      }

      // Spawn Stage Boss
      if (!s.bossSpawned && s.distance >= s.goalDistance) {
        s.bossSpawned = true;
        s.boss = {
          x: 390, y: 170, w: 66, h: 86,
          vy: 70, hp: this.powerTier === 'kolay' ? 8 : 11, maxHp: this.powerTier === 'kolay' ? 8 : 11,
          shootTimer: 1.4
        };
        s.flashMsg = '⚠️ SAVSAKLAMA CANAVARI BOSS GELDİ!';
        s.flashTimer = 2.5;
      }

      // Update Boss
      if (s.boss) {
        const b = s.boss;
        b.y += b.vy * dt;
        if (b.y < 60 || b.y + b.h > groundY) b.vy *= -1;
        b.shootTimer -= dt;
        if (b.shootTimer <= 0) {
          b.shootTimer = 1.65;
          s.enemies.push({
            x: b.x, y: b.y + 30, w: 26, h: 26,
            vx: -185, hp: 1, emoji: '⏰', pts: 25
          });
        }
      }

      // Update Projectiles
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const pr = s.projectiles[i];
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        pr.rot += 12 * dt;

        if (pr.x < -20 || pr.x > 500) {
          s.projectiles.splice(i, 1);
          continue;
        }

        let hit = false;
        // Hit boss
        if (s.boss && pr.x > s.boss.x && pr.x < s.boss.x + s.boss.w && pr.y > s.boss.y && pr.y < s.boss.y + s.boss.h) {
          s.boss.hp -= 1;
          s.score += 50;
          hit = true;
          if (this.cb.onSfx) this.cb.onSfx('hit');
          if (s.boss.hp <= 0) {
            s.score += 400;
            this.finishGame(true, 'Savsaklama Canavarı sıcak kruvasanlarla yenildi!');
            return;
          }
        }

        // Hit enemies
        if (!hit) {
          for (let j = s.enemies.length - 1; j >= 0; j--) {
            const en = s.enemies[j];
            if (pr.x > en.x && pr.x < en.x + en.w && pr.y > en.y && pr.y < en.y + en.h) {
              en.hp -= 1;
              hit = true;
              if (this.cb.onSfx) this.cb.onSfx('hit');
              if (en.hp <= 0) {
                s.score += en.pts;
                s.enemies.splice(j, 1);
              }
              break;
            }
          }
        }

        if (hit) s.projectiles.splice(i, 1);
      }

      // Update Enemies & Player Collision
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const en = s.enemies[i];
        en.x += en.vx * dt;
        if (en.x < -40) {
          s.enemies.splice(i, 1);
          continue;
        }
        if (
          s.invuln <= 0 &&
          p.x < en.x + en.w - 6 &&
          p.x + p.w - 6 > en.x &&
          p.y < en.y + en.h - 4 &&
          p.y + p.h - 4 > en.y
        ) {
          s.hp -= 1;
          s.invuln = 1.2;
          s.enemies.splice(i, 1);
          if (this.cb.onSfx) this.cb.onSfx('hurt');
          if (s.hp <= 0) {
            this.finishGame(false, 'Erteleme canavarları ZeK\'i durdurdu! Tekrar dene!');
            return;
          }
        }
      }

      // Update Birds
      for (let i = s.birds.length - 1; i >= 0; i--) {
        const b = s.birds[i];
        b.x += b.vx * dt;
        b.y += Math.sin(b.x * 0.04) * 35 * dt;
        if (b.x < -40) s.birds.splice(i, 1);
      }

      this.emitHud();
    }

    renderPlatform() {
      const ctx = this.ctx;
      const s = this.state;

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, 360);
      sky.addColorStop(0, '#1e3a8a');
      sky.addColorStop(0.65, '#38bdf8');
      sky.addColorStop(1, '#bae6fd');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 480, 360);

      // Distant hills & bakery silhouette
      ctx.fillStyle = '#065f46';
      for (let i = 0; i < 6; i++) {
        const hx = ((i * 120) - (s.scrollX * 0.25) % 120);
        ctx.beginPath();
        ctx.arc(hx, 308, 75, Math.PI, 0);
        ctx.fill();
      }

      // Ground & Flower strip
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 308, 480, 14);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 322, 480, 38);

      // Platforms
      for (const plat of s.platforms) {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(plat.x, plat.y, plat.w, 4);
      }

      // Birds
      ctx.font = '24px sans-serif';
      for (const b of s.birds) {
        ctx.fillText(b.catalog.emoji, b.x, b.y + 20);
        if (!b.snapped) {
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(b.x - 4, b.y - 2, 30, 26);
        }
      }

      // Enemies
      ctx.font = '26px sans-serif';
      for (const en of s.enemies) {
        ctx.fillText(en.emoji, en.x, en.y + 24);
      }

      // Boss
      if (s.boss) {
        const b = s.boss;
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.font = '42px sans-serif';
        ctx.fillText('👹', b.x + 12, b.y + 52);
        // Boss HP Bar
        ctx.fillStyle = '#111827';
        ctx.fillRect(b.x, b.y - 12, b.w, 8);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(b.x, b.y - 12, b.w * (b.hp / b.maxHp), 8);
      }

      // Croissant Projectiles
      ctx.font = '18px sans-serif';
      for (const pr of s.projectiles) {
        ctx.save();
        ctx.translate(pr.x, pr.y);
        ctx.rotate(pr.rot);
        ctx.fillText('🥐', -9, 7);
        ctx.restore();
      }

      // Player ZeK
      const p = s.player;
      if (s.invuln <= 0 || Math.floor(s.invuln * 15) % 2 === 0) {
        drawZeKSprite(ctx, p.x, p.y, p.w, p.h, p.facingRight, p.walkFrame, this.powerTier === 'zor');
      }

      // Flash message
      if (s.flashTimer > 0 && s.flashMsg) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(40, 12, 400, 28);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 13px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.flashMsg, 240, 31);
        ctx.textAlign = 'left';
      }
    }

    // ================= MODE 2: KUŞ SAFARİSİ =================
    triggerSafariSnap() {
      const s = this.state;
      s.shutterFlash = 0.2;
      if (this.cb.onSfx) this.cb.onSfx('shutter');

      // Check hazard collision first
      for (let i = s.hazards.length - 1; i >= 0; i--) {
        const hz = s.hazards[i];
        const dist = Math.hypot(hz.x - s.reticle.x, hz.y - s.reticle.y);
        if (dist < s.reticle.radius + 12) {
          s.hp -= 1;
          s.hazards.splice(i, 1);
          s.flashMsg = '🐦‍⬛ Karga kadraja girdi! Dikkat!';
          s.flashTimer = 1.2;
          if (this.cb.onSfx) this.cb.onSfx('hurt');
          if (s.hp <= 0) {
            this.finishGame(false, 'Kargalar objektifi kapattı! Tekrar dene!');
          }
          return;
        }
      }

      // Check bird capture (generous 52px mobile tap tolerance)
      for (let i = s.targets.length - 1; i >= 0; i--) {
        const t = s.targets[i];
        const dist = Math.hypot(t.x - s.reticle.x, t.y - s.reticle.y);
        if (dist < Math.max(s.reticle.radius + 18, 52)) {
          s.photosTaken += 1;
          s.score += 150;
          s.flashMsg = `📸 Harika Kare: ${t.catalog.name}!`;
          s.flashTimer = 1.4;
          if (this.cb.onBirdPhotographed) this.cb.onBirdPhotographed(t.catalog);
          s.targets.splice(i, 1);
          if (s.photosTaken >= s.targetPhotos) {
            s.score += Math.round(s.timeLeft * 15);
            this.finishGame(true, `Muhteşem! ${s.photosTaken} nadir kuş karesi çektin!`);
          }
          return;
        }
      }
    }

    updateSafari(dt) {
      const s = this.state;
      s.timeLeft -= dt;
      if (s.shutterFlash > 0) s.shutterFlash -= dt;
      if (s.flashTimer > 0) s.flashTimer -= dt;

      if (s.timeLeft <= 0) {
        this.finishGame(s.photosTaken >= 4, `Süre doldu! ${s.photosTaken} kuş fotoğrafladın.`);
        return;
      }

      // Move reticle via D-Pad
      const speed = 250;
      if (this.keys.left) s.reticle.x -= speed * dt;
      if (this.keys.right) s.reticle.x += speed * dt;
      if (this.keys.up) s.reticle.y -= speed * dt;
      if (this.keys.down) s.reticle.y += speed * dt;
      s.reticle.x = Math.max(24, Math.min(456, s.reticle.x));
      s.reticle.y = Math.max(24, Math.min(336, s.reticle.y));

      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        s.spawnTimer = 0.95;
        if (s.targets.length < 3) {
          const catalog = BIRDS_CATALOG[Math.floor(Math.random() * BIRDS_CATALOG.length)];
          const fromLeft = Math.random() > 0.5;
          s.targets.push({
            x: fromLeft ? -20 : 500,
            y: 52 + Math.random() * 245,
            vx: (fromLeft ? 1 : -1) * (85 + Math.random() * 75),
            catalog
          });
        }
        if (Math.random() < 0.42 && s.hazards.length < 2) {
          const fromLeft = Math.random() > 0.5;
          s.hazards.push({
            x: fromLeft ? -20 : 500,
            y: 60 + Math.random() * 235,
            vx: (fromLeft ? 1 : -1) * 115
          });
        }
      }

      for (let i = s.targets.length - 1; i >= 0; i--) {
        const t = s.targets[i];
        t.x += t.vx * dt;
        t.y += Math.sin(t.x * 0.05) * 40 * dt;
        if (t.x < -40 || t.x > 520) s.targets.splice(i, 1);
      }

      for (let i = s.hazards.length - 1; i >= 0; i--) {
        const hz = s.hazards[i];
        hz.x += hz.vx * dt;
        if (hz.x < -40 || hz.x > 520) s.hazards.splice(i, 1);
      }

      this.emitHud();
    }

    renderSafari() {
      const ctx = this.ctx;
      const s = this.state;

      // Botanical Garden Backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, 360);
      bg.addColorStop(0, '#064e3b');
      bg.addColorStop(0.6, '#047857');
      bg.addColorStop(1, '#14532d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 480, 360);

      // Stylized trees & flowers
      ctx.font = '32px sans-serif';
      ctx.fillText('🌳', 24, 90);
      ctx.fillText('🌿', 120, 315);
      ctx.fillText('🌻', 240, 330);
      ctx.fillText('🌷', 340, 326);
      ctx.fillText('🌲', 420, 95);

      // Birds
      let lockOn = false;
      ctx.font = '30px sans-serif';
      for (const t of s.targets) {
        ctx.fillText(t.catalog.emoji, t.x - 15, t.y + 10);
        if (Math.hypot(t.x - s.reticle.x, t.y - s.reticle.y) < s.reticle.radius + 16) {
          lockOn = true;
        }
      }

      // Crow hazards
      ctx.font = '26px sans-serif';
      for (const hz of s.hazards) {
        ctx.fillText('🐦‍⬛', hz.x - 13, hz.y + 10);
      }

      // DSLR Camera Viewfinder Reticle
      const r = s.reticle;
      ctx.strokeStyle = lockOn ? '#4ade80' : '#f8fafc';
      ctx.lineWidth = lockOn ? 3 : 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(r.x - 10, r.y);
      ctx.lineTo(r.x + 10, r.y);
      ctx.moveTo(r.x, r.y - 10);
      ctx.lineTo(r.x, r.y + 10);
      ctx.stroke();

      // ZeK corner photographer avatar
      drawZeKSprite(ctx, 10, 304, 36, 46, true, 0, false);

      if (s.shutterFlash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${s.shutterFlash * 3})`;
        ctx.fillRect(0, 0, 480, 360);
      }

      if (s.flashTimer > 0 && s.flashMsg) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.fillRect(50, 10, 380, 26);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 13px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.flashMsg, 240, 28);
        ctx.textAlign = 'left';
      }
    }

    // ================= MODE 3: BAHÇE & FIRIN SAVUNMASI =================
    moveDefenseLane(delta) {
      const s = this.state;
      s.playerLane = Math.max(0, Math.min(2, s.playerLane + delta));
    }

    fireDefenseCroissant() {
      const s = this.state;
      const y = s.lanesY[s.playerLane];
      const offsets = this.powerTier === 'zor' ? [-18, 0, 18] : this.powerTier === 'orta' ? [-10, 10] : [0];
      offsets.forEach((dy) => {
        s.projectiles.push({ x: 96, y: y + dy, vx: 340, rot: 0 });
      });
      if (this.cb.onSfx) this.cb.onSfx('throw');
    }

    triggerOvenBlast() {
      const s = this.state;
      if (s.ovenCharge < 70) {
        s.flashMsg = '🔥 Fırın ısısı henüz %70 olmadı!';
        s.flashTimer = 1.0;
        return;
      }
      s.ovenCharge = 0;
      s.blastTimer = 0.45;
      s.score += s.enemies.length * 40;
      s.enemies = [];
      s.flashMsg = '💥 ALTIN FIRIN DALGASI! Tüm kargalar kaçtı!';
      s.flashTimer = 1.5;
      if (this.cb.onSfx) this.cb.onSfx('win');
    }

    updateDefense(dt) {
      const s = this.state;
      s.timeLeft -= dt;
      s.ovenCharge = Math.min(100, s.ovenCharge + dt * 11);
      if (s.blastTimer > 0) s.blastTimer -= dt;
      if (s.flashTimer > 0) s.flashTimer -= dt;

      if (this.pointer && this.pointer.active) {
        this.pointer.holdFireTimer -= dt;
        if (this.pointer.holdFireTimer <= 0) {
          this.pointer.holdFireTimer = 0.35;
          this.fireDefenseCroissant();
        }
      }

      if (s.timeLeft <= 0) {
        this.finishGame(true, this.rescueMode ? 'Harikasın! Tüm kargalar bahçeden kovuldu!' : 'Bahçe ve taş fırın başarıyla korundu!');
        return;
      }

      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        s.spawnTimer = this.rescueMode ? 0.9 : 1.05;
        const lane = Math.floor(Math.random() * 3);
        const isStarter = Math.random() < 0.2;
        if (isStarter) {
          s.starters.push({ x: 490, lane, vx: -105 });
        } else {
          s.enemies.push({
            x: 495,
            lane,
            vx: -(90 + Math.random() * 55),
            emoji: Math.random() > 0.35 ? '🐦‍⬛' : '🐌',
            hp: 1
          });
        }
      }

      // Projectiles
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const pr = s.projectiles[i];
        pr.x += pr.vx * dt;
        pr.rot += 10 * dt;
        if (pr.x > 495) {
          s.projectiles.splice(i, 1);
          continue;
        }
        for (let j = s.enemies.length - 1; j >= 0; j--) {
          const en = s.enemies[j];
          const ey = s.lanesY[en.lane];
          if (Math.abs(pr.x - en.x) < 22 && Math.abs(pr.y - ey) < 26) {
            s.enemies.splice(j, 1);
            s.projectiles.splice(i, 1);
            s.score += 50;
            s.ovenCharge = Math.min(100, s.ovenCharge + 10);
            if (this.cb.onSfx) this.cb.onSfx('hit');
            break;
          }
        }
      }

      // Starters (bonus oven charge)
      for (let i = s.starters.length - 1; i >= 0; i--) {
        const st = s.starters[i];
        st.x += st.vx * dt;
        if (st.lane === s.playerLane && st.x < 98 && st.x > 42) {
          s.ovenCharge = Math.min(100, s.ovenCharge + 28);
          s.score += 65;
          s.starters.splice(i, 1);
          if (this.cb.onSfx) this.cb.onSfx('shutter');
        } else if (st.x < 25) {
          s.starters.splice(i, 1);
        }
      }

      // Enemies reaching flowers on the left
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const en = s.enemies[i];
        en.x += en.vx * dt;
        if (en.x <= 46) {
          s.enemies.splice(i, 1);
          s.hp -= 1;
          if (this.cb.onSfx) this.cb.onSfx('hurt');
          if (s.hp <= 0) {
            this.finishGame(false, 'Kargalar çiçek tarhına ulaştı! Tekrar savun!');
            return;
          }
        }
      }

      this.emitHud();
    }

    renderDefense() {
      const ctx = this.ctx;
      const s = this.state;

      // Garden soil & lanes
      ctx.fillStyle = '#1b2e22';
      ctx.fillRect(0, 0, 480, 360);

      for (let i = 0; i < 3; i++) {
        const ly = s.lanesY[i];
        ctx.fillStyle = i % 2 === 0 ? '#243e2d' : '#1f3627';
        ctx.fillRect(0, ly - 38, 480, 76);
        ctx.font = '26px sans-serif';
        ctx.fillText('🌷', 12, ly + 9);
      }

      // Interactive On-Canvas Stone Oven Blast Button (top-left)
      const ovenReady = s.ovenCharge >= 70;
      ctx.fillStyle = ovenReady ? '#ea580c' : '#431407';
      ctx.strokeStyle = ovenReady ? '#fde047' : '#9a3412';
      ctx.lineWidth = ovenReady ? 2.5 : 1.5;
      ctx.fillRect(10, 10, 140, 42);
      ctx.strokeRect(10, 10, 140, 42);
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.fillText(
        ovenReady ? '💥 FIRINA DOKUN!' : `🔥 FIRIN %${Math.min(100, Math.round(s.ovenCharge))}`,
        20,
        35
      );

      // ZeK
      const zy = s.lanesY[s.playerLane] - 22;
      drawZeKSprite(ctx, 56, zy, 34, 44, true, 0, this.powerTier === 'zor');

      // Projectiles
      ctx.font = '18px sans-serif';
      for (const pr of s.projectiles) {
        ctx.save();
        ctx.translate(pr.x, pr.y);
        ctx.rotate(pr.rot);
        ctx.fillText('🥐', -9, 7);
        ctx.restore();
      }

      // Starters
      ctx.font = '22px sans-serif';
      for (const st of s.starters) {
        ctx.fillText('🥖', st.x - 10, s.lanesY[st.lane] + 8);
      }

      // Enemies
      ctx.font = '26px sans-serif';
      for (const en of s.enemies) {
        ctx.fillText(en.emoji, en.x - 12, s.lanesY[en.lane] + 10);
      }

      if (s.blastTimer > 0) {
        ctx.fillStyle = `rgba(251, 146, 60, ${s.blastTimer * 1.4})`;
        ctx.fillRect(0, 0, 480, 360);
      }

      if (s.flashTimer > 0 && s.flashMsg) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
        ctx.fillRect(160, 14, 308, 30);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 12px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.flashMsg, 314, 33);
        ctx.textAlign = 'left';
      }
    }

    update(dt) {
      if (this.mode === 'platform') this.updatePlatform(dt);
      else if (this.mode === 'safari') this.updateSafari(dt);
      else this.updateDefense(dt);

      for (let i = this.touchEffects.length - 1; i >= 0; i--) {
        const fx = this.touchEffects[i];
        fx.r += 95 * dt;
        fx.alpha -= 2.6 * dt;
        if (fx.alpha <= 0) this.touchEffects.splice(i, 1);
      }
    }

    render() {
      if (this.mode === 'platform') this.renderPlatform();
      else if (this.mode === 'safari') this.renderSafari();
      else this.renderDefense();

      const ctx = this.ctx;
      for (const fx of this.touchEffects) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, fx.alpha);
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  global.ZEK_BIRDS_CATALOG = BIRDS_CATALOG;
  global.ZeKGameEngine = ZeKGameEngine;
  global.drawZeKPortrait = drawZeKPortrait;
})(window);
