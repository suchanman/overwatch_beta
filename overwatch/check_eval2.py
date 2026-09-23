import http.server, socketserver, threading, subprocess, time, json, urllib.request, websockets, asyncio, os

PORT = 8093
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

server = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
t = threading.Thread(target=server.serve_forever, daemon=True)
t.start()

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
proc = subprocess.Popen([
    edge_path,
    "--headless=new",
    "--remote-debugging-port=9445",
    f"http://127.0.0.1:{PORT}/index.html"
])
time.sleep(3)

async def run():
    try:
        with urllib.request.urlopen("http://127.0.0.1:9445/json") as resp:
            tabs = json.loads(resp.read().decode())
        page = next(t for t in tabs if "8093" in t.get("url", ""))
        ws_url = page["webSocketDebuggerUrl"]
        
        async with websockets.connect(ws_url) as ws:
            await ws.send(json.dumps({"id": 1, "method": "Runtime.enable"}))
            await ws.send(json.dumps({"id": 2, "method": "Log.enable"}))
            await ws.send(json.dumps({
                "id": 10,
                "method": "Runtime.evaluate",
                "params": {
                    "expression": "(() => { return { readyState: document.readyState, three: typeof THREE, gameCreated: !!window.__gameInstance, canvas: !!document.getElementById('lobby-hero-canvas') }; })()",
                    "returnByValue": True
                }
            }))
            
            for _ in range(15):
                raw = await ws.recv()
                msg = json.loads(raw)
                if msg.get("id") == 10:
                    print("EVAL RESULT:", msg["result"])
                elif msg.get("method") == "Runtime.exceptionThrown":
                    print("EXCEPTION:", json.dumps(msg["params"]["exceptionDetails"], ensure_ascii=False))
                elif msg.get("method") == "Runtime.consoleAPICalled":
                    print("CONSOLE:", msg["params"]["type"], msg["params"].get("args", []))
    except Exception as e:
        import traceback
        traceback.print_exc()

try:
    asyncio.run(run())
finally:
    proc.terminate()
    server.shutdown()
