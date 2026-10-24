#!/usr/bin/env python3
"""部品（パーツ）の絵をゲーム用にととのえる。
  python3 tools/parts_prep.py kabuto body=img/incoming/…-body.png head=… antenna=… thigh=… shin=… mouth=…
→ どの部品も「全身の絵（1024x1024）の中の位置」をたもったまま、絵のあるところだけ切りだして
  img/bugs/parts/kabuto/部品名.webp に保存し、ゲームに書く位置 [x, y, はば, 高さ] を表示する。"""
import sys, os, json
from PIL import Image

bug, args = sys.argv[1], sys.argv[2:]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img', 'bugs', 'parts', bug)
os.makedirs(root, exist_ok=True)
out = {}
for a in args:
    name, src = a.split('=', 1)
    im = Image.open(src).convert('RGBA')
    if im.size != (1024, 1024): im = im.resize((1024, 1024), Image.LANCZOS)
    x0, y0, x1, y1 = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    x0, y0, x1, y1 = max(0, x0 - 2), max(0, y0 - 2), min(1024, x1 + 2), min(1024, y1 + 2)
    im.crop((x0, y0, x1, y1)).save(os.path.join(root, name + '.webp'), 'WEBP', quality=90, method=6)
    out[name] = [x0, y0, x1 - x0, y1 - y0]
print(json.dumps(out, separators=(',', ':')))
