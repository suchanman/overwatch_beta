/**
 * ============================================================================
 * OVERWATCH 2 : WEB PROTOCOL - MAIN GAME ENGINE (MULTIPLAYER INTEGRATED)
 * - Three.js 3D WebGL 60FPS Render Pipeline
 * - Real-Time WebSocket Multiplayer Architecture (25Hz replication)
 * - 3D Remote Player Avatars (Tracer, Genji, Reinhardt)
 * - Full compliance with skill.md Game Feel Standards:
 *   * 6-Stage Interaction Lifecycle (0ms input to settle)
 *   * 30~60ms Micro Hit Stop & Hit Flash
 *   * Headshot 'DINK' Audio & Dynamic Hitmarkers (White / Red / Skull)
 *   * Segmented & Trailing Health Bars (Player, Bots, Remote Players)
 *   * Real-time Killfeed, 100🔥 Elimination Banner & Speech Announcer
 *   * TAB Scoreboard (Eliminations, Deaths, HP, Ping)
 *   * Camera Euler Order 'YXZ' (Zero horizon roll / tilt)
 * ============================================================================
 */

import { AudioSynth } from './engine/AudioSynth.js';
import { CameraShaker } from './engine/CameraShaker.js';
import { InputManager } from './engine/InputManager.js';
import { NetworkManager } from './engine/NetworkManager.js';
import { MapBuilder } from './world/MapBuilder.js';
import { ProjectileManager } from './entities/Projectile.js';
import { TrainingBot } from './entities/Bot.js';
import { RemotePlayer } from './entities/RemotePlayer.js';
import { Tracer } from './heroes/Tracer.js';
import { Genji } from './heroes/Genji.js';
import { Reinhardt } from './heroes/Reinhardt.js';
import { UIManager } from './ui/UIManager.js';
import { buildReinhardtModel, buildTracerModel, buildGenjiModel } from './entities/HeroModels.js';

class OverwatchGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

    // 1. Three.js Core Setup (Bright Daylight Atmosphere)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8ecae6); // Fresh bright daylight blue sky
    this.scene.fog = new THREE.Fog(0xbde0fe, 45, 120); // Clean light atmospheric haze

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 200);
    this.camera.rotation.order = 'YXZ'; // MANDATORY: Eliminates camera roll / tilt ("드러 눕는 버그")
    this.camera.position.set(0, 1.7, 10);
    this.scene.add(this.camera); // Ensures camera.children (1st person weapons) are rendered!

    // Dedicated 1st-person viewmodel light so weapons are always brilliantly visible
    this.viewmodelLight = new THREE.PointLight(0xffffff, 1.2, 5.0);
    this.viewmodelLight.position.set(0, 0.2, -0.2);
    this.camera.add(this.viewmodelLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: !this.isTouchDevice, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Mobile DPR Clamping for 60FPS performance (skill.md Performance standard)
    const maxDpr = this.isTouchDevice ? 1.35 : 2.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.isTouchDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 2. Engine Subsystems
    this.audio = new AudioSynth();
    this.shaker = new CameraShaker(this.camera);
    this.input = new InputManager(this.renderer.domElement, this.camera);
    this.network = new NetworkManager();
    this.map = new MapBuilder(this.scene);
    this.projectiles = new ProjectileManager(this.scene);
    this.ui = new UIManager();

    // 3. Player Physics State
    this.playerPos = new THREE.Vector3(0, 1.7, 8);
    this.velocityY = 0;
    this.isGrounded = true;
    this.gravity = -22.0;

    // 4. Hero Roster & Selection
    this.heroes = {
      tracer: new Tracer(),
      genji: new Genji(),
      reinhardt: new Reinhardt()
    };
    this.currentHeroKey = 'tracer';
    this.currentHero = this.heroes.tracer;
    this.attachHeroWeapon(this.currentHero);

    // 5. Training Bots & Remote Players Collection
    this.bots = [];
    this.spawnTrainingBots();
    this.remotePlayers = new Map(); // id -> RemotePlayer

    // 6. Multiplayer Match & Stats
    this.playerNickname = '오버워치요원';
    this.localElims = 0;
    this.localDeaths = 0;
    this.isRespawning = false;
    this.respawnTimer = 0;
    this.allPlayersCache = [];

    // 7. Elimination Announcer Tracker
    this.recentKills = 0;
    this.lastKillTime = 0;

    // 8. Event & Lifecycle Listeners
    this.initNetworking();
    this.initHeroSwitchModal();
    this.initScoreboardModal();
    this.initStartOverlay();
    window.addEventListener('resize', () => this.onWindowResize());

    // 9. Start Game Loop
    this.lastTime = performance.now();
    this.animate();
  }

  spawnTrainingBots() {
    // Spawn 4 Omnic Bots across the arena
    const botCoords = [
      [-6, -6],
      [6, -6],
      [-12, -18],
      [12, -18]
    ];

    botCoords.forEach(([bx, bz], idx) => {
      const bot = new TrainingBot(this.scene, bx, bz, idx + 1);
      this.bots.push(bot);
    });
  }

  getAllCombatTargets() {
    const targets = [...this.bots];
    for (const rp of this.remotePlayers.values()) {
      if (!rp.isDead) {
        targets.push(rp);
      }
    }
    return targets;
  }

  attachHeroWeapon(hero) {
    for (let i = this.camera.children.length - 1; i >= 0; i--) {
      const child = this.camera.children[i];
      if (child !== this.viewmodelLight) {
        this.camera.remove(child);
      }
    }
    this.camera.add(hero.weaponGroup);
  }

  switchHero(heroKey) {
    if (!this.heroes[heroKey] || this.currentHero === this.heroes[heroKey]) return;
    this.currentHeroKey = heroKey;
    this.currentHero = this.heroes[heroKey];
    this.attachHeroWeapon(this.currentHero);

    this.audio.announce(this.currentHero.name);
    this.ui.triggerUltFlash();

    // Broadcast hero change to multiplayer server
    if (this.network.isConnected) {
      this.network.sendHeroSwitch(heroKey);
    }

    // Update touch buttons icons for current hero
    const shiftIcon = document.getElementById('touch-icon-shift');
    const eIcon = document.getElementById('touch-icon-e');
    const altIcon = document.getElementById('touch-icon-alt');
    const altLbl = document.getElementById('touch-lbl-alt');

    if (heroKey === 'tracer') {
      if (shiftIcon) shiftIcon.textContent = '⚡';
      if (eIcon) eIcon.textContent = '⏪';
      if (altIcon) altIcon.textContent = '👊';
      if (altLbl) altLbl.textContent = 'MELEE';
    } else if (heroKey === 'genji') {
      if (shiftIcon) shiftIcon.textContent = '🗡️';
      if (eIcon) eIcon.textContent = '🛡️';
      if (altIcon) altIcon.textContent = '🌟';
      if (altLbl) altLbl.textContent = 'FAN';
    } else if (heroKey === 'reinhardt') {
      if (shiftIcon) shiftIcon.textContent = '🚀';
      if (eIcon) eIcon.textContent = '🔥';
      if (altIcon) altIcon.textContent = '🛡️';
      if (altLbl) altLbl.textContent = 'SHIELD';
    }

    this.updateScoreboard();
  }

  // ==========================================================================
  // MULTIPLAYER NETWORKING EVENT DISPATCHER
  // ==========================================================================
  initNetworking() {
    this.network.onConnected = (selfId, selfPlayer, initialPlayers) => {
      console.log('[OVERWATCH MP] Connected! Self ID:', selfId);
      const dot = document.getElementById('net-status-dot');
      const text = document.getElementById('net-status-text');
      if (dot) {
        dot.className = 'net-dot online';
      }
      if (text) text.textContent = '온라인';

      this.allPlayersCache = initialPlayers || [];

      // Spawn remote players already in match
      if (initialPlayers) {
        initialPlayers.forEach((p) => {
          if (p.id !== selfId && !this.remotePlayers.has(p.id)) {
            const rp = new RemotePlayer(this.scene, p);
            this.remotePlayers.set(p.id, rp);
          }
        });
      }

      this.updatePlayerCount();
      this.updateScoreboard();
    };

    this.network.onPlayerJoined = (player) => {
      if (!this.remotePlayers.has(player.id)) {
        const rp = new RemotePlayer(this.scene, player);
        this.remotePlayers.set(player.id, rp);
        this.ui.addKillfeed('시스템', `${player.name} 참전`, false, '🎮');
        this.audio.playTracerBlink();
        this.updatePlayerCount();
        this.updateScoreboard();
      }
    };

    this.network.onPlayerLeft = (id, name) => {
      const rp = this.remotePlayers.get(id);
      if (rp) {
        rp.destroy();
        this.remotePlayers.delete(id);
        this.ui.addKillfeed('시스템', `${name || '플레이어'} 퇴장`, false, '🚪');
        this.updatePlayerCount();
        this.updateScoreboard();
      }
    };

    this.network.onPlayerUpdated = (player) => {
      let rp = this.remotePlayers.get(player.id);
      if (rp) {
        rp.name = player.name;
        if (player.hero && player.hero !== rp.heroKey) {
          rp.setHero(player.hero, player.maxHp);
        }
        if (player.hp !== undefined) {
          rp.hp = player.hp;
          rp.maxHp = player.maxHp;
          rp.trailingHp = player.hp;
        }
        rp.updateHUDCanvas();
      } else if (player.id !== this.network.selfId) {
        rp = new RemotePlayer(this.scene, player);
        this.remotePlayers.set(player.id, rp);
      }
      this.updateScoreboard();
    };

    this.network.onPlayerHealed = (id, hp, maxHp) => {
      if (id === this.network.selfId) {
        this.currentHero.hp = hp;
        this.currentHero.trailingHp = hp;
      } else {
        const rp = this.remotePlayers.get(id);
        if (rp) {
          rp.hp = hp;
          rp.trailingHp = hp;
          rp.updateHUDCanvas();
        }
      }
      this.updateScoreboard();
    };

    this.network.onStateSync = (id, pos, rot) => {
      const rp = this.remotePlayers.get(id);
      if (rp) {
        rp.setTargetPosition(pos);
        if (rot && rot.length === 2) {
          rp.targetPitch = rot[0];
          rp.targetYaw = rot[1];
        }
      }
    };

    this.network.onHeroSwitched = (id, hero, hp, maxHp) => {
      const rp = this.remotePlayers.get(id);
      if (rp) {
        rp.setHero(hero, maxHp);
      }
      this.updateScoreboard();
    };

    this.network.onPlayerAction = (id, actionType, data) => {
      const rp = this.remotePlayers.get(id);
      if (actionType === 'primary_fire_beam' && data.start && data.end) {
        this.projectiles.addBulletBeam(
          new THREE.Vector3(...data.start),
          new THREE.Vector3(...data.end),
          0x00f0ff
        );
      } else if (actionType === 'blink' && data.from && data.to) {
        this.projectiles.addMotionStreak(
          new THREE.Vector3(...data.from),
          new THREE.Vector3(...data.to),
          0x00f0ff
        );
        this.audio.playTracerBlink();
      } else if (actionType === 'dash' && data.from && data.to) {
        this.projectiles.addMotionStreak(
          new THREE.Vector3(...data.from),
          new THREE.Vector3(...data.to),
          0x00ff88
        );
        this.audio.playGenjiDash();
      } else if (actionType === 'shield_toggle' && rp) {
        rp.setShieldActive(!!data.active);
      }
    };

    this.network.onPlayerHit = (targetId, attackerId, attackerName, damage, isHeadshot, remainingHp) => {
      if (targetId === this.network.selfId) {
        // Local player took damage from someone!
        this.currentHero.takeDamage(damage);
        if (remainingHp !== undefined) {
          this.currentHero.hp = Math.max(0, remainingHp);
        }
        this.audio.playDamage();
        this.shaker.addTrauma(isHeadshot ? 0.35 : 0.18);
        this.ui.triggerDamageFlash();

        if (this.currentHero.hp <= 0 && !this.isRespawning) {
          this.handleLocalPlayerDeath(attackerName);
        }
      } else {
        const rp = this.remotePlayers.get(targetId);
        if (rp) {
          rp.takeDamage(damage, isHeadshot);
          if (remainingHp !== undefined) {
            rp.hp = Math.max(0, remainingHp);
            rp.trailingHp = rp.hp;
            rp.updateHUDCanvas();
          }
          if (remainingHp !== undefined && remainingHp <= 0) {
            rp.setDead(true);
          }
        }
      }
      this.updateScoreboard();
    };

    this.network.onPlayerEliminated = (victimId, victimName, attackerId, attackerName, attackerHero, isHeadshot) => {
      if (victimId === this.network.selfId) {
        this.currentHero.hp = 0;
        this.currentHero.trailingHp = 0;
        if (!this.isRespawning) {
          this.handleLocalPlayerDeath(attackerName);
        }
      } else if (attackerId === this.network.selfId) {
        this.localElims++;
        const elimCountEl = document.getElementById('elim-count');
        if (elimCountEl) elimCountEl.textContent = this.localElims;
        this.handleCombatHit({ name: victimName }, 100, isHeadshot, true);
      } else {
        this.ui.addKillfeed(attackerName, victimName, isHeadshot, '⚡');
      }

      const rp = this.remotePlayers.get(victimId);
      if (rp) {
        rp.setDead(true);
      }
      this.updateScoreboard();
    };

    this.network.onPlayerRespawned = (id, pos, hp) => {
      if (id === this.network.selfId) {
        this.isRespawning = false;
        const respawnOverlay = document.getElementById('respawn-overlay');
        if (respawnOverlay) respawnOverlay.classList.add('hidden');

        // Restore weapon viewmodel
        if (this.currentHero && this.currentHero.weaponGroup) {
          this.currentHero.weaponGroup.visible = true;
        }

        this.playerPos.set(...pos);
        this.currentHero.hp = hp || this.currentHero.maxHp;
        this.currentHero.trailingHp = this.currentHero.hp;
        this.audio.playUltReady();
      } else {
        const rp = this.remotePlayers.get(id);
        if (rp) {
          rp.respawn(pos, hp);
        }
      }
      this.updateScoreboard();
    };

    this.network.onDisconnected = () => {
      const dot = document.getElementById('net-status-dot');
      const text = document.getElementById('net-status-text');
      if (dot) dot.className = 'net-dot offline';
      if (text) text.textContent = '오프라인 모드';
    };
  }

  handleLocalPlayerDeath(killerName) {
    if (this.isRespawning) return;
    this.isRespawning = true;
    this.respawnTimer = 5.0;
    this.localDeaths++;

    this.currentHero.hp = 0;
    this.currentHero.trailingHp = 0;

    const deathCountEl = document.getElementById('death-count');
    if (deathCountEl) deathCountEl.textContent = this.localDeaths;

    this.audio.playDamage();
    this.shaker.addTrauma(0.5);

    // Hide weapon viewmodel so corpse/hands vanish!
    if (this.currentHero && this.currentHero.weaponGroup) {
      this.currentHero.weaponGroup.visible = false;
    }

    const respawnOverlay = document.getElementById('respawn-overlay');
    const killerDesc = document.getElementById('respawn-killer-desc');
    const countdownNum = document.getElementById('respawn-countdown-num');

    if (killerDesc) killerDesc.textContent = `${killerName || '적 요원'}에게 처치되었습니다`;
    if (countdownNum) countdownNum.textContent = '5';
    if (respawnOverlay) respawnOverlay.classList.remove('hidden');

    this.updateScoreboard();
  }

  updatePlayerCount() {
    const el = document.getElementById('player-count');
    if (el) el.textContent = this.remotePlayers.size + 1;
  }

  updateScoreboard() {
    const tbody = document.getElementById('scoreboard-body');
    if (!tbody) return;

    let html = '';

    // 1. Self Row
    const selfDeadClass = this.currentHero.hp <= 0 ? 'dead-row' : '';
    html += `
      <tr class="self-row ${selfDeadClass}">
        <td><span class="hero-pill ${this.currentHeroKey}">${this.currentHeroKey}</span></td>
        <td><strong>${this.playerNickname} (나)</strong></td>
        <td>${this.localElims}</td>
        <td>${this.localDeaths}</td>
        <td>${Math.round(this.currentHero.hp)} / ${this.currentHero.maxHp}</td>
        <td>${this.network.ping || 15}ms</td>
      </tr>
    `;

    // 2. Remote Players Rows
    for (const rp of this.remotePlayers.values()) {
      const deadClass = rp.isDead ? 'dead-row' : '';
      html += `
        <tr class="${deadClass}">
          <td><span class="hero-pill ${rp.heroKey}">${rp.heroKey}</span></td>
          <td>${rp.name}</td>
          <td>-</td>
          <td>-</td>
          <td>${Math.round(rp.hp)} / ${rp.maxHp}</td>
          <td>-</td>
        </tr>
      `;
    }

    tbody.innerHTML = html;

    const pingBadge = document.getElementById('scoreboard-ping-badge');
    if (pingBadge) pingBadge.textContent = `PING: ${this.network.ping || 15}ms`;
  }

  initStartOverlay() {
    const startOverlay = document.getElementById('start-overlay');
    const btnStart = document.getElementById('btn-start-game');
    const heroCards = document.querySelectorAll('.hero-select-card');
    const nickInput = document.getElementById('player-nickname-input');
    const serverInput = document.getElementById('server-url-input');

    this.initLobbyHeroShowcase();

    heroCards.forEach((card) => {
      card.addEventListener('click', () => {
        heroCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const pick = card.getAttribute('data-hero');
        this.switchHero(pick);
        if (this.updateLobbyShowcaseHero) {
          this.updateLobbyShowcaseHero(pick);
        }
      });
    });

    const startGame = () => {
      if (this.stopLobbyShowcase) {
        this.stopLobbyShowcase();
      }
      this.audio.unlock();
      startOverlay.style.display = 'none';
      this.ui.showHUD();

      // Read nickname & custom server url if provided
      if (nickInput && nickInput.value.trim()) {
        this.playerNickname = nickInput.value.trim().slice(0, 16);
      }
      const customUrl = serverInput && serverInput.value.trim() ? serverInput.value.trim() : null;

      // Connect to WebSocket Multiplayer Server
      this.network.connect(customUrl, this.playerNickname, this.currentHeroKey);

      // Mobile landscape orientation request & fullscreen
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        screen.orientation.lock('landscape').catch(() => {});
      }
      if (this.isTouchDevice && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      // On desktop, request pointer lock; on mobile, touch controls are active
      if (!this.isTouchDevice) {
        this.renderer.domElement.requestPointerLock();
      }
    };

    btnStart.addEventListener('click', startGame);

    const btnCopyInvite = document.getElementById('btn-copy-invite');
    if (btnCopyInvite) {
      btnCopyInvite.addEventListener('click', () => {
        this.copyInviteLink(btnCopyInvite);
      });
    }
  }

  // ==========================================================================
  // REAL-TIME 3D LOBBY HERO SHOWCASE
  // ==========================================================================
  initLobbyHeroShowcase() {
    const canvas = document.getElementById('lobby-hero-canvas');
    if (!canvas) return;

    const width = canvas.clientWidth || 540;
    const height = canvas.clientHeight || 250;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.15, 3.4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Atmospheric lighting for showroom
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 2.2);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const goldRim = new THREE.DirectionalLight(0xf59e0b, 1.6);
    goldRim.position.set(3, 1, -2);
    scene.add(goldRim);

    // Studio pedestal disk
    const floorGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.05, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.025;
    scene.add(floor);

    // Glowing border ring
    const ringGeo = new THREE.RingGeometry(1.18, 1.22, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    scene.add(ring);

    const showcaseGroup = new THREE.Group();
    scene.add(showcaseGroup);

    let isDragging = false;
    let prevMouseX = 0;
    let targetRotY = 0;
    let currentRotY = 0;
    let autoRotate = true;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      autoRotate = false;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      targetRotY += dx * 0.015;
      prevMouseX = e.clientX;
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        autoRotate = false;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - prevMouseX;
      targetRotY += dx * 0.015;
      prevMouseX = e.touches[0].clientX;
    }, { passive: true });

    const heroTitle = document.getElementById('lobby-hero-title');

    const loadHero = (heroKey) => {
      while (showcaseGroup.children.length > 0) {
        showcaseGroup.remove(showcaseGroup.children[0]);
      }
      targetRotY = 0;
      currentRotY = 0;

      if (heroKey === 'reinhardt') {
        const data = buildReinhardtModel(showcaseGroup);
        data.rootGroup.rotation.y = 0;
        camera.position.set(0, 1.25, 3.8);
        if (heroTitle) heroTitle.textContent = '라인하르트 (REINHARDT)';
        ringMat.color.setHex(0xf59e0b);
      } else if (heroKey === 'genji') {
        const data = buildGenjiModel(showcaseGroup);
        data.rootGroup.rotation.y = 0;
        camera.position.set(0, 0.95, 3.0);
        if (heroTitle) heroTitle.textContent = '겐지 (GENJI)';
        ringMat.color.setHex(0x55ff22);
      } else {
        const data = buildTracerModel(showcaseGroup);
        data.rootGroup.rotation.y = 0;
        camera.position.set(0, 0.9, 2.9);
        if (heroTitle) heroTitle.textContent = '트레이서 (TRACER)';
        ringMat.color.setHex(0xf97316);
      }
    };

    loadHero(this.currentHeroKey || 'tracer');
    this.updateLobbyShowcaseHero = loadHero;

    let animId = null;
    let isRunning = true;

    const renderShowcase = () => {
      if (!isRunning) return;
      animId = requestAnimationFrame(renderShowcase);

      if (autoRotate && !isDragging) {
        targetRotY += 0.007;
      }
      currentRotY += (targetRotY - currentRotY) * 0.1;
      showcaseGroup.rotation.y = currentRotY;

      renderer.render(scene, camera);
    };
    renderShowcase();

    this.stopLobbyShowcase = () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      renderer.dispose();
    };

    window.addEventListener('resize', () => {
      if (!isRunning || !canvas) return;
      const nw = canvas.clientWidth || 540;
      const nh = canvas.clientHeight || 250;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
    });
  }

  copyInviteLink(btnElement) {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        const origText = btnElement.textContent;
        btnElement.textContent = '✅ 복사 완료!';
        setTimeout(() => {
          btnElement.textContent = origText;
        }, 2000);
      }).catch(() => {
        prompt('아래 전장 접속 링크를 복사하여 친구에게 전달하세요:', url);
      });
    } else {
      prompt('아래 전장 접속 링크를 복사하여 친구에게 전달하세요:', url);
    }
  }

  initHeroSwitchModal() {
    const modal = document.getElementById('hero-switch-modal');
    const switchCards = document.querySelectorAll('.switch-card');

    this.input.onHeroSwitchRequested = (action) => {
      if (action === 'toggle_modal') {
        const isHidden = modal.classList.contains('hidden');
        if (isHidden) {
          modal.classList.remove('hidden');
          if (!this.isTouchDevice) document.exitPointerLock();
        } else {
          modal.classList.add('hidden');
          if (!this.isTouchDevice) this.renderer.domElement.requestPointerLock();
        }
      } else if (action === 'tracer' || action === 'genji' || action === 'reinhardt') {
        this.switchHero(action);
        modal.classList.add('hidden');
        if (!this.isTouchDevice) this.renderer.domElement.requestPointerLock();
      }
    };

    switchCards.forEach((btn) => {
      btn.addEventListener('click', () => {
        const pick = btn.getAttribute('data-pick');
        this.switchHero(pick);
        modal.classList.add('hidden');
        if (!this.isTouchDevice) this.renderer.domElement.requestPointerLock();
      });
    });
  }

  initScoreboardModal() {
    const scoreboardModal = document.getElementById('scoreboard-overlay');
    const btnClose = document.getElementById('btn-close-scoreboard');
    const btnScoreboardCopy = document.getElementById('btn-scoreboard-copy');

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (scoreboardModal) scoreboardModal.classList.add('hidden');
        this.input.keys.tab = false;
      });
    }

    if (btnScoreboardCopy) {
      btnScoreboardCopy.addEventListener('click', () => {
        this.copyInviteLink(btnScoreboardCopy);
      });
    }

    if (scoreboardModal) {
      scoreboardModal.addEventListener('click', (e) => {
        if (e.target === scoreboardModal) {
          scoreboardModal.classList.add('hidden');
          this.input.keys.tab = false;
        }
      });
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ==========================================================================
  // HIT & COMBAT EVENT HANDLER (skill.md 6-Stage Interaction Pipeline)
  // ==========================================================================
  handleCombatHit(target, damageDealt, isHeadshot, isFinalBlow) {
    // 1. Audio Sync: Headshot DINK vs Body Tick (skill.md 13)
    this.audio.playHit(isHeadshot);

    // 2. Micro Hit Stop: 35ms freeze on hit (skill.md 3.1)
    const hitStopDuration = isFinalBlow ? 0.06 : (isHeadshot ? 0.045 : 0.03);
    this.shaker.triggerHitStop(hitStopDuration);

    // 3. Dynamic Hitmarker: White for body, Red for crit, Skull for final blow
    this.ui.showHitmarker(isHeadshot, isFinalBlow);

    // 4. Camera Trauma Kick (skill.md 3.2)
    this.shaker.addTrauma(isHeadshot ? 0.25 : 0.12);

    // 5. Mobile Haptic feedback (skill.md 14)
    if (this.isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(isFinalBlow ? [20, 30, 20] : (isHeadshot ? 18 : 10));
    }

    // 6. Hero Ultimate Charge Gain
    const ultGain = isHeadshot ? 7 : (damageDealt / 20);
    this.currentHero.addUltCharge(ultGain);
    if (this.currentHero.ultCharge >= 100 && !this.currentHero.isUltActive) {
      this.audio.playUltReady();
    }

    // 7. Final Blow & Elimination Sequence (skill.md 5: Continuous Climax)
    if (isFinalBlow) {
      this.audio.playElimination();

      // Flame Elimination Banner & Killfeed
      this.ui.showEliminationBanner(target.name);
      this.ui.addKillfeed(this.currentHero.name, target.name, isHeadshot, '⚡');

      // Hero Passive Notification (e.g. Genji Swift Strike Reset!)
      if (this.currentHero.onEnemyEliminated) {
        this.currentHero.onEnemyEliminated();
      }

      // Multi-kill Announcer Voice
      const now = performance.now();
      if (now - this.lastKillTime < 4500) {
        this.recentKills++;
      } else {
        this.recentKills = 1;
      }
      this.lastKillTime = now;

      if (this.recentKills === 2) this.audio.announce("Double Kill!");
      else if (this.recentKills === 3) this.audio.announce("Triple Kill!");
      else if (this.recentKills >= 4) this.audio.announce("Team Kill!");
    }
  }

  // ==========================================================================
  // MAIN GAME TICK (60FPS)
  // ==========================================================================
  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1; // Clamp delta time

    // 0. Respawn Timer Handling
    if (this.isRespawning) {
      this.respawnTimer -= dt;
      const countdownEl = document.getElementById('respawn-countdown-num');
      if (countdownEl) {
        countdownEl.textContent = Math.max(1, Math.ceil(this.respawnTimer));
      }
      if (this.respawnTimer <= 0) {
        this.isRespawning = false;
        const respawnOverlay = document.getElementById('respawn-overlay');
        if (respawnOverlay) respawnOverlay.classList.add('hidden');

        // Restore weapon viewmodel
        if (this.currentHero && this.currentHero.weaponGroup) {
          this.currentHero.weaponGroup.visible = true;
        }

        // Send respawn packet to server
        this.network.sendRespawn();

        // Local fallback teleport to arena spawn points
        const spawnPoints = [
          [0.0, 1.7, 18.0],
          [-18.0, 1.7, 12.0],
          [18.0, 1.7, 12.0],
          [-22.0, 1.7, -15.0],
          [22.0, 1.7, -15.0],
          [0.0, 1.7, -25.0]
        ];
        const sp = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        this.playerPos.set(sp[0], sp[1], sp[2]);
        this.currentHero.hp = this.currentHero.maxHp;
        this.currentHero.trailingHp = this.currentHero.maxHp;
        this.audio.playUltReady();
      }
    }

    // Check if local player took fatal environmental or sudden damage
    if (this.currentHero.hp <= 0 && !this.isRespawning) {
      this.handleLocalPlayerDeath('전장 위험 요소');
    }

    // Micro Hit Stop: pauses physical updates, maintains visual loop
    const isHitStopped = this.shaker.isHitStopped();
    this.shaker.update(dt);

    const allTargets = this.getAllCombatTargets();

    if (!isHitStopped && !this.isRespawning) {
      // 1. Player Movement & Physics
      this.updatePlayerMovement(dt);

      // 2. Camera Transforms: Update position & Euler 'YXZ' rotation BEFORE combat inputs for 0-latency aim
      this.camera.position.copy(this.playerPos);
      const shake = this.shaker.getShakeOffset();
      this.camera.position.x += shake.posX;
      this.camera.position.y += shake.posY;

      // ENFORCE YXZ EULER ORDER: Completely eliminates camera roll / tilt / lying down!
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.set(
        this.input.pitch + shake.rotX,
        this.input.yaw + shake.rotY,
        shake.rotZ * 0.12,
        'YXZ'
      );
      this.camera.updateMatrixWorld(true);

      // 3. Network Movement Send (25Hz Throttled)
      this.network.sendMovement(this.playerPos, this.input.pitch, this.input.yaw);

      // 4. Weapon Firing & Ability Inputs (Using freshly updated camera aim)
      this.handleCombatInputs(allTargets);

      // 5. Hero Update (Guaranteed consistent arguments across all heroes)
      this.currentHero.update(
        dt,
        this.playerPos,
        this.camera,
        this.projectiles,
        this.audio,
        allTargets,
        (target, dmg, head, kill) => {
          if (target.id) {
            this.network.sendHit(target.id, dmg, head);
          }
          if (kill && (target instanceof RemotePlayer || target.id)) {
            target.setDead(true); // Corpse immediately vanishes!
          }
          this.handleCombatHit(target, dmg, head, kill);
        },
        this.shaker,
        this.map
      );

      // 6. Projectiles Update (against bots and remote players) with Map Wall Collisions
      this.projectiles.update(dt, allTargets, (target, dmg, head, kill) => {
        if (target instanceof RemotePlayer) {
          if (target.id) {
            this.network.sendHit(target.id, dmg, head);
          }
          this.audio.playHit(head);
          this.ui.showHitmarker(head, false);
        } else {
          this.handleCombatHit(target, dmg, head, kill);
        }
      }, this.map);

      // 7. Bots Update & AI
      this.bots.forEach((bot) => bot.update(dt, this.playerPos));

      // 8. Health Packs Check
      this.map.update(dt, this.playerPos, (healAmount) => {
        const healed = this.currentHero.heal(healAmount);
        if (healed) {
          this.audio.playTracerBlink();
          if (this.network.isConnected) {
            this.network.sendHeal(healAmount);
          }
        }
        return healed;
      });
    }

    // 9. Remote Players 3D Update (Smooth Lerp & Billboards)
    this.remotePlayers.forEach((rp) => rp.update(dt, this.camera));

    // 10. Overwatch 2 TAB Scoreboard Display
    const scoreboardModal = document.getElementById('scoreboard-overlay');
    if (scoreboardModal) {
      if (this.input.keys.tab) {
        scoreboardModal.classList.remove('hidden');
        this.updateScoreboard();
      } else {
        scoreboardModal.classList.add('hidden');
      }
    }

    // 11. Ping display in HUD
    const pingEl = document.getElementById('net-ping-text');
    if (pingEl && this.network.isConnected) {
      pingEl.textContent = `${this.network.ping}ms`;
    }

    // 12. Update Overwatch 2 HUD
    this.ui.update(this.currentHero);

    // 13. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  updatePlayerMovement(dt) {
    const move = this.input.getMovementVector();

    // Calculate forward/right vectors from yaw
    const forward = new THREE.Vector3(-Math.sin(this.input.yaw), 0, -Math.cos(this.input.yaw));
    const right = new THREE.Vector3(Math.cos(this.input.yaw), 0, -Math.sin(this.input.yaw));

    const moveVelocity = new THREE.Vector3();
    moveVelocity.addScaledVector(forward, -move.z);
    moveVelocity.addScaledVector(right, move.x);

    // Apply Speed (disable standard movement integration during Charge, Blink, or Swift Strike)
    if (this.currentHero.isCharging || this.currentHero.isBlinking || this.currentHero.isDashing) {
      moveVelocity.set(0, 0, 0);
    }
    this.playerPos.addScaledVector(moveVelocity, this.currentHero.speed * dt);

    // 1. Resolve 3D Obstacle & Platform Collisions (Prevents passing through pillars, barricades, crates, walls)
    const colResult = this.map.resolveCollision(this.playerPos, 0.55);

    // 2. Gravity & Jump
    this.velocityY += this.gravity * dt;
    this.playerPos.y += this.velocityY * dt;

    // 3. Multi-level Ground Collision (Floor level 1.7m vs Balcony 5.7m vs Ramp)
    if (this.playerPos.y <= colResult.groundY) {
      this.playerPos.y = colResult.groundY;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    if (this.input.keys.jump && this.isGrounded) {
      this.velocityY = this.currentHero.jumpForce;
      this.isGrounded = false;
    }

    // 4. Secondary safety collision check after vertical update
    this.map.resolveCollision(this.playerPos, 0.55);
  }

  handleCombatInputs(allTargets) {
    // Allow input if pointer is locked on desktop OR if running on touch device
    const canInput = this.input.isLocked || this.input.isTouchDevice;
    if (!canInput) return;

    // Primary Fire (Left Click / Touch Fire)
    if (this.input.keys.primaryFire) {
      const hitResult = this.currentHero.primaryFire(
        this.camera,
        this.scene,
        this.projectiles,
        this.audio,
        this.shaker
      );

      if (hitResult) {
        if (hitResult.raycaster) {
          // Hitscan Raycasting (Tracer)
          const hits = [];
          allTargets.forEach((target) => {
            if (target.isDead) return;
            const targetMeshes = target.hitMeshes || [target.bodyMesh, target.headMesh];
            const intersects = hitResult.raycaster.intersectObjects(targetMeshes, true);
            if (intersects.length > 0) {
              hits.push({ target, intersect: intersects[0] });
            }
          });

          // Broadcast primary fire beam to other players
          const rayOrigin = this.camera.position.clone();
          const rayDir = hitResult.raycaster.ray.direction.clone();
          const beamEnd = rayOrigin.clone().addScaledVector(rayDir, 35);
          this.network.sendAction('primary_fire_beam', {
            start: [rayOrigin.x, rayOrigin.y - 0.2, rayOrigin.z],
            end: [beamEnd.x, beamEnd.y, beamEnd.z]
          });

          if (hits.length > 0) {
            hits.sort((a, b) => a.intersect.distance - b.intersect.distance);
            const target = hits[0].target;
            const hitObject = hits[0].intersect.object;

            if (hitObject.userData && hitObject.userData.isShield) {
              // Hit Reinhardt barrier shield!
              this.audio.playHit(false);
              this.ui.showHitmarker(false, false);
            } else {
              const isHead = hitObject.userData && hitObject.userData.isHead;
              const dmg = isHead ? hitResult.damage * hitResult.isHeadshotMultiplier : hitResult.damage;
              const hitDir = hitResult.raycaster.ray.direction.clone();

              if (target instanceof RemotePlayer) {
                target.takeDamage(dmg, isHead);
                if (target.id) {
                  this.network.sendHit(target.id, dmg, isHead);
                }
                this.audio.playHit(isHead);
                this.ui.showHitmarker(isHead, false);
                this.shaker.addTrauma(isHead ? 0.25 : 0.12);
              } else {
                const finalBlow = target.takeDamage(dmg, isHead, hitDir);
                this.handleCombatHit(target, dmg, isHead, finalBlow);
              }
            }
          }
        } else if (hitResult.isHammer || hitResult.isDragonblade) {
          // Melee Cleave Arc (Reinhardt Rocket Hammer / Genji Dragonblade)
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
          forward.y = 0;
          forward.normalize();

          allTargets.forEach((target) => {
            if (target.isDead) return;
            const dist = target.group.position.distanceTo(this.playerPos);
            if (dist <= hitResult.range) {
              const toTarget = target.group.position.clone().sub(this.playerPos).normalize();
              const dot = forward.dot(toTarget);
              if (dot > 0.25) { // ~75 degree cleave angle
                if (target instanceof RemotePlayer) {
                  target.takeDamage(hitResult.damage, false);
                  if (target.id) {
                    this.network.sendHit(target.id, hitResult.damage, false);
                  }
                  this.audio.playHit(false);
                  this.ui.showHitmarker(false, false);
                  this.shaker.addTrauma(0.12);
                } else {
                  const finalBlow = target.takeDamage(hitResult.damage, false, forward);
                  this.handleCombatHit(target, hitResult.damage, false, finalBlow);
                }
              }
            }
          });
        }
      }
    }

    // Secondary Fire (Right Click)
    if (this.input.keys.secondaryFire) {
      if (this.currentHero.name === 'REINHARDT') {
        if (!this.currentHero.isShieldActive) {
          this.network.sendAction('shield_toggle', { active: true });
        }
        this.currentHero.setShieldActive(true, this.audio);
      } else if (this.currentHero.secondaryFire) {
        this.currentHero.secondaryFire(
          this.camera,
          this.scene,
          this.projectiles,
          this.audio,
          this.shaker
        );
      }
    } else {
      if (this.currentHero.name === 'REINHARDT') {
        if (this.currentHero.isShieldActive) {
          this.network.sendAction('shield_toggle', { active: false });
        }
        this.currentHero.setShieldActive(false, this.audio);
      }
    }

    // Ability 1 (Shift)
    if (this.input.keys.shift) {
      this.input.keys.shift = false; // Trigger once
      const moveDir = this.input.getMovementVector();
      const prevPos = this.playerPos.clone();

      this.currentHero.useAbility1(
        this.playerPos,
        moveDir,
        this.camera,
        this.audio,
        this.shaker,
        allTargets,
        (target, dmg, head, kill) => {
          if (target.id) {
            this.network.sendHit(target.id, dmg, head);
          }
          this.handleCombatHit(target, dmg, head, kill);
        },
        this.projectiles
      );

      // Replicate movement abilities across network
      if (this.currentHero.name === 'TRACER') {
        this.network.sendAction('blink', {
          from: [prevPos.x, prevPos.y, prevPos.z],
          to: [this.playerPos.x, this.playerPos.y, this.playerPos.z]
        });
      } else if (this.currentHero.name === 'GENJI') {
        this.network.sendAction('dash', {
          from: [prevPos.x, prevPos.y, prevPos.z],
          to: [this.playerPos.x, this.playerPos.y, this.playerPos.z]
        });
      }
    }

    // Ability 2 (E)
    if (this.input.keys.e) {
      this.input.keys.e = false;
      this.currentHero.useAbility2(
        this.playerPos,
        this.camera,
        this.audio,
        this.shaker,
        this.ui,
        this.projectiles
      );
    }

    // Ultimate (Q)
    if (this.input.keys.q) {
      this.input.keys.q = false;
      this.currentHero.useUltimate(
        this.camera,
        this.projectiles,
        this.audio,
        this.shaker,
        this.ui,
        allTargets,
        (target, dmg, head, kill) => {
          if (target.id) {
            this.network.sendHit(target.id, dmg, head);
          }
          this.handleCombatHit(target, dmg, head, kill);
        }
      );
    }

    // Reload (R)
    if (this.input.keys.r) {
      this.input.keys.r = false;
      this.currentHero.startReload(this.audio);
    }
  }
}

// Instantiate Game on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new OverwatchGame();
});
