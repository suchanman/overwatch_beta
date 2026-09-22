/**
 * ============================================================================
 * NETWORK MANAGER (NetworkManager.js)
 * - Pure Native Browser WebSocket Client (Zero External Dependencies)
 * - 25Hz Movement Throttling for Optimized Bandwidth
 * - Automatic Ping/Pong Latency Tracking
 * - Event Dispatcher for Real-time Multiplayer Replication
 * ============================================================================
 */

export class NetworkManager {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.selfId = null;
    this.ping = 0;

    // Movement send throttle (25Hz = 40ms)
    this.lastSendTime = 0;
    this.sendInterval = 40; // ms
    this.lastSentPos = [0, 0, 0];
    this.lastSentRot = [0, 0];

    // Ping interval
    this.pingIntervalTimer = null;

    // Callbacks
    this.onConnected = null;
    this.onDisconnected = null;
    this.onPlayerJoined = null;
    this.onPlayerLeft = null;
    this.onPlayerUpdated = null;
    this.onStateSync = null;
    this.onHeroSwitched = null;
    this.onPlayerAction = null;
    this.onPlayerHit = null;
    this.onPlayerEliminated = null;
    this.onPlayerRespawned = null;
  }

  getDefaultServerUrl() {
    // 1. Check URL Query Parameter: ?server=ws://...
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const customServer = params.get('server');
      if (customServer) return customServer;
    }

    // 2. Browser HTTP/HTTPS environment (Unified Port & WSS for Cloudflare/Render)
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      const isSecure = window.location.protocol === 'https:';
      const wsProto = isSecure ? 'wss:' : 'ws:';
      // Unified single-port: location.host automatically preserves port or domain
      return `${wsProto}//${window.location.host}`;
    }

    // 3. Fallback for local file://
    return 'ws://localhost:8000';
  }

  connect(serverUrl = null, nickname = '플레이어', initialHero = 'tracer') {
    if (this.isConnected || this.isConnecting) return;

    const url = serverUrl || this.getDefaultServerUrl();
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      console.warn('[NETWORK] WebSocket connection failed:', e);
      this.isConnecting = false;
      if (this.onDisconnected) this.onDisconnected('연결 실패 (오프라인 모드)');
      return;
    }

    this.ws.onopen = () => {
      this.isConnected = true;
      this.isConnecting = false;
      console.log(`[NETWORK] Connected to server: ${url}`);

      // Send join request
      this.send({
        type: 'join',
        name: nickname,
        hero: initialHero
      });

      // Start ping loop (every 2.5s)
      this.pingIntervalTimer = setInterval(() => {
        if (this.isConnected) {
          this.send({ type: 'ping', t: performance.now() });
        }
      }, 2500);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (err) {
        console.error('[NETWORK] Parse error:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.warn('[NETWORK] Error:', err);
    };

    this.ws.onclose = () => {
      console.log('[NETWORK] Disconnected from server');
      this.isConnected = false;
      this.isConnecting = false;
      this.selfId = null;
      if (this.pingIntervalTimer) clearInterval(this.pingIntervalTimer);
      if (this.onDisconnected) this.onDisconnected();
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'init':
        this.selfId = data.selfId;
        if (this.onConnected) this.onConnected(data.selfId, data.player, data.players);
        break;

      case 'player_joined':
        if (data.player && data.player.id !== this.selfId) {
          if (this.onPlayerJoined) this.onPlayerJoined(data.player);
        }
        break;

      case 'player_left':
        if (this.onPlayerLeft) this.onPlayerLeft(data.id, data.name);
        break;

      case 'player_updated':
        if (this.onPlayerUpdated) this.onPlayerUpdated(data.player);
        break;

      case 'state_sync':
        if (data.id !== this.selfId) {
          if (this.onStateSync) this.onStateSync(data.id, data.pos, data.rot);
        }
        break;

      case 'hero_switched':
        if (this.onHeroSwitched) this.onHeroSwitched(data.id, data.hero, data.hp, data.maxHp);
        break;

      case 'player_action':
        if (data.id !== this.selfId) {
          if (this.onPlayerAction) this.onPlayerAction(data.id, data.actionType, data.data);
        }
        break;

      case 'player_hit':
        if (this.onPlayerHit) {
          this.onPlayerHit(
            data.targetId,
            data.attackerId,
            data.attackerName,
            data.damage,
            data.isHeadshot,
            data.remainingHp
          );
        }
        break;

      case 'player_eliminated':
        if (this.onPlayerEliminated) {
          this.onPlayerEliminated(
            data.victimId,
            data.victimName,
            data.attackerId,
            data.attackerName,
            data.attackerHero,
            data.isHeadshot
          );
        }
        break;

      case 'player_respawned':
        if (this.onPlayerRespawned) {
          this.onPlayerRespawned(data.id, data.pos, data.hp);
        }
        break;

      case 'pong':
        this.ping = Math.round(performance.now() - data.t);
        break;
    }
  }

  send(obj) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  sendMovement(pos, pitch, yaw) {
    if (!this.isConnected) return;
    const now = performance.now();
    if (now - this.lastSendTime < this.sendInterval) return;

    // Check if moved or rotated significantly
    const dx = Math.abs(pos.x - this.lastSentPos[0]);
    const dy = Math.abs(pos.y - this.lastSentPos[1]);
    const dz = Math.abs(pos.z - this.lastSentPos[2]);
    const dp = Math.abs(pitch - this.lastSentRot[0]);
    const dr = Math.abs(yaw - this.lastSentRot[1]);

    if (dx > 0.01 || dy > 0.01 || dz > 0.01 || dp > 0.01 || dr > 0.01) {
      this.lastSendTime = now;
      this.lastSentPos = [pos.x, pos.y, pos.z];
      this.lastSentRot = [pitch, yaw];

      this.send({
        type: 'move',
        pos: [
          Math.round(pos.x * 100) / 100,
          Math.round(pos.y * 100) / 100,
          Math.round(pos.z * 100) / 100
        ],
        rot: [
          Math.round(pitch * 1000) / 1000,
          Math.round(yaw * 1000) / 1000
        ]
      });
    }
  }

  sendHeroSwitch(heroKey) {
    this.send({ type: 'hero_switch', hero: heroKey });
  }

  sendAction(actionType, data = {}) {
    this.send({ type: 'action', actionType, data });
  }

  sendHit(targetId, damage, isHeadshot) {
    this.send({ type: 'hit', targetId, damage, isHeadshot });
  }

  sendRespawn() {
    this.send({ type: 'respawn' });
  }
}
