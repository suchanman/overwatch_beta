/**
 * ============================================================================
 * OVERWATCH 2 : WEB PROTOCOL - NODE.JS MULTIPLAYER SERVER (server.js)
 * - Express HTTP Static File Server & WebSocket Server on Port 8000
 * - Tracer (300HP), Genji (400HP), Reinhardt (1000HP)
 * - 5.0s Authoritative Respawn with Instant Corpse Vanish
 * ============================================================================
 */

const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));

const HERO_MAX_HP = { tracer: 300, genji: 400, reinhardt: 1000, mccree: 450 };
const SPAWN_POINTS = [
  [0.0, 1.7, 18.0],
  [-18.0, 1.7, 12.0],
  [18.0, 1.7, 12.0],
  [-22.0, 1.7, -15.0],
  [22.0, 1.7, -15.0],
  [0.0, 1.7, -25.0]
];

function getRandomSpawn() {
  const sp = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
  return [sp[0] + (Math.random() - 0.5) * 4, sp[1], sp[2] + (Math.random() - 0.5) * 4];
}


const clients = new Map();
let playerCounter = 1;

function broadcast(data, excludeWs = null) {
  const msg = JSON.stringify(data);
  for (const [ws] of clients) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

wss.on('connection', (ws) => {
  const playerId = `p_${Date.now() % 100000}_${Math.floor(Math.random() * 900 + 100)}`;
  const defaultName = `요원 #${playerCounter++}`;
  const player = {
    id: playerId,
    name: defaultName,
    hero: 'tracer',
    pos: getRandomSpawn(),
    rot: [0, 0],
    hp: HERO_MAX_HP['tracer'],
    maxHp: HERO_MAX_HP['tracer'],
    isShieldActive: false,
    isDead: false,
    eliminations: 0,
    deaths: 0,
    ping: 15
  };

  clients.set(ws, player);
  console.log(`[CONNECT] ${player.name} (${playerId}) joined. Online: ${clients.size}`);

  const allPlayers = Array.from(clients.values());
  ws.send(JSON.stringify({
    type: 'init',
    selfId: playerId,
    player,
    players: allPlayers
  }));

  broadcast({ type: 'player_joined', player }, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case 'join':
          if (data.name) player.name = data.name.trim().slice(0, 16);
          if (data.hero && HERO_MAX_HP[data.hero]) {
            player.hero = data.hero;
            player.maxHp = HERO_MAX_HP[data.hero];
            player.hp = player.maxHp;
          }
          broadcast({ type: 'player_updated', player });
          break;

        case 'move':
          if (data.pos) player.pos = data.pos;
          if (data.rot) player.rot = data.rot;
          broadcast({
            type: 'state_sync',
            id: playerId,
            pos: player.pos,
            rot: player.rot
          }, ws);
          break;

        case 'hero_switch':
          if (data.hero && HERO_MAX_HP[data.hero]) {
            player.hero = data.hero;
            player.maxHp = HERO_MAX_HP[data.hero];
            player.hp = player.maxHp;
            player.isDead = false;
            player.isShieldActive = false;
            broadcast({
              type: 'hero_switched',
              id: playerId,
              hero: player.hero,
              hp: player.hp,
              maxHp: player.maxHp
            });
          }
          break;

        case 'action':
          if (data.actionType === 'shield_toggle') {
            player.isShieldActive = !!data.data?.active;
          }
          broadcast({
            type: 'player_action',
            id: playerId,
            actionType: data.actionType,
            data: data.data
          }, ws);
          break;

        case 'hit': {
          const target = Array.from(clients.values()).find((p) => p.id === data.targetId);
          if (target && !target.isDead) {
            target.hp = Math.max(0, target.hp - data.damage);
            broadcast({
              type: 'player_hit',
              targetId: data.targetId,
              attackerId: playerId,
              attackerName: player.name,
              damage: data.damage,
              isHeadshot: data.isHeadshot,
              remainingHp: target.hp
            });

            if (target.hp <= 0) {
              target.isDead = true;
              target.deaths++;
              player.eliminations++;
              broadcast({
                type: 'player_eliminated',
                victimId: target.id,
                victimName: target.name,
                attackerId: playerId,
                attackerName: player.name,
                attackerHero: player.hero,
                isHeadshot: data.isHeadshot
              });

              // Authoritative 5.0 second respawn
              setTimeout(() => {
                if (target.isDead) {
                  target.isDead = false;
                  target.hp = target.maxHp;
                  target.pos = getRandomSpawn();
                  target.isShieldActive = false;
                  broadcast({
                    type: 'player_respawned',
                    id: target.id,
                    pos: target.pos,
                    hp: target.hp
                  });
                }
              }, 5000);
            }
          }
          break;
        }

        case 'heal':
          if (player && !player.isDead && typeof data.amount === 'number') {
            player.hp = Math.min(player.maxHp, player.hp + data.amount);
            broadcast({
              type: 'player_healed',
              id: playerId,
              hp: player.hp,
              maxHp: player.maxHp
            });
          }
          break;

        case 'respawn':
          if (player.isDead) {
            player.isDead = false;
            player.hp = player.maxHp;
            player.pos = getRandomSpawn();
            player.isShieldActive = false;
            broadcast({
              type: 'player_respawned',
              id: playerId,
              pos: player.pos,
              hp: player.hp
            });
          }
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', t: data.t }));
          break;
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[DISCONNECT] ${player.name} left. Online: ${clients.size}`);
    broadcast({ type: 'player_left', id: playerId, name: player.name });
  });
});

server.listen(PORT, () => {
  console.log(`[Overwatch 2 Server] Running on port ${PORT}`);
});
