import asyncio
import json
import urllib.request
import subprocess
import os

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
REMOTE_PORT = 9223

async def test_doomfist():
    # 1. Start headless edge
    proc = subprocess.Popen([
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        f"--remote-debugging-port={REMOTE_PORT}",
        "http://localhost:8000/doomfist.html"
    ])
    
    await asyncio.sleep(2.5)
    
    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{REMOTE_PORT}/json")
        tabs = json.loads(req.read().decode())
        ws_url = None
        for t in tabs:
            if "doomfist" in t.get("url", ""):
                ws_url = t.get("webSocketDebuggerUrl")
                break
        if not ws_url and tabs:
            ws_url = tabs[0].get("webSocketDebuggerUrl")
            
        print("Connected to tab ws:", ws_url)
        
        # Test basic page evaluation using python websockets or just verify through python
    finally:
        proc.kill()

if __name__ == "__main__":
    asyncio.run(test_doomfist())
