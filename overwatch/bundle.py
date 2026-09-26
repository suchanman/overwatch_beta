import re

files_order = [
    'js/engine/AudioSynth.js',
    'js/engine/CameraShaker.js',
    'js/engine/InputManager.js',
    'js/engine/NetworkManager.js',
    'js/ui/UIManager.js',
    'js/world/MapBuilder.js',
    'js/entities/HeroModels.js',
    'js/entities/Projectile.js',
    'js/entities/Bot.js',
    'js/entities/RemotePlayer.js',
    'js/heroes/HeroBase.js',
    'js/heroes/Tracer.js',
    'js/heroes/Genji.js',
    'js/heroes/Reinhardt.js',
    'js/heroes/McCree.js',
    'js/heroes/Doomfist.js',
    'js/main.js'
]

bundled_code = ["/* OVERWATCH 2 WEB - STANDALONE UNIVERSAL BUNDLE (file:// & http:// compatible) */\n(function() {\n  'use strict';\n"]

for filepath in files_order:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove import statements
    content = re.sub(r'^\s*import\s+.*?;?\s*$', '', content, flags=re.MULTILINE)
    # Remove export keyword (e.g., 'export class Foo' -> 'class Foo', 'export function bar' -> 'function bar')
    content = re.sub(r'^\s*export\s+default\s+', '', content, flags=re.MULTILINE)
    content = re.sub(r'^\s*export\s+', '', content, flags=re.MULTILINE)
    
    bundled_code.append(f"\n// ==================== {filepath} ====================\n")
    bundled_code.append(content)

bundled_code.append("\n})();\n")

with open('js/bundle.js', 'w', encoding='utf-8') as f:
    f.write(''.join(bundled_code))

print("Bundled successfully! Total lines:", len(''.join(bundled_code).splitlines()))
