// テストの共通設定。ゲームのURL（tools/test.sh が立てるローカルサーバー）と、スクリーンショットの置き場所
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export const BASE = process.env.BASE || 'http://localhost:8765/';
export const SHOTS = fileURLToPath(new URL('./shots', import.meta.url));
mkdirSync(SHOTS, { recursive: true });
// ふつうは空でよい。決まったブラウザを使うときだけ CHROME=ブラウザのパス を付けて実行する
export const LAUNCH = process.env.CHROME ? { executablePath: process.env.CHROME } : {};
