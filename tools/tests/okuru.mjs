// 虫をおくる：スマホ（A）でQRコードを出して、タブレット（B）でそのURLを開くと、虫がうつる。A で「とどいた！」をおすと A からいなくなる
import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const browser = await chromium.launch(LAUNCH);
const errors = [];
const mk = async (w, h) => { const p = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage(); p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); return p; };
const tapMsg = async (page, ansIdx = 0) => { for (let i = 0; i < 30; i++) { await page.waitForTimeout(150); const a = await page.$$('#msgLayer .ans button'); if (a.length) { await a[Math.min(ansIdx, a.length - 1)].click(); continue; } if (await page.$('#msgLayer .tap')) { await page.click('#msgLayer .win'); continue; } if (await page.$('.sendL.recv')) continue; return; } };
// A：スマホ。カブトムシの成虫がいる
const A = await mk(844, 390);
await A.goto(BASE + '?t=' + Date.now()); await A.evaluate(() => localStorage.clear()); await A.reload(); await A.waitForTimeout(500);
await A.click('#btnNew'); await tapMsg(A);
await A.evaluate(() => { S.cases[0] = {bug:'kabuto', si:BUGS.kabuto.plan.length-1, prog:0, hunger:80, wet:60, clean:90, tick:now(), pending:false, from:'宗像大社', born:'taisha', bornSlot:'yoru', since:dayKey(), ind:{hp:1.1,atk:1,def:1,spd:1,heal:1}, log:newLog(), tot:newLog(), place:'genkan', trouble:null, dirt:[], foods:[], soak:0, hideUntil:0, deco:[{id:1,k:'eda_nagai',x:60,y:50}], mat:'mat_fuyo', soilAge:10, known:true, pers:'makezu', name:'カブ太', size:72, sex:'オス', moves:['beetle']}; S.dex.kabuto = {found:dayKey(), where:'宗像大社', known:1, adult:dayKey()}; save(); });
await A.evaluate(() => { openCase = 0; render(); }); await A.waitForTimeout(500);
await A.evaluate(() => document.getElementById('aSend').click()); await A.waitForTimeout(300); await tapMsg(A);
await A.waitForSelector('#sendQR svg', { timeout: 5000 }).catch(() => errors.push('QRコードが出ない'));
await A.waitForTimeout(1200); await A.screenshot({ path: `${SHOTS}/okuru-a.png` });
const url = await A.$eval('#sendQR', e => e.dataset.url);
console.log('URL の長さ:', url.length);
// B：タブレット（セーブなし）。URL を開く
const B = await mk(1180, 820);
await B.goto(url.replace(/^https?:\/\/[^/]+\//, BASE)); await B.waitForTimeout(400);
await tapMsg(B); await B.waitForTimeout(500);
await B.screenshot({ path: `${SHOTS}/okuru-b.png` });
const got = await B.evaluate(() => S.cases.filter(Boolean).map(c => [c.bug, c.name, c.size, c.deco.length, c.place]));
console.log('B にとどいた:', JSON.stringify(got), 'URL:', await B.evaluate(() => location.search));
if (!got.length || got[0][0] !== 'kabuto' || got[0][1] !== 'カブ太') errors.push('B にとどいていない');
// もう一度同じ URL を開いても、ふえない
await B.goto(url.replace(/^https?:\/\/[^/]+\//, BASE)); await B.waitForTimeout(400); await tapMsg(B);
const n2 = await B.evaluate(() => S.cases.filter(Boolean).length); console.log('2回目:', n2); if (n2 !== 1) errors.push('同じ虫が2回入った');
// A：とどいた！
await A.click('#sDone'); await A.waitForTimeout(200); await tapMsg(A); await A.waitForTimeout(1200); await tapMsg(A);
const a2 = await A.evaluate(() => S.cases.filter(Boolean).length); console.log('A にのこった:', a2); if (a2 !== 0) errors.push('A からいなくならない');
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
