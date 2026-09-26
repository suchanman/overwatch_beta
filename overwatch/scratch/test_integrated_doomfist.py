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
    '--remote-debugging-port=9227',
    '--window-size=1280,720',
    '--remote-allow-origins=*',
    'http://localhost:8000'
]
proc = subprocess.Popen(cmd)
time.sleep(3.0)

out_dir = r"C:\Users\User\.gemini\antigravity-ide\brain\12b73b9a-4fa4-49dd-bf7d-41b5a2984efa"

try:
    with urllib.request.urlopen('http://localhost:9227/json') as response:
        tabs = json.loads(response.read().decode())
    
    page_tab = None
    for tab in tabs:
        if tab.get('type') == 'page' and 'localhost:8000' in tab.get('url', ''):
            page_tab = tab
            break
            
    if not page_tab:
        print("Page tab not found in tabs:", tabs)
        sys.exit(1)
        
    ws_url = page_tab['webSocketDebuggerUrl']
    parts = ws_url.replace('ws://', '').split('/', 1)
    host_port = parts[0]
    path = '/' + parts[1]
    host, port = host_port.split(':')
    
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, int(port)))
    ws_handshake(s, host_port, path)
    s.settimeout(3.0)
    
    call_cdp(s, "Runtime.enable")
    call_cdp(s, "Page.enable")
    time.sleep(1.0)
    
    # 1. Verify Lobby Hero Cards
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": "JSON.stringify({ title: document.title, heroButtons: Array.from(document.querySelectorAll('.hero-select-card')).map(b => b.getAttribute('data-hero')) })"
    })
    print("1. Lobby hero buttons:", res.get("result", {}).get("result", {}).get("value"))
    
    # Take Lobby Screenshot
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "integrated_df_01_lobby.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved integrated_df_01_lobby.png")
    
    # 2. Select Doomfist in Lobby
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            const dfBtn = document.querySelector('.hero-select-card[data-hero="doomfist"]');
            if (dfBtn) {
                dfBtn.click();
                return 'Clicked Doomfist! Current hero: ' + (window.__overwatchGame ? window.__overwatchGame.currentHeroKey : 'none');
            }
            return 'Btn not found';
        })()"""
    })
    print("2. Hero select:", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(1.0)
    
    # Take Lobby Showcase Screenshot with Doomfist 3D Model
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "integrated_df_02_showcase.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved integrated_df_02_showcase.png")
        
    # 3. Enter Arena
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            const startBtn = document.getElementById('btn-start-game');
            if (startBtn) {
                startBtn.click();
                window.__overwatchGame.input.isLocked = true; // Mock pointer lock for headless browser
                return 'Game started! Active hero: ' + window.__overwatchGame.currentHero.name;
            }
            return 'Start btn not found';
        })()"""
    })
    print("3. Enter Arena:", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(1.5)
    
    # Check in-game state
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """JSON.stringify({
            heroName: window.__overwatchGame.currentHero.name,
            hp: window.__overwatchGame.currentHero.hp,
            maxHp: window.__overwatchGame.currentHero.maxHp,
            ammo: window.__overwatchGame.currentHero.ammo,
            portrait: document.getElementById('hero-portrait').className,
            shiftIcon: document.querySelector('#ability-1-icon .icon-text').textContent,
            eIcon: document.querySelector('#ability-2-icon .icon-text').textContent
        })"""
    })
    print("4. In-Game State:", res.get("result", {}).get("result", {}).get("value"))
    
    # In-Game Screenshot (HUD + First Person Gauntlet)
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "integrated_df_03_ingame.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved integrated_df_03_ingame.png")
        
    # 4. Test Hand Cannon Fire
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            window.__overwatchGame.input.isLocked = true;
            window.__overwatchGame.input.keys.primaryFire = true;
            window.__overwatchGame.handleCombatInputs(window.__overwatchGame.getAllCombatTargets());
            window.__overwatchGame.input.keys.primaryFire = false;
            return 'Ammo after fire: ' + window.__overwatchGame.currentHero.ammo;
        })()"""
    })
    print("5. Hand Cannon fire test:", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(0.3)
    
    # 5. Test Rocket Punch Charge & Gauge
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            window.__overwatchGame.input.isLocked = true;
            window.__overwatchGame.input.keys.secondaryFire = true;
            window.__overwatchGame.handleCombatInputs(window.__overwatchGame.getAllCombatTargets());
            // simulate holding charge
            window.__overwatchGame.currentHero.punchChargeTime = 0.9;
            window.__overwatchGame.currentHero.punchChargeRatio = 0.70;
            window.__overwatchGame.ui.updateDoomfistHUD(window.__overwatchGame.currentHero);
            return 'Punch charging: ' + window.__overwatchGame.currentHero.isChargingPunch;
        })()"""
    })
    print("6. Rocket Punch Charge:", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(0.3)
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "integrated_df_04_charge.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved integrated_df_04_charge.png")
        
    # Release Rocket Punch
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            window.__overwatchGame.input.keys.secondaryFire = false;
            window.__overwatchGame.handleCombatInputs(window.__overwatchGame.getAllCombatTargets());
            return 'Punch Dashing: ' + window.__overwatchGame.currentHero.isPunchDashing;
        })()"""
    })
    print("7. Rocket Punch Release:", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(0.5)
    
    # 6. Test Seismic Slam (Shift)
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            window.__overwatchGame.input.keys.shift = true;
            window.__overwatchGame.handleCombatInputs(window.__overwatchGame.getAllCombatTargets());
            return 'Seismic Slamming: ' + window.__overwatchGame.currentHero.isSlamming;
        })()"""
    })
    print("8. Seismic Slam (Shift):", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(0.6)
    
    # 7. Test Rising Uppercut (E)
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            window.__overwatchGame.input.keys.e = true;
            window.__overwatchGame.handleCombatInputs(window.__overwatchGame.getAllCombatTargets());
            return 'Uppercutting: ' + window.__overwatchGame.currentHero.isUppercutting;
        })()"""
    })
    print("9. Rising Uppercut (E):", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(0.5)
    
    # 8. Test Meteor Strike (Q)
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            window.__overwatchGame.currentHero.ultCharge = 100;
            window.__overwatchGame.input.keys.q = true;
            window.__overwatchGame.handleCombatInputs(window.__overwatchGame.getAllCombatTargets());
            return 'Meteor Active: ' + window.__overwatchGame.currentHero.isMeteorActive + ' Phase: ' + window.__overwatchGame.currentHero.meteorPhase;
        })()"""
    })
    print("10. Meteor Strike Activation (Q):", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(0.5)
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "integrated_df_06_meteor_target.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved integrated_df_06_meteor_target.png")
        
    # Confirm Meteor Strike with Left Click
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """(() => {
            window.__overwatchGame.input.keys.primaryFire = true;
            window.__overwatchGame.handleCombatInputs(window.__overwatchGame.getAllCombatTargets());
            return 'Meteor Phase after confirm: ' + window.__overwatchGame.currentHero.meteorPhase;
        })()"""
    })
    print("11. Meteor Strike Impact Confirmation:", res.get("result", {}).get("result", {}).get("value"))
    time.sleep(0.8)
    
    # 9. Test In-Game Hero Switch Modal [H]
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """JSON.stringify((() => {
            window.__overwatchGame.input.onHeroSwitchRequested('toggle_modal');
            const modal = document.getElementById('hero-switch-modal');
            const cards = Array.from(modal.querySelectorAll('.switch-card')).map(c => ({
                pick: c.getAttribute('data-pick'),
                name: c.querySelector('.name') ? c.querySelector('.name').textContent : '',
                key: c.querySelector('.key-tag') ? c.querySelector('.key-tag').textContent : ''
            }));
            return { isVisible: !modal.classList.contains('hidden'), heroes: cards };
        })())"""
    })
    print("12. Hero Switch Modal:", res.get("result", {}).get("result", {}).get("value"))
    
    ss = call_cdp(s, "Page.captureScreenshot", {"format": "png"})
    if ss and "result" in ss and "data" in ss["result"]:
        with open(os.path.join(out_dir, "integrated_df_05_switch_modal.png"), "wb") as f:
            f.write(base64.b64decode(ss["result"]["data"]))
        print("Saved integrated_df_05_switch_modal.png")
        
    # 10. Test In-game switching between heroes
    res = call_cdp(s, "Runtime.evaluate", {
        "expression": """JSON.stringify((() => {
            window.__overwatchGame.switchHero('mccree');
            const h1 = window.__overwatchGame.currentHero.name;
            window.__overwatchGame.switchHero('doomfist');
            const h2 = window.__overwatchGame.currentHero.name;
            return { switchedTo: h1, switchedBackTo: h2 };
        })())"""
    })
    print("13. In-Game Hero Switching:", res.get("result", {}).get("result", {}).get("value"))
    
    s.close()
finally:
    proc.terminate()
