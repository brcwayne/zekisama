(function () {
  'use strict';

  const STORAGE_KEY = 'zek_gorev_kavanozu_v1';

  const DIFFICULTY_MAP = {
    kolay: {
      label: '🥐 Kruvasan (Kolay)',
      short: '🥐 Kolay',
      xp: 100,
      gold: 20,
      tickets: 1,
      seeds: 1,
      penaltyGold: 20,
      powerLabel: '🥐 Normal Atış'
    },
    orta: {
      label: '🥖 Ekşi Maya (Orta)',
      short: '🥖 Orta',
      xp: 250,
      gold: 45,
      tickets: 1,
      seeds: 2,
      penaltyGold: 40,
      powerLabel: '🥖 Çift Kruvasan Atışı'
    },
    zor: {
      label: '🎂 Özel Tatlı (Zor)',
      short: '🎂 Zor',
      xp: 500,
      gold: 90,
      tickets: 2,
      seeds: 3,
      penaltyGold: 60,
      powerLabel: '🎂 Süper Kalkan + 3\'lü Atış'
    }
  };

  const FLOWER_TYPES = [
    { name: 'Ayçiçeği', stages: ['🌱', '🌿', 'Bud', '🌻'] },
    { name: 'Lale', stages: ['🌱', '🌿', '🌷', '🌷'] },
    { name: 'Lavanta', stages: ['🌱', '🌿', '🪻', '🪻'] },
    { name: 'Papatya', stages: ['🌱', '🌿', '🌼', '🌼'] },
    { name: 'Kırmızı Gül', stages: ['🌱', '🌿', '🥀', '🌹'] },
    { name: 'Nilüfer', stages: ['🌱', '🌿', '🪷', '🪷'] }
  ];

  const RECIPES_CATALOG = [
    { id: 'altin_kruvasan', name: 'Altın Tereyağlı Kruvasan', emoji: '🥐', reqTasks: 0, desc: 'ZeK\'in imza lezzeti. Her zaman açık!' },
    { id: 'eksi_maya', name: 'Taş Fırın Ekşi Maya Ekmek', emoji: '🍞', reqTasks: 3, desc: '3 görev tamamlayınca açılır.' },
    { id: 'bogurtlen_tart', name: 'Bahçe Böğürtlenli Tart', emoji: '🥧', reqTasks: 7, desc: '7 görev tamamlayınca açılır.' },
    { id: 'tarcin_corek', name: 'Tarçınlı Rulo Çörek', emoji: '🥨', reqTasks: 12, desc: '12 görev tamamlayınca açılır.' },
    { id: 'badem_galette', name: 'Çıtır Bademli Galette', emoji: '🍰', reqTasks: 20, desc: '20 görev tamamlayınca açılır.' },
    { id: 'sef_pandoro', name: 'Şefin Efsanevi Kral Pandoro\'su', emoji: '🎂', reqTasks: 35, desc: '35 görevi tamamlayarak efsane ol!' }
  ];

  const STARTER_POOL = [
    { title: '15 dakika çalışma masasını toparla', category: 'Günlük', difficulty: 'kolay', durationMin: 15 },
    { title: 'Bahçedeki çiçekleri sula ve kurumuş yaprakları al', category: 'Bahçe', difficulty: 'kolay', durationMin: 15 },
    { title: 'Mutfak tezgahını temizle ve fırını hazırla', category: 'Mutfak', difficulty: 'kolay', durationMin: 15 },
    { title: 'Bekleyen 3 önemli e-postaya veya mesaja cevap ver', category: 'Günlük', difficulty: 'orta', durationMin: 30 },
    { title: 'Ekşi maya hamurunu yoğur veya hamur besle', category: 'Mutfak', difficulty: 'orta', durationMin: 30 },
    { title: 'Kuş fotoğrafçılığı ekipmanını temizle ve pilleri şarj et', category: 'Doğa', difficulty: 'kolay', durationMin: 15 },
    { title: 'Haftalık fatura ve bütçe kontrolünü bitir', category: 'Günlük', difficulty: 'zor', durationMin: 45 },
    { title: 'Balkonda veya parkta 20 dk yürüyüş ve kuş gözlemi yap', category: 'Doğa', difficulty: 'orta', durationMin: 30 },
    { title: 'Buzdolabını düzenle ve tarihi geçmişleri ayır', category: 'Mutfak', difficulty: 'orta', durationMin: 30 },
    { title: 'Saksı toprağını havalandır ve yeni tohum ek', category: 'Bahçe', difficulty: 'kolay', durationMin: 15 },
    { title: 'Çamaşırları katla ve dolaba yerleştir', category: 'Günlük', difficulty: 'kolay', durationMin: 15 },
    { title: 'Tereyağlı kruvasan hamurunu katla ve dinlendir', category: 'Mutfak', difficulty: 'zor', durationMin: 45 },
    { title: 'Telefonundaki gereksiz 50 fotoğrafı sil', category: 'Günlük', difficulty: 'kolay', durationMin: 15 },
    { title: 'Çektiğin son doğa fotoğraflarını düzenle ve yedekle', category: 'Doğa', difficulty: 'orta', durationMin: 30 },
    { title: 'Yarının yapılacaklar listesini 3 maddeyle yaz', category: 'Günlük', difficulty: 'kolay', durationMin: 15 },
    { title: 'Mutfağa taze nane veya fesleğen fidesi dik', category: 'Bahçe', difficulty: 'orta', durationMin: 30 },
    { title: 'Su şişeni doldur ve 15 dk odaklanarak kitap oku', category: 'Günlük', difficulty: 'kolay', durationMin: 15 },
    { title: 'Fırın tepsilerini ve kalıpları derinlemesine temizle', category: 'Mutfak', difficulty: 'orta', durationMin: 30 },
    { title: 'Ertelediğin o tek telefon görüşmesini hemen yap', category: 'Günlük', difficulty: 'zor', durationMin: 30 },
    { title: 'Bahçedeki yabani otları 20 dakika temizle', category: 'Bahçe', difficulty: 'orta', durationMin: 30 },
    { title: 'Sabah kahvaltısı için taze hamur mayala', category: 'Mutfak', difficulty: 'kolay', durationMin: 15 },
    { title: 'Kuşlar için bahçeye su ve yem kabı koy', category: 'Doğa', difficulty: 'kolay', durationMin: 15 },
    { title: 'Yatak odasını havalandır ve yatak örtüsünü düzelt', category: 'Günlük', difficulty: 'kolay', durationMin: 15 },
    { title: 'Un ve kuru gıda kavanozlarını etiketle', category: 'Mutfak', difficulty: 'orta', durationMin: 30 },
    { title: 'Büyük bir projeyi 30 dakika kesintisiz ilerlet', category: 'Günlük', difficulty: 'zor', durationMin: 45 },
    { title: 'Çiçeklere doğal kompost veya besin ver', category: 'Bahçe', difficulty: 'kolay', durationMin: 15 },
    { title: 'Yeni bir tatlı veya ekmek tarifi not al', category: 'Mutfak', difficulty: 'kolay', durationMin: 15 },
    { title: 'Dışarıda gördüğün 2 farklı kuş türünü kaydet', category: 'Doğa', difficulty: 'orta', durationMin: 30 },
    { title: 'Evin girişini ve ayakkabılığı düzenle', category: 'Günlük', difficulty: 'kolay', durationMin: 15 },
    { title: 'Derin odaklanma: 45 dk telefonsuz üretken çalışma', category: 'Günlük', difficulty: 'zor', durationMin: 45 },
    { title: 'Bahçe aletlerini temizle ve yerine as', category: 'Bahçe', difficulty: 'kolay', durationMin: 15 },
    { title: 'Tarçınlı çörek veya tart hamuru hazırla', category: 'Mutfak', difficulty: 'zor', durationMin: 45 },
    { title: 'Kütüphane veya çalışma rafını düzenle', category: 'Günlük', difficulty: 'orta', durationMin: 30 },
    { title: 'Akşam yemeği sonrası mutfağı tertemiz bırak', category: 'Mutfak', difficulty: 'kolay', durationMin: 15 },
    { title: 'Haftalık ödül günü için en sevdiğin çayı demle ve dinlen', category: 'Günlük', difficulty: 'kolay', durationMin: 15 }
  ];

  // Retro 16-bit Web Audio Synthesizer
  class RetroAudio {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    ensureCtx() {
      if (!this.enabled) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    tone(freq, dur, type = 'square', gainVal = 0.08, slideTo = null) {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur);
    }

    play(name) {
      if (!this.enabled) return;
      switch (name) {
        case 'shake':
          this.tone(240, 0.08, 'triangle', 0.08, 420);
          setTimeout(() => this.tone(320, 0.08, 'triangle', 0.08, 520), 90);
          break;
        case 'jump':
          this.tone(280, 0.14, 'square', 0.07, 560);
          break;
        case 'throw':
          this.tone(460, 0.09, 'sawtooth', 0.05, 220);
          break;
        case 'shutter':
          this.tone(920, 0.05, 'triangle', 0.09, 640);
          setTimeout(() => this.tone(1180, 0.06, 'sine', 0.08), 50);
          break;
        case 'hit':
          this.tone(190, 0.1, 'square', 0.08, 95);
          break;
        case 'hurt':
          this.tone(170, 0.22, 'sawtooth', 0.1, 75);
          break;
        case 'win':
          [523, 659, 784, 1046].forEach((f, idx) => {
            setTimeout(() => this.tone(f, 0.16, 'square', 0.07), idx * 90);
          });
          break;
        case 'alarm':
          [310, 220, 310, 180].forEach((f, idx) => {
            setTimeout(() => this.tone(f, 0.18, 'sawtooth', 0.09), idx * 140);
          });
          break;
        default:
          this.tone(520, 0.05, 'sine', 0.04);
      }
    }
  }

  function createDefaultState() {
    const initialTasks = STARTER_POOL.slice(0, 8).map((item, idx) => ({
      id: `starter-${Date.now()}-${idx}`,
      ...item,
      createdAt: Date.now()
    }));

    const plots = Array.from({ length: 12 }, (_, idx) => {
      const f = FLOWER_TYPES[idx % FLOWER_TYPES.length];
      return {
        id: idx,
        flowerName: f.name,
        typeIdx: idx % FLOWER_TYPES.length,
        stage: idx < 3 ? 2 : idx < 5 ? 1 : 0, // 0=empty, 1=seed, 2=sprout, 3=bud, 4=bloom
        wilted: false
      };
    });

    return {
      player: {
        level: 1,
        xp: 0,
        gold: 30,
        tickets: 1,
        streak: 0,
        completedCount: 0,
        activePower: 'kolay',
        portraitMode: 'photo', // 'photo' | 'pixel'
        soundEnabled: true
      },
      gardenInvaded: false,
      lastPenaltyAmount: 20,
      tasks: initialTasks,
      completedTasks: [],
      activeTask: null,
      gardenPlots: plots,
      birdsAlbum: {} // birdId -> count
    };
  }

  function loadLocalState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      return { ...createDefaultState(), ...parsed };
    } catch {
      return createDefaultState();
    }
  }

  let state = loadLocalState();
  let drawnCandidate = null;
  let timerInterval = null;
  let currentView = 'jar';
  let selectedArenaMode = 'platform';
  let serverSyncAvailable = false;

  const sfx = new RetroAudio();
  sfx.enabled = state.player.soundEnabled !== false;

  // DOM References
  const els = {
    hudLevel: document.getElementById('hudLevel'),
    hudXpBar: document.getElementById('hudXpBar'),
    hudXpText: document.getElementById('hudXpText'),
    hudGold: document.getElementById('hudGold'),
    hudTickets: document.getElementById('hudTickets'),
    hudStreak: document.getElementById('hudStreak'),
    syncStatusPill: document.getElementById('syncStatusPill'),
    serverSyncDetail: document.getElementById('serverSyncDetail'),
    hudAvatarImg: document.getElementById('hudAvatarImg'),
    hudAvatarPixel: document.getElementById('hudAvatarPixel'),
    avatarToggleBtn: document.getElementById('avatarToggleBtn'),
    speechPhoto: document.getElementById('speechPhoto'),
    zekSpeechText: document.getElementById('zekSpeechText'),
    invasionBanner: document.getElementById('invasionBanner'),
    bannerRescueGameBtn: document.getElementById('bannerRescueGameBtn'),
    bannerTelafiBtn: document.getElementById('bannerTelafiBtn'),
    activeOvenCard: document.getElementById('activeOvenCard'),
    activeTaskBadge: document.getElementById('activeTaskBadge'),
    activeTaskCategory: document.getElementById('activeTaskCategory'),
    activeTaskTitle: document.getElementById('activeTaskTitle'),
    doughSprite: document.getElementById('doughSprite'),
    timerDigits: document.getElementById('timerDigits'),
    timerProgressBar: document.getElementById('timerProgressBar'),
    timerSubtext: document.getElementById('timerSubtext'),
    completeTaskBtn: document.getElementById('completeTaskBtn'),
    fastForwardTimerBtn: document.getElementById('fastForwardTimerBtn'),
    cancelActiveTaskBtn: document.getElementById('cancelActiveTaskBtn'),
    jarStage: document.getElementById('jarStage'),
    jarSlipsContainer: document.getElementById('jarSlipsContainer'),
    jarCounterText: document.getElementById('jarCounterText'),
    jarProgressBadge: document.getElementById('jarProgressBadge'),
    drawTaskBtn: document.getElementById('drawTaskBtn'),
    openNewTaskBtn: document.getElementById('openNewTaskBtn'),
    fillStarterPackBtn: document.getElementById('fillStarterPackBtn'),
    pendingCountBadge: document.getElementById('pendingCountBadge'),
    pendingTaskList: document.getElementById('pendingTaskList'),
    arenaPowerSubtitle: document.getElementById('arenaPowerSubtitle'),
    arenaTicketsCount: document.getElementById('arenaTicketsCount'),
    modeSelector: document.getElementById('modeSelector'),
    gameCanvas: document.getElementById('gameCanvas'),
    canvasOverlay: document.getElementById('canvasOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayDesc: document.getElementById('overlayDesc'),
    startTicketGameBtn: document.getElementById('startTicketGameBtn'),
    startPracticeGameBtn: document.getElementById('startPracticeGameBtn'),
    gameHudHearts: document.getElementById('gameHudHearts'),
    gameHudScore: document.getElementById('gameHudScore'),
    gameHudGoal: document.getElementById('gameHudGoal'),
    touchGuideBar: document.getElementById('touchGuideBar'),
    gardenStatusText: document.getElementById('gardenStatusText'),
    gardenGrid: document.getElementById('gardenGrid'),
    plantSeedBtn: document.getElementById('plantSeedBtn'),
    birdsCountBadge: document.getElementById('birdsCountBadge'),
    birdAlbumGrid: document.getElementById('birdAlbumGrid'),
    recipesCountBadge: document.getElementById('recipesCountBadge'),
    recipeList: document.getElementById('recipeList'),
    mapProgressBadge: document.getElementById('mapProgressBadge'),
    adventureMap: document.getElementById('adventureMap'),
    completedHistoryList: document.getElementById('completedHistoryList'),
    taskModal: document.getElementById('taskModal'),
    newTaskForm: document.getElementById('newTaskForm'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    drawnTaskModal: document.getElementById('drawnTaskModal'),
    drawnDiffBadge: document.getElementById('drawnDiffBadge'),
    drawnDurBadge: document.getElementById('drawnDurBadge'),
    drawnTitleText: document.getElementById('drawnTitleText'),
    drawnRewardPreview: document.getElementById('drawnRewardPreview'),
    acceptDrawnTaskBtn: document.getElementById('acceptDrawnTaskBtn'),
    redrawTaskBtn: document.getElementById('redrawTaskBtn'),
    outcomeModal: document.getElementById('outcomeModal'),
    outcomeModalTitle: document.getElementById('outcomeModalTitle'),
    outcomeBody: document.getElementById('outcomeBody'),
    outcomeActions: document.getElementById('outcomeActions'),
    settingsModal: document.getElementById('settingsModal'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    toggleSoundBtn: document.getElementById('toggleSoundBtn'),
    togglePortraitBtn: document.getElementById('togglePortraitBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    importDataInput: document.getElementById('importDataInput'),
    resetAllBtn: document.getElementById('resetAllBtn')
  };

  // Save State (Local + Optional Synology Backend)
  async function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
    if (serverSyncAvailable) {
      try {
        await fetch('./api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state)
        });
      } catch {
        // silent fallback to local
      }
    }
  }

  async function initServerSync() {
    if (window.location.protocol === 'file:') return;
    try {
      const res = await fetch('./api/state', { method: 'GET', cache: 'no-store' });
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      serverSyncAvailable = true;
      if (data && data.player && typeof data.player.xp === 'number') {
        // Prefer server state if it has more progress or local was empty
        if ((data.player.completedCount || 0) >= (state.player.completedCount || 0)) {
          state = { ...createDefaultState(), ...data };
        }
      } else {
        await persistState();
      }
      renderAll();
    } catch {
      serverSyncAvailable = false;
    } finally {
      updateSyncLabels();
    }
  }

  function updateSyncLabels() {
    if (serverSyncAvailable) {
      els.syncStatusPill.textContent = '🟢 Synology';
      els.serverSyncDetail.textContent = 'Synology /api/state otomatik yedekleme aktif';
    } else {
      els.syncStatusPill.textContent = '💾 Yerel';
      els.serverSyncDetail.textContent = 'Tarayıcı hafızası (GitHub Pages / PWA modu)';
    }
  }

  // XP & Level Calculations
  function xpForLevel(lvl) {
    return lvl * 200;
  }

  function addXp(amount) {
    state.player.xp += amount;
    while (state.player.xp >= xpForLevel(state.player.level)) {
      state.player.xp -= xpForLevel(state.player.level);
      state.player.level += 1;
      state.player.tickets += 1;
    }
  }

  // Modern Web Guidance: <dialog> light-dismiss fallback & returnValue reset
  function setupDialogs() {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      document.querySelectorAll('dialog[closedby="any"]').forEach((dialog) => {
        dialog.addEventListener('click', (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (isDialogContent) return;
          dialog.close();
        });
      });
    }

    document.querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('close', () => {
        dialog.returnValue = '';
      });
    });

    document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.getAttribute('data-close-dialog'));
        if (target && target.open) target.close();
      });
    });
  }

  // Navigation
  function switchView(viewName) {
    currentView = viewName;
    document.querySelectorAll('.view').forEach((v) => {
      v.classList.toggle('active', v.id === `view-${viewName}`);
    });
    document.querySelectorAll('.nav-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-view') === viewName);
    });
    if (viewName !== 'arena' && gameEngine.running) {
      gameEngine.stop();
      els.canvasOverlay.classList.remove('hidden');
    }
    if (viewName === 'arena') {
      updateArenaOverlayCopy();
    }
  }

  // Render Functions
  function renderHud() {
    const p = state.player;
    const needed = xpForLevel(p.level);
    const pct = Math.min(100, Math.round((p.xp / needed) * 100));

    els.hudLevel.textContent = `Sv.${p.level}`;
    els.hudXpBar.style.width = `${pct}%`;
    els.hudXpText.textContent = `${p.xp} / ${needed} XP`;
    els.hudGold.textContent = p.gold;
    els.hudTickets.textContent = p.tickets;
    els.hudStreak.textContent = p.streak;
    els.arenaTicketsCount.textContent = p.tickets;

    const powerInfo = DIFFICULTY_MAP[p.activePower] || DIFFICULTY_MAP.kolay;
    els.arenaPowerSubtitle.textContent = `Aktif Şef Gücü: ${powerInfo.powerLabel}`;

    const isPixel = p.portraitMode === 'pixel';
    els.hudAvatarImg.classList.toggle('hidden', isPixel);
    els.hudAvatarPixel.classList.toggle('hidden', !isPixel);
    if (isPixel && window.drawZeKPortrait) {
      window.drawZeKPortrait(els.hudAvatarPixel);
    }

    els.toggleSoundBtn.textContent = p.soundEnabled ? '🔊 Açık' : '🔇 Kapalı';
    els.togglePortraitBtn.textContent = isPixel ? '🕹️ 16-Bit' : '📷 Gerçek';

    els.invasionBanner.classList.toggle('hidden', !state.gardenInvaded);
  }

  function renderJar() {
    const totalDone = state.player.completedCount;
    const pending = state.tasks.length;
    els.jarCounterText.textContent = `${totalDone} / 35 Görev Tamamlandı • Kavanozda ${pending} görev bekliyor`;
    els.jarProgressBadge.textContent = `${Math.min(35, totalDone)}/35`;
    els.pendingCountBadge.textContent = pending;

    // Render colorful folded slips inside the glass jar (cap visual slips at 35)
    els.jarSlipsContainer.innerHTML = '';
    const colors = ['#fcd34d', '#fb923c', '#34d399', '#38bdf8', '#f472b6', '#c084fc'];
    const visualCount = Math.min(35, pending);
    for (let i = 0; i < visualCount; i++) {
      const slip = document.createElement('div');
      slip.className = 'jar-slip';
      slip.style.backgroundColor = colors[i % colors.length];
      slip.style.transform = `rotate(${((i * 17) % 24) - 12}deg)`;
      els.jarSlipsContainer.appendChild(slip);
    }

    // Render task list
    els.pendingTaskList.innerHTML = '';
    if (pending === 0) {
      const empty = document.createElement('li');
      empty.className = 'task-item';
      empty.innerHTML = '<div class="task-item-info"><div class="task-item-title">Kavanoz boş!</div><div class="task-item-meta">Yeni görev ekle veya "35\'e Tamamla" butonuna dokun.</div></div>';
      els.pendingTaskList.appendChild(empty);
      return;
    }

    state.tasks.forEach((task) => {
      const diff = DIFFICULTY_MAP[task.difficulty] || DIFFICULTY_MAP.kolay;
      const durText = task.durationMin < 1 ? `${Math.round(task.durationMin * 60)} sn` : `${task.durationMin} dk`;
      const li = document.createElement('li');
      li.className = 'task-item';

      const info = document.createElement('div');
      info.className = 'task-item-info';
      const title = document.createElement('div');
      title.className = 'task-item-title';
      title.textContent = task.title;
      const meta = document.createElement('div');
      meta.className = 'task-item-meta';
      meta.textContent = `${diff.short} • ${task.category} • ⏱️ ${durText}`;
      info.appendChild(title);
      info.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'task-item-actions';

      const startBtn = document.createElement('button');
      startBtn.type = 'button';
      startBtn.className = 'btn btn-primary btn-sm';
      startBtn.textContent = 'Başla';
      startBtn.addEventListener('click', () => startTask(task.id));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-ghost btn-sm';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Görevi sil');
      delBtn.addEventListener('click', () => {
        state.tasks = state.tasks.filter((t) => t.id !== task.id);
        persistState();
        renderAll();
      });

      actions.appendChild(startBtn);
      actions.appendChild(delBtn);
      li.appendChild(info);
      li.appendChild(actions);
      els.pendingTaskList.appendChild(li);
    });
  }

  function renderGardenAndAlbum() {
    if (state.gardenInvaded) {
      els.gardenStatusText.textContent = 'DİKKAT! Kargalar çiçekleri gagalıyor! Hemen Kurtarma Aksiyonuna gir veya 5 dk telafi yap!';
    } else {
      els.gardenStatusText.textContent = 'Bahçen güvende! Tamamladığın her görev çiçekleri büyütür ve nadir kuşlar çeker.';
    }

    // 12 Plots
    els.gardenGrid.innerHTML = '';
    state.gardenPlots.forEach((plot) => {
      const f = FLOWER_TYPES[plot.typeIdx % FLOWER_TYPES.length];
      const div = document.createElement('div');
      div.className = `garden-plot${plot.wilted ? ' wilted' : ''}`;
      let emoji = '🟫';
      if (plot.wilted) emoji = '🥀';
      else if (plot.stage === 1) emoji = '🌱';
      else if (plot.stage === 2) emoji = '🌿';
      else if (plot.stage === 3) emoji = '🪴';
      else if (plot.stage >= 4) emoji = f.stages[3];

      const stageNames = ['Boş Toprak', 'Tohum', 'Filiz', 'Tomurcuk', 'Tam Çiçek!'];
      div.innerHTML = `
        <span class="plot-emoji">${emoji}</span>
        <span class="plot-name">${plot.wilted ? 'Solmuş!' : plot.stage === 0 ? 'Boş Parsel' : f.name}</span>
        <span class="plot-name">${plot.wilted ? 'Telafi Gerek' : stageNames[Math.min(4, plot.stage)]}</span>
      `;
      els.gardenGrid.appendChild(div);
    });

    // 12 Birds Album
    const catalog = window.ZEK_BIRDS_CATALOG || [];
    const unlockedCount = Object.keys(state.birdsAlbum).length;
    els.birdsCountBadge.textContent = `${unlockedCount} / ${catalog.length}`;

    els.birdAlbumGrid.innerHTML = '';
    catalog.forEach((bird) => {
      const count = state.birdsAlbum[bird.id] || 0;
      const card = document.createElement('div');
      card.className = `bird-card ${count > 0 ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="bird-emoji">${bird.emoji}</div>
        <div class="bird-name">${count > 0 ? bird.name : '???'}</div>
        <div class="bird-rarity">${count > 0 ? `${bird.rarity} • ${count}x` : bird.rarity}</div>
      `;
      els.birdAlbumGrid.appendChild(card);
    });

    // 6 Bakery Recipes
    let unlockedRecipes = 0;
    els.recipeList.innerHTML = '';
    RECIPES_CATALOG.forEach((rec) => {
      const unlocked = state.player.completedCount >= rec.reqTasks;
      if (unlocked) unlockedRecipes++;
      const row = document.createElement('div');
      row.className = `recipe-item ${unlocked ? 'unlocked' : ''}`;
      row.innerHTML = `
        <div>
          <strong>${rec.emoji} ${rec.name}</strong>
          <div class="task-item-meta">${rec.desc}</div>
        </div>
        <span class="badge-count">${unlocked ? '✅ Açık' : `🔒 ${rec.reqTasks}`}</span>
      `;
      els.recipeList.appendChild(row);
    });
    els.recipesCountBadge.textContent = `${unlockedRecipes} / ${RECIPES_CATALOG.length}`;
  }

  function renderMap() {
    const done = state.player.completedCount;
    els.mapProgressBadge.textContent = `${Math.min(35, done)} / 35`;
    els.adventureMap.innerHTML = '';

    for (let i = 1; i <= 35; i++) {
      const node = document.createElement('div');
      const isDone = i <= done;
      const isCurrent = i === done + 1;
      const isMilestone = i % 5 === 0;
      node.className = `map-node${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}${isMilestone ? ' milestone' : ''}`;
      node.innerHTML = `
        <span>${isDone ? '✅' : isCurrent ? '🧑‍🍳' : i}</span>
        <small>${i}. Gün</small>
      `;
      els.adventureMap.appendChild(node);
    }

    els.completedHistoryList.innerHTML = '';
    if (state.completedTasks.length === 0) {
      els.completedHistoryList.innerHTML = '<li class="task-item"><div class="task-item-meta">Henüz tamamlanan görev yok. İlk görevini fırına at!</div></li>';
      return;
    }

    state.completedTasks.slice(0, 10).forEach((ct) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      const diff = DIFFICULTY_MAP[ct.difficulty] || DIFFICULTY_MAP.kolay;
      li.innerHTML = `
        <div class="task-item-info">
          <div class="task-item-title">✅ ${ct.title}</div>
          <div class="task-item-meta">${diff.short} • +${diff.xp} XP</div>
        </div>
      `;
      els.completedHistoryList.appendChild(li);
    });
  }

  function renderActiveOven() {
    if (!state.activeTask) {
      els.activeOvenCard.classList.add('hidden');
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      return;
    }

    const at = state.activeTask;
    const diff = DIFFICULTY_MAP[at.task.difficulty] || DIFFICULTY_MAP.kolay;
    els.activeOvenCard.classList.remove('hidden');
    els.activeTaskBadge.textContent = at.isRedemption ? '⏱️ Kurtarma Görevi' : diff.short;
    els.activeTaskCategory.textContent = at.task.category;
    els.activeTaskTitle.textContent = at.task.title;
    els.doughSprite.textContent = at.task.difficulty === 'zor' ? '🎂' : at.task.difficulty === 'orta' ? '🥖' : '🥐';

    updateTimerTick();
    if (!timerInterval) {
      timerInterval = setInterval(updateTimerTick, 250);
    }
  }

  function updateTimerTick() {
    if (!state.activeTask) return;
    const now = Date.now();
    const remainMs = Math.max(0, state.activeTask.endTs - now);
    const totalMs = Math.max(1000, state.activeTask.totalMs);
    const pctLeft = (remainMs / totalMs) * 100;
    const elapsedPct = 1 - remainMs / totalMs;

    const totalSec = Math.ceil(remainMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    els.timerDigits.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    els.timerProgressBar.style.width = `${pctLeft}%`;

    // Dough rises & browns dynamically
    const scale = 0.85 + elapsedPct * 0.45;
    els.doughSprite.style.transform = `scale(${scale.toFixed(2)})`;
    if (pctLeft < 20) {
      els.doughSprite.style.filter = 'sepia(0.8) saturate(1.5)';
      els.timerSubtext.textContent = '🔥 ACELE ET! Hamur kızarmaya başladı, yanmak üzere!';
    } else {
      els.doughSprite.style.filter = 'none';
      els.timerSubtext.textContent = 'Hamur kabarıyor... Süre bitmeden fırından çıkar!';
    }

    if (remainMs <= 0) {
      handleTaskTimeout();
    }
  }

  function renderAll() {
    renderHud();
    renderActiveOven();
    renderJar();
    renderGardenAndAlbum();
    renderMap();
  }

  // Task Actions
  function drawRandomTask() {
    if (state.activeTask) {
      els.zekSpeechText.textContent = 'Şu an fırında zaten pişen bir görev var! Önce onu bitir.';
      return;
    }
    if (state.tasks.length === 0) {
      els.zekSpeechText.textContent = 'Kavanoz boş! Yeni görev ekle veya "35\'e Tamamla" butonuna bas.';
      return;
    }

    sfx.play('shake');
    els.jarStage.classList.remove('shaking');
    void els.jarStage.offsetWidth;
    els.jarStage.classList.add('shaking');

    setTimeout(() => {
      const idx = Math.floor(Math.random() * state.tasks.length);
      drawnCandidate = state.tasks[idx];
      showDrawnModal(drawnCandidate);
    }, 520);
  }

  function showDrawnModal(task) {
    const diff = DIFFICULTY_MAP[task.difficulty] || DIFFICULTY_MAP.kolay;
    const durText = task.durationMin < 1 ? `${Math.round(task.durationMin * 60)} sn` : `${task.durationMin} dk`;
    els.drawnDiffBadge.textContent = diff.label;
    els.drawnDurBadge.textContent = `⏱️ ${durText}`;
    els.drawnTitleText.textContent = task.title;
    els.drawnRewardPreview.textContent = `Ödül: +${diff.xp} XP, +${diff.gold} Altın Kruvasan, +${diff.tickets} Aksiyon Bileti`;
    els.drawnTaskModal.showModal();
  }

  function startTask(taskId, isRedemption = false) {
    if (state.activeTask) return;
    let taskObj;
    if (isRedemption) {
      taskObj = {
        id: `rescue-${Date.now()}`,
        title: '5 Dakikalık Hızlı Bahçe & Fırın Temizliği',
        category: 'Bahçe',
        difficulty: 'kolay',
        durationMin: 5
      };
    } else {
      const idx = state.tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) return;
      taskObj = state.tasks.splice(idx, 1)[0];
    }

    const totalMs = Math.max(5000, Math.round(taskObj.durationMin * 60 * 1000));
    const now = Date.now();
    state.activeTask = {
      task: taskObj,
      startTs: now,
      endTs: now + totalMs,
      totalMs,
      isRedemption
    };
    els.zekSpeechText.textContent = `Fırın yandı! "${taskObj.title}" görevi başladı. Süre dolmadan bitir!`;
    persistState();
    renderAll();
  }

  function completeActiveTask() {
    if (!state.activeTask) return;
    const { task, isRedemption } = state.activeTask;
    state.activeTask = null;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    sfx.play('win');

    if (isRedemption) {
      state.gardenInvaded = false;
      state.gardenPlots.forEach((pl) => { pl.wilted = false; });
      addXp(80);
      state.player.gold += 15;
      showOutcomeModal({
        won: true,
        hero: '🧹✨',
        title: 'Bahçe & Fırın Kurtarıldı!',
        message: 'Hızlı telafi görevini bitirdin! Kargalar kaçtı ve solan çiçeklerin canlandı.',
        chips: ['+80 XP', '+15 🥐', '🌷 Bahçe Temizlendi']
      });
    } else {
      const diff = DIFFICULTY_MAP[task.difficulty] || DIFFICULTY_MAP.kolay;
      addXp(diff.xp);
      state.player.gold += diff.gold;
      state.player.tickets += diff.tickets;
      state.player.streak += 1;
      state.player.completedCount += 1;
      state.player.activePower = task.difficulty;

      // Grow garden flowers by +1 stage
      let grown = 0;
      for (const plot of state.gardenPlots) {
        if (!plot.wilted && plot.stage > 0 && plot.stage < 4 && grown < diff.seeds) {
          plot.stage += 1;
          grown++;
        } else if (plot.stage === 0 && grown < diff.seeds) {
          plot.stage = 1;
          grown++;
        }
      }

      state.completedTasks.unshift({
        ...task,
        completedAt: Date.now()
      });

      showOutcomeModal({
        won: true,
        hero: '🥐🏆',
        title: 'Nefis! Görev Fırından Çıktı!',
        message: `"${task.title}" başarıyla tamamlandı! Şef gücün ${diff.powerLabel} olarak güncellendi.`,
        chips: [`+${diff.xp} XP`, `+${diff.gold} 🥐`, `+${diff.tickets} 🎟️ Bilet`, `🌱 +${diff.seeds} Çiçek Büyümesi`]
      });
    }

    persistState();
    renderAll();
  }

  function handleTaskTimeout() {
    if (!state.activeTask) return;
    const { task } = state.activeTask;
    state.activeTask = null;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    sfx.play('alarm');

    const diff = DIFFICULTY_MAP[task.difficulty] || DIFFICULTY_MAP.kolay;
    const goldLost = Math.min(state.player.gold, diff.penaltyGold);
    state.player.gold -= goldLost;
    state.player.streak = 0;
    state.gardenInvaded = true;
    state.lastPenaltyAmount = diff.penaltyGold;

    // Wilt up to 2 grown plots
    let wiltedCount = 0;
    for (const plot of state.gardenPlots) {
      if (plot.stage > 0 && !plot.wilted && wiltedCount < 2) {
        plot.wilted = true;
        plot.stage = Math.max(1, plot.stage - 1);
        wiltedCount++;
      }
    }

    // Put task back in jar so nothing is lost
    state.tasks.unshift(task);

    showOutcomeModal({
      won: false,
      hero: '🐦‍⬛🔥',
      title: 'EYVAH! Hamur Yandı & Kargalar Bastı!',
      message: `"${task.title}" süresi içinde bitmedi! Fırındaki hamur yandı, kargalar bahçeye indi ve ${goldLost} Altın Kruvasan kaybettin. Görev tekrar kavanoza kondu.`,
      chips: [`-${goldLost} 🥐`, '🥀 Çiçekler Soldu', '🔥 Seri Sıfırlandı'],
      isPenalty: true
    });

    persistState();
    renderAll();
  }

  function showOutcomeModal(opts) {
    els.outcomeModalTitle.textContent = opts.title;
    els.outcomeBody.innerHTML = `
      <div class="outcome-hero">${opts.hero}</div>
      <p>${opts.message}</p>
      <div class="reward-chips">
        ${opts.chips.map((c) => `<span class="reward-chip">${c}</span>`).join('')}
      </div>
    `;

    els.outcomeActions.innerHTML = '';
    if (opts.isPenalty) {
      const rescueBtn = document.createElement('button');
      rescueBtn.type = 'button';
      rescueBtn.className = 'btn btn-danger btn-lg';
      rescueBtn.textContent = '⚔️ Acil Bahçe Savunması Oyna (Kargaları Kov!)';
      rescueBtn.addEventListener('click', () => {
        els.outcomeModal.close();
        launchRescueDefense();
      });

      const telafiBtn = document.createElement('button');
      telafiBtn.type = 'button';
      telafiBtn.className = 'btn btn-warning';
      telafiBtn.textContent = '⏱️ 5 Dakikalık Hızlı Telafi Görevi Yap';
      telafiBtn.addEventListener('click', () => {
        els.outcomeModal.close();
        startTask(null, true);
      });

      els.outcomeActions.appendChild(rescueBtn);
      els.outcomeActions.appendChild(telafiBtn);
    } else {
      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'btn btn-primary btn-lg';
      playBtn.textContent = '🎮 Hemen Aksiyon Bölümünü Oyna!';
      playBtn.addEventListener('click', () => {
        els.outcomeModal.close();
        switchView('arena');
      });

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn btn-secondary';
      closeBtn.textContent = '🏺 Kavanoza Dön';
      closeBtn.addEventListener('click', () => els.outcomeModal.close());

      els.outcomeActions.appendChild(playBtn);
      els.outcomeActions.appendChild(closeBtn);
    }

    els.outcomeModal.showModal();
  }

  // Action Arena Integration
  const gameEngine = new window.ZeKGameEngine(els.gameCanvas, {
    onSfx: (name) => sfx.play(name),
    onHudUpdate: (hud) => {
      els.gameHudHearts.textContent = '❤️'.repeat(Math.max(0, hud.hp));
      els.gameHudScore.textContent = `Skor: ${hud.score}`;
      els.gameHudGoal.textContent = hud.goalText;
    },
    onBirdPhotographed: (birdCatalog) => {
      state.birdsAlbum[birdCatalog.id] = (state.birdsAlbum[birdCatalog.id] || 0) + 1;
      persistState();
      renderGardenAndAlbum();
    },
    onGameEnd: (result) => {
      els.canvasOverlay.classList.remove('hidden');
      if (result.won) {
        sfx.play('win');
        const bonusGold = result.ticketUsed ? Math.max(15, Math.round(result.score / 15)) : 5;
        const bonusXp = result.ticketUsed ? 120 : 20;
        state.player.gold += bonusGold;
        addXp(bonusXp);

        if (result.rescueMode && state.gardenInvaded) {
          state.gardenInvaded = false;
          state.gardenPlots.forEach((pl) => { pl.wilted = false; });
        }

        els.overlayTitle.textContent = '🏆 Bölüm Tamamlandı!';
        els.overlayDesc.textContent = `${result.reason} (+${bonusXp} XP, +${bonusGold} 🥐 kazandın!)`;
      } else {
        sfx.play('hurt');
        els.overlayTitle.textContent = '💥 Tur Bitti!';
        els.overlayDesc.textContent = result.reason;
      }
      persistState();
      renderAll();
    }
  });

  function updateArenaOverlayCopy() {
    const info = {
      platform: {
        title: 'Kruvasan Protokolü (16-Bit)',
        desc: 'Ekrana dokunarak zıpla ve kruvasan fırlat, parmağını kaydırarak ZeK\'i yönlendir, uçan kuşların üzerine dokunup fotoğrafla!',
        guide: '👆 Dokun: Zıpla & Kruvasan At • 🐦 Kuşa Dokun: 📸 Foto Çek • ↔️ Kaydır: Hareket'
      },
      safari: {
        title: 'Kuş Fotoğrafçısı Safarisi',
        desc: 'Nadir kuşların üzerine doğrudan dokunarak fotoğraf çek! Kargalara dokunmamaya dikkat et.',
        guide: '🐦 Kuşların Üzerine Doğrudan Dokun: 📸 Odakla & Fotoğraf Çek!'
      },
      defense: {
        title: 'Fırın & Bahçe Savunması',
        desc: 'Kargaların bulunduğu şeride dokunarak ZeK\'i oraya geçir ve kruvasan at! Fırın %70 olunca sol üstteki fırına dokun.',
        guide: '👆 Şeride / Kargaya Dokun: Geç & Fırlat • 🔥 Sol Üst Fırına Dokun: Süper Dalga'
      }
    }[selectedArenaMode];

    els.overlayTitle.textContent = info.title;
    els.overlayDesc.textContent = info.desc;
    if (els.touchGuideBar) {
      els.touchGuideBar.textContent = info.guide;
    }
  }

  function startArenaGame(useTicket, rescueMode = false) {
    if (useTicket && !rescueMode) {
      if (state.player.tickets <= 0) {
        els.overlayTitle.textContent = '🎟️ Biletin Kalmadı!';
        els.overlayDesc.textContent = 'Yeni bilet kazanmak için Kavanozdan bir görev tamamla veya Ücretsiz Antrenman oyna!';
        return;
      }
      state.player.tickets -= 1;
      persistState();
      renderHud();
    }
    els.canvasOverlay.classList.add('hidden');
    gameEngine.start({
      mode: selectedArenaMode,
      powerTier: state.player.activePower || 'kolay',
      ticketUsed: useTicket,
      rescueMode
    });
  }

  function launchRescueDefense() {
    selectedArenaMode = 'defense';
    els.modeSelector.querySelectorAll('.mode-card').forEach((c) => {
      c.classList.toggle('active', c.getAttribute('data-mode') === 'defense');
    });
    updateArenaOverlayCopy();
    switchView('arena');
    startArenaGame(false, true);
  }

  // Event Bindings
  function bindEvents() {
    // Bottom nav
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchView(btn.getAttribute('data-view')));
    });

    // Portrait mode toggle
    els.avatarToggleBtn.addEventListener('click', () => {
      state.player.portraitMode = state.player.portraitMode === 'photo' ? 'pixel' : 'photo';
      persistState();
      renderHud();
    });

    // Jar actions
    els.drawTaskBtn.addEventListener('click', drawRandomTask);
    els.openNewTaskBtn.addEventListener('click', () => els.taskModal.showModal());

    els.fillStarterPackBtn.addEventListener('click', () => {
      const existingTitles = new Set(state.tasks.map((t) => t.title));
      let added = 0;
      for (const item of STARTER_POOL) {
        if (state.tasks.length >= 35) break;
        if (!existingTitles.has(item.title)) {
          state.tasks.push({
            id: `pack-${Date.now()}-${added}`,
            ...item,
            createdAt: Date.now()
          });
          added++;
        }
      }
      sfx.play('shake');
      els.zekSpeechText.textContent = added > 0
        ? `Harika! Kavanoza ${added} yeni görev kağıdı eklendi. Toplam ${state.tasks.length} görev hazır!`
        : 'Kavanozda zaten 35 görev var! Çalkalayıp başlayabilirsin.';
      persistState();
      renderAll();
    });

    // New Task Form
    els.newTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = els.taskTitleInput.value.trim();
      if (!title) return;
      const category = new FormData(els.newTaskForm).get('category') || 'Günlük';
      const difficulty = new FormData(els.newTaskForm).get('difficulty') || 'kolay';
      const durationMin = parseFloat(new FormData(els.newTaskForm).get('duration')) || 15;

      state.tasks.unshift({
        id: `custom-${Date.now()}`,
        title,
        category,
        difficulty,
        durationMin,
        createdAt: Date.now()
      });

      els.newTaskForm.reset();
      els.taskModal.close();
      sfx.play('shutter');
      persistState();
      renderAll();
    });

    // Drawn Task Modal
    els.acceptDrawnTaskBtn.addEventListener('click', () => {
      if (!drawnCandidate) return;
      const id = drawnCandidate.id;
      drawnCandidate = null;
      els.drawnTaskModal.close();
      startTask(id, false);
    });

    els.redrawTaskBtn.addEventListener('click', () => {
      els.drawnTaskModal.close();
      drawRandomTask();
    });

    // Active Oven Controls
    els.completeTaskBtn.addEventListener('click', completeActiveTask);
    els.fastForwardTimerBtn.addEventListener('click', () => {
      if (!state.activeTask) return;
      state.activeTask.endTs = Date.now() + 3000;
      updateTimerTick();
    });
    els.cancelActiveTaskBtn.addEventListener('click', () => {
      if (!state.activeTask) return;
      if (!state.activeTask.isRedemption) {
        state.tasks.unshift(state.activeTask.task);
      }
      state.activeTask = null;
      persistState();
      renderAll();
    });

    // Invasion Banner Buttons
    els.bannerRescueGameBtn.addEventListener('click', launchRescueDefense);
    els.bannerTelafiBtn.addEventListener('click', () => startTask(null, true));

    // Arena Mode Selector
    els.modeSelector.querySelectorAll('.mode-card').forEach((card) => {
      card.addEventListener('click', () => {
        selectedArenaMode = card.getAttribute('data-mode');
        els.modeSelector.querySelectorAll('.mode-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        if (gameEngine.running) gameEngine.stop();
        els.canvasOverlay.classList.remove('hidden');
        updateArenaOverlayCopy();
      });
    });

    els.startTicketGameBtn.addEventListener('click', () => startArenaGame(true, false));
    els.startPracticeGameBtn.addEventListener('click', () => startArenaGame(false, false));

    // Garden Plant Seed
    els.plantSeedBtn.addEventListener('click', () => {
      if (state.player.gold < 10) {
        els.gardenStatusText.textContent = 'Yeni tohum ekmek için en az 10 Altın Kruvasan (🥐) lazım!';
        return;
      }
      const target = state.gardenPlots.find((p) => p.stage === 0) || state.gardenPlots.find((p) => p.stage < 4);
      if (!target) {
        els.gardenStatusText.textContent = 'Tüm tarhlar şimdiden tam çiçek açmış! Muhteşem bahçe!';
        return;
      }
      state.player.gold -= 10;
      target.wilted = false;
      target.stage = Math.min(4, target.stage + 1);
      sfx.play('win');
      persistState();
      renderAll();
    });

    // Settings Modal
    els.openSettingsBtn.addEventListener('click', () => els.settingsModal.showModal());
    els.toggleSoundBtn.addEventListener('click', () => {
      state.player.soundEnabled = !state.player.soundEnabled;
      sfx.enabled = state.player.soundEnabled;
      persistState();
      renderHud();
    });
    els.togglePortraitBtn.addEventListener('click', () => {
      state.player.portraitMode = state.player.portraitMode === 'photo' ? 'pixel' : 'photo';
      persistState();
      renderHud();
    });
    els.exportDataBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zek-kavanoz-yedek-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
    els.importDataInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          if (imported && imported.player) {
            state = { ...createDefaultState(), ...imported };
            persistState();
            renderAll();
            els.settingsModal.close();
          }
        } catch {
          // ignore invalid json
        }
      };
      reader.readAsText(file);
    });
    els.resetAllBtn.addEventListener('click', () => {
      state = createDefaultState();
      persistState();
      renderAll();
      els.settingsModal.close();
    });
  }

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  setupDialogs();
  bindEvents();
  renderAll();
  initServerSync();
})();
