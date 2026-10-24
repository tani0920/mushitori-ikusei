#!/usr/bin/env python3
"""ChatGPT の絵をゲーム用にととのえる。
  python3 tools/img_prep.py img/incoming/元の絵.png kabuto_adult_genki
→ 透明なまわりを切りおとし、正方形（512px）のまん中に置いて img/bugs/kabuto_adult_genki.webp に保存する。
  ゲームの中では 100x100 の箱として使う。"""
import sys, os
from PIL import Image

SIZE, MARGIN = 512, 0.04          # できあがりの大きさ、まわりの余白（割合）
src, name = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
box = im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()   # うすいゴミは無視して、絵のあるところだけ
im = im.crop(box)
k = SIZE * (1 - MARGIN * 2) / max(im.size)
im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
out = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
out.paste(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2), im)
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img', 'bugs')
os.makedirs(root, exist_ok=True)
dst = os.path.join(root, name + '.webp')
out.save(dst, 'WEBP', quality=88, method=6)
print(dst, os.path.getsize(dst) // 1024, 'KB')
