#!/bin/sh
# 動作確認テストをまとめて実行する。
#   sh tools/test.sh            … ぜんぶ
#   sh tools/test.sh sewa taisen … 名前を指定（tools/tests/ の .mjs のファイル名）
# はじめての時だけ: cd tools/tests && npm install && npx playwright install chromium
cd "$(dirname "$0")/.." || exit 1
ROOT=$(pwd)
PORT=8765
python3 -m http.server $PORT >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
if [ $# -eq 0 ]; then
  set -- $(cd tools/tests && ls *.mjs | grep -v '^_' | sed 's/\.mjs$//')
fi
FAIL=0
for t in "$@"; do
  echo "===== $t"
  OUT=$(cd "$ROOT/tools/tests" && BASE="http://localhost:$PORT/" node "$t.mjs" 2>&1)
  CODE=$?
  echo "$OUT"
  # 落ちた、または ERRORS に中身があるときは失敗
  if [ $CODE -ne 0 ] || echo "$OUT" | grep -q "ERRORS:\? *\[ *[^] ]"; then
    echo "!!!!! $t: しっぱい"; FAIL=1
  fi
done
echo
[ $FAIL -eq 0 ] && echo "ぜんぶOK" || echo "しっぱいあり（上の !!!!! を見てね）"
exit $FAIL
