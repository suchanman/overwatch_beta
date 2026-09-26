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
    '--remote-debugging-port=9231',
    '--window-size=1280,720',
    '--remote-allow-origins=*',
    'http://localhost:8000'
]
proc = subprocess.Popen(cmd)
time.sleep(3.0)

out_dir = r"C:\Users\User\.gemini\antigravity-ide\brain\12b73b9a-4fa4-49dd-bf7d-41b5a2984efa"

try:
    with urllib.request.urlopen('http://localhost:9231/json') as response:
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
    
    # 1. Start Game as Doomfist
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
            selectedHero: window.__overwatchGame ? window.__overwatchGame.currentHero.name : 'unknown'
        });
    })()"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": setup_eval})
    print("1. Start Game as Doomfist:", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(1.0)
    
    # 2. Test Seismic Slam: Position bot in front of landing, trigger Shift, observe landing shockwave
    slam_start_eval = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        const bot = game.bots[0];
        
        // Reset bot 4m in front of anticipated landing zone (z ~ 10)
        bot.respawn();
        bot.group.position.set(20, 0.15, 6);
        bot.hp = 200;
        bot.isDead = false;
        bot.knockbackVelocity.set(0, 0, 0);
        
        // Start Doomfist on highway looking slightly down-forward (-0.18 pitch) so the ground in front is in view
        game.playerPos.set(20, 1.7, 23);
        game.camera.position.set(20, 1.7, 23);
        game.input.yaw = 0;
        game.input.pitch = -0.22; // Slightly looking down to see the floor in front
        
        game.currentHero.ability1Timer = 0;
        game.input.keys.shift = true;
        game.handleCombatInputs(game.getAllCombatTargets());
        
        return {
            isSlamming: game.currentHero.isSlamming,
            slamVelocity: { y: game.currentHero.slamVelocity.y.toFixed(1), z: game.currentHero.slamVelocity.z.toFixed(1) }
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": slam_start_eval})
    print("2. Trigger Seismic Slam Leap:", res.get("result", {}).get("result", {}).get("value"))
    
    # Wait for landing (poll until isSlamming becomes false, max 1.5s)
    t_start = time.time()
    landed = False
    while time.time() - t_start < 1.5:
        poll_res = call_cdp(s, "Runtime.evaluate", {"expression": "window.__overwatchGame.currentHero.isSlamming"})
        if poll_res and poll_res.get("result", {}).get("result", {}).get("value") is False:
            landed = True
            break
        time.sleep(0.05)
    
    # Wait 0.12s so the shockwave is at full expansion and glow
    time.sleep(0.12)
    
    check_landing_eval = """JSON.stringify((() => {
        const game = window.__overwatchGame;
        const bot = game.bots[0];
        const vfx = game.projectiles.groundVFX;
        let vfxInfo = null;
        if (vfx && vfx.length > 0) {
            const lastVfx = vfx[vfx.length - 1];
            vfxInfo = {
                posY: lastVfx.group.position.y.toFixed(3),
                posZ: lastVfx.group.position.z.toFixed(3),
                rotY: lastVfx.group.rotation.y.toFixed(2),
                life: lastVfx.life.toFixed(2)
            };
        }
        return {
            isSlamming: game.currentHero.isSlamming,
            playerPos: { x: game.playerPos.x.toFixed(2), y: game.playerPos.y.toFixed(2), z: game.playerPos.z.toFixed(2) },
            vfxInfo,
            botHp: bot.hp,
            botY: bot.group.position.y.toFixed(3), // Must be on floor (~0.15), NOT lifted!
            botKnockbackY: bot.knockbackVelocity.y.toFixed(2), // Must be 0
            overhealthGained: game.currentHero.shields
        };
    })())"""
    res = call_cdp(s, "Runtime.evaluate", {"expression": check_landing_eval})
    print("3. Slam Landing & Shockwave Check:", res.get("result", {}).get("result", {}).get("value"))
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "df_test_slam_lowered_front.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved df_test_slam_lowered_front.png")
        
    s.close()
    print("Slam refinement test complete!")
finally:
    proc.terminate()
