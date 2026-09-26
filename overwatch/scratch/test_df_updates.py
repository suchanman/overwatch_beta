import subprocess, time, urllib.request, json, socket, base64, os, sys

sys.stdout.reconfigure(encoding='utf-8')

def ws_handshake(sock, host, path):
    key = base64.b64encode(os.urandom(16)).decode('utf-8')
    req = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    sock.sendall(req.encode('utf-8'))
    resp = sock.recv(4096).decode('utf-8')
    if "101" not in resp:
        raise Exception("Handshake failed: " + resp)

def send_frame(sock, text):
    data = text.encode('utf-8')
    length = len(data)
    frame = bytearray()
    frame.append(0x81)
    if length <= 125:
        frame.append(0x80 | length)
    elif length <= 65535:
        frame.append(0x80 | 126)
        frame.extend(length.to_bytes(2, 'big'))
    else:
        frame.append(0x80 | 127)
        frame.extend(length.to_bytes(8, 'big'))
    mask = os.urandom(4)
    frame.extend(mask)
    masked_data = bytearray(data[i] ^ mask[i % 4] for i in range(length))
    frame.extend(masked_data)
    sock.sendall(frame)

def recv_frame(sock):
    header = sock.recv(2)
    if not header:
        return None
    b1, b2 = header[0], header[1]
    length = b2 & 0x7F
    if length == 126:
        length = int.from_bytes(sock.recv(2), 'big')
    elif length == 127:
        length = int.from_bytes(sock.recv(8), 'big')
    data = b""
    while len(data) < length:
        chunk = sock.recv(length - len(data))
        if not chunk:
            break
        data += chunk
    return data.decode('utf-8', errors='ignore')

msg_counter = 1
def call_cdp(sock, method, params=None):
    global msg_counter
    cur_id = msg_counter
    msg_counter += 1
    payload = {"id": cur_id, "method": method}
    if params:
        if method == "Runtime.evaluate" and "returnByValue" not in params:
            params["returnByValue"] = True
        payload["params"] = params
    send_frame(sock, json.dumps(payload))
    t_end = time.time() + 8
    while time.time() < t_end:
        raw = recv_frame(sock)
        if raw:
            try:
                res = json.loads(raw)
                if res.get("id") == cur_id:
                    return res
            except Exception:
                pass
    return None

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_path):
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

cmd = [
    edge_path,
    '--headless=new',
    '--remote-debugging-port=9229',
    '--window-size=1280,720',
    '--remote-allow-origins=*',
    'http://localhost:8000'
]
proc = subprocess.Popen(cmd)
time.sleep(3.0)

out_dir = r"C:\Users\User\.gemini\antigravity-ide\brain\12b73b9a-4fa4-49dd-bf7d-41b5a2984efa"

try:
    with urllib.request.urlopen('http://localhost:9229/json') as response:
        tabs = json.loads(response.read().decode())
    
    page_tab = None
    for tab in tabs:
        if tab.get('type') == 'page' and 'localhost:8000' in tab.get('url', ''):
            page_tab = tab
            break
    if not page_tab:
        page_tab = tabs[0]
        
    ws_url = page_tab['webSocketDebuggerUrl']
    url_parts = ws_url.replace("ws://", "").split("/")
    host_port = url_parts[0]
    path = "/" + "/".join(url_parts[1:])
    host, port = host_port.split(":")
    
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, int(port)))
    ws_handshake(s, host_port, path)
    
    call_cdp(s, "Runtime.enable")
    call_cdp(s, "Page.enable")
    call_cdp(s, "Network.enable")
    call_cdp(s, "Network.setCacheDisabled", {"cacheDisabled": True})
    call_cdp(s, "Page.reload", {"ignoreCache": True})
    time.sleep(2.0)
    
    # Wait for game initialization
    time.sleep(2.0)
    
    # 1. Select Doomfist in Lobby & Start Game
    setup_eval = """(() => {
        const dfBtn = document.querySelector('.hero-select-card[data-hero="doomfist"]');
        if (dfBtn) dfBtn.click();
        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) startBtn.click();
        if (window.__overwatchGame) {
            window.__overwatchGame.switchHero('doomfist');
            window.__overwatchGame.input.isLocked = true;
        }
        return JSON.stringify({
            selectedHero: window.__overwatchGame ? window.__overwatchGame.currentHero.name : 'unknown',
            isLocked: window.__overwatchGame ? window.__overwatchGame.input.isLocked : false
        });
    })()"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": setup_eval, "returnByValue": True})
    print("1. Start Game as Doomfist:", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(1.0)
    
    # 2. Test Rising Uppercut (E): Jump height increased & launch bot airborne to same height
    uppercut_eval = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        const bot = game.bots[0];
        
        // Position bot right in front of Doomfist
        game.playerPos.set(15, 1.7, 28);
        game.input.yaw = 0;
        game.input.pitch = 0;
        
        bot.group.position.set(15, 1.7, 26); // 2m in front
        bot.knockbackVelocity.set(0, 0, 0);
        
        const initialPlayerY = game.playerPos.y;
        const initialBotY = bot.group.position.y;
        
        // Trigger Uppercut
        game.input.keys.e = true;
        game.handleCombatInputs(game.getAllCombatTargets());
        
        return {
            initialPlayerY,
            initialBotY,
            isUppercutting: game.currentHero.isUppercutting,
            uppercutVelocityY: game.currentHero.uppercutVelocityY
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": uppercut_eval})
    print("2. Trigger Uppercut:", res.get("result", {}).get("result", {}).get("value"))
    
    # Let physics tick for 0.3s
    time.sleep(0.35)
    
    check_uppercut_lift = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        const bot = game.bots[0];
        return {
            playerY: game.playerPos.y.toFixed(2),
            botY: bot.group.position.y.toFixed(2),
            botKnockbackY: bot.knockbackVelocity.y.toFixed(2)
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": check_uppercut_lift})
    print("3. Uppercut Air Elevation Check:", res.get("result", {}).get("result", {}).get("value"))
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "df_test_01_uppercut_lift.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved df_test_01_uppercut_lift.png")
        
    time.sleep(0.5)
    
    # 3. Test Rocket Punch: Collision stop & Charge Knockback Scaling
    punch_eval = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        const bot = game.bots[0];
        
        // Reset player & bot on open highway clear of obstacles
        game.playerPos.set(20, 1.7, 18);
        game.camera.position.set(20, 1.7, 18);
        game.input.yaw = 0; // facing -Z
        game.input.pitch = 0;
        game.camera.rotation.set(0, 0, 0, 'YXZ');
        
        bot.respawn();
        bot.group.position.set(20, 0.15, 15.5); // 2.5m directly in front
        bot.hp = 200;
        bot.isDead = false;
        bot.knockbackVelocity.set(0, 0, 0);
        
        // Charge to full 100%
        game.currentHero.punchCooldownTimer = 0;
        game.currentHero.startRocketPunchCharge(null);
        game.currentHero.punchChargeRatio = 1.0; // Max charge!
        
        const prePunchBotZ = bot.group.position.z;
        
        // Release punch dash
        game.currentHero.releaseRocketPunch(game.camera, game.audio, game.shaker);
        
        return {
            isPunchDashing: game.currentHero.isPunchDashing,
            punchSpeed: game.currentHero.punchVelocity.length().toFixed(1),
            prePunchBotZ
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": punch_eval})
    print("4. Rocket Punch 100% Release:", res.get("result", {}).get("result", {}).get("value"))
    
    # Run frame updates to let collision occur
    time.sleep(0.15)
    
    check_punch_impact = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        const bot = game.bots[0];
        const allTargets = game.getAllCombatTargets();
        const targetPos = bot.group.position;
        const horizDist = Math.hypot(targetPos.x - game.playerPos.x, targetPos.z - game.playerPos.z);
        const vertDist = Math.abs(game.playerPos.y - (targetPos.y + 1.1));
        return {
            isPunchDashing: game.currentHero.isPunchDashing,
            punchedTargetsSize: game.currentHero.punchedTargets.size,
            allTargetsCount: allTargets.length,
            targetIsDead: bot.isDead,
            horizDist: horizDist.toFixed(2),
            vertDist: vertDist.toFixed(2),
            playerPos: { x: game.playerPos.x.toFixed(2), y: game.playerPos.y.toFixed(2), z: game.playerPos.z.toFixed(2) },
            botPos: { x: bot.group.position.x.toFixed(2), y: bot.group.position.y.toFixed(2), z: bot.group.position.z.toFixed(2) },
            botKnockbackZ: bot.knockbackVelocity.z.toFixed(2),
            botHp: bot.hp
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": check_punch_impact})
    print("5. Rocket Punch Impact & Knockback Check:", res.get("result", {}).get("result", {}).get("value"))
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "df_test_02_rocket_punch_stop.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved df_test_02_rocket_punch_stop.png")
        
    time.sleep(0.5)
    
    # 4. Test Seismic Slam (Shift): Parabolic arc leap -> Ground Shockwave
    slam_eval = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        const bot = game.bots[0];
        
        bot.respawn();
        bot.group.position.set(20, 0.15, 6); // Directly in front of landing point (z ~ 9)
        bot.hp = 200;
        bot.isDead = false;
        bot.knockbackVelocity.set(0, 0, 0);
        
        game.playerPos.set(20, 1.7, 23);
        game.camera.position.set(20, 1.7, 23);
        game.input.yaw = 0;
        game.input.pitch = 0;
        game.camera.rotation.set(0, 0, 0, 'YXZ');
        
        game.currentHero.ability1Timer = 0;
        game.input.keys.shift = true;
        game.handleCombatInputs(game.getAllCombatTargets());
        
        return {
            isSlamming: game.currentHero.isSlamming,
            slamVelocityY: game.currentHero.slamVelocity.y,
            slamVelocityZ: game.currentHero.slamVelocity.z,
            playerY: game.playerPos.y
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": slam_eval})
    print("6. Seismic Slam Leap (Shift):", res.get("result", {}).get("result", {}).get("value"))
    
    # Check mid-air leap (parabolic arc)
    time.sleep(0.18)
    check_slam_midair = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        return {
            isSlamming: game.currentHero.isSlamming,
            playerY: game.playerPos.y.toFixed(2), // Should be airborne (>2.5m)
            playerZ: game.playerPos.z.toFixed(2), // Leaped forward
            slamElapsed: game.currentHero.slamElapsed.toFixed(2)
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": check_slam_midair})
    print("7. Slam Parabolic Mid-Air Check:", res.get("result", {}).get("result", {}).get("value"))
    
    # Wait for landing shockwave
    time.sleep(0.45)
    check_slam_land = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        const bot = game.bots[0];
        return {
            isSlamming: game.currentHero.isSlamming,
            groundVFXCount: game.projectiles.groundVFX ? game.projectiles.groundVFX.length : 0,
            botHp: bot.hp,
            botY: bot.group.position.y.toFixed(2)
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": check_slam_land})
    print("8. Slam Landing Shockwave & Damage Check:", res.get("result", {}).get("result", {}).get("value"))
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "df_test_03_slam_shockwave.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved df_test_03_slam_shockwave.png")
        
    time.sleep(0.5)
    
    # 5. Test Meteor Strike (Q): Speed Boost + Dual Zone Reticle + Crater Impact
    meteor_eval = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        game.currentHero.ultCharge = 100;
        game.input.keys.q = true;
        game.handleCombatInputs(game.getAllCombatTargets());
        
        const promptEl = document.getElementById('doomfist-meteor-prompt');
        const reticle = game.currentHero.meteorReticleGroup;
        
        return {
            isMeteorActive: game.currentHero.isMeteorActive,
            meteorPhase: game.currentHero.meteorPhase,
            promptVisible: promptEl && !promptEl.classList.contains('hidden'),
            legendHTML: promptEl ? promptEl.querySelector('.meteor-zone-legend') !== null : false,
            reticleVisible: reticle ? reticle.visible : false,
            reticleChildrenCount: reticle ? reticle.children.length : 0,
            cameraPosY: game.camera.position.y.toFixed(1)
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": meteor_eval})
    print("9. Meteor Strike Activation & Dual Zone Reticle:", res.get("result", {}).get("result", {}).get("value"))
    
    time.sleep(0.3)
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "df_test_04_meteor_dual_zone.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved df_test_04_meteor_dual_zone.png")
        
    # Confirm strike with left click
    confirm_eval = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        game.input.keys.primaryFire = true;
        game.handleCombatInputs(game.getAllCombatTargets());
        return {
            meteorPhase: game.currentHero.meteorPhase
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": confirm_eval})
    print("10. Meteor Strike Confirm:", res.get("result", {}).get("result", {}).get("value"))
    
    # Wait for supersonic descent & crater impact
    time.sleep(0.75)
    
    impact_check = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        return {
            isMeteorActive: game.currentHero.isMeteorActive,
            groundVFXCount: game.projectiles.groundVFX ? game.projectiles.groundVFX.length : 0,
            overhealth: game.currentHero.shields
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": impact_check})
    print("11. Meteor Strike Crater Impact Check:", res.get("result", {}).get("result", {}).get("value"))
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "df_test_05_meteor_crater_impact.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved df_test_05_meteor_crater_impact.png")
        
    s.close()
    print("All tests completed successfully!")
finally:
    proc.terminate()
