#!/bin/sh
# 公開するときに1回実行する：公開番号（日時）を index.html と version.json に書きこむ。
# これで、ホーム画面に追加したアプリにも「新しいバージョンがあります」が出る。
# 使いかた:  sh tools/bump.sh        （GAME_VER は index.html の中で手で上げる）
set -e
cd "$(dirname "$0")/.."
BUILD=$(date +%Y%m%d-%H%M)
VER=$(grep -o "const GAME_VER = '[^']*'" index.html | sed "s/.*'\(.*\)'/\1/")
sed -i.bak "s/^const BUILD = '[^']*';/const BUILD = '$BUILD';/" index.html && rm -f index.html.bak
printf '{"ver":"%s","build":"%s"}\n' "$VER" "$BUILD" > version.json
echo "ver $VER  build $BUILD"
