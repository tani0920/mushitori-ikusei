import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const SP = SHOTS;
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
const click = async sel => { const el = await page.waitForSelector(sel); await el.evaluate(e => e.scrollIntoView({block:'center'})); await page.waitForTimeout(60); await el.click(); };
const shot = async n => page.screenshot({ path: `${SP}/${n}.png` });
const tapMsg = async () => { for (let i = 0; i < 20; i++) { if (await page.$('#msgLayer input')) return; const a = await page.$('#msgLayer .ans button'); if (a) { await a.click(); await page.waitForTimeout(120); continue; } if (await page.$('#msgLayer .tap')) { await page.click('#msgLayer .win', {position:{x:20,y:20}}); await page.waitForTimeout(120); continue; } return; } };
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
await click('#btnNew'); await page.waitForTimeout(300); await tapMsg();
// 成虫のスズムシ（うっとりソング）と カブト（大ツノスラム）を用意
await page.evaluate(() => { const mk = (bug, pers, moves, born) => ({bug, si:BUGS[bug].plan.length-1, prog:0, hunger:90, wet:80, clean:100, tick:now(), pending:false, from:'釣川', born, bornSlot:'yoru', since:dayKey(), ind:{hp:1.15,atk:1.1,def:1.05,spd:1.1,heal:1.05}, log:newLog(), tot:newLog(), place:'genkan', wide:true, trouble:null, dirt:[], foods:[], soak:0, hideUntil:0, deco:[], mat:null, soilAge:0, pers, name:bug==='suzumushi'?'リンリン':'ゴンタ', sex:'オス', size:bug==='suzumushi'?22:78, moves, uka:dayKey()});
  S.cases[0] = mk('suzumushi', 'yancha', ['cricket','cricket_spd'], 'tsurikawa'); S.cases[1] = mk('kabuto', 'makezu', ['beetle','beetle_atk'], 'joyama'); S.dex.suzumushi={found:dayKey(), where:'釣川', adult:dayKey()}; S.dex.kabuto={found:dayKey(), where:'城山', adult:dayKey()}; save(); });
await click('#tabs [data-t=sumo]'); await page.waitForTimeout(300);
await click('[data-r="0"]'); await (await page.$$('#msgLayer .ans button'))[0].click(); await page.waitForTimeout(150); await tapMsg();
await page.waitForTimeout(400); await shot('v9-enter'); await page.waitForTimeout(1600); await shot('v9-hakkeyoi');
await page.waitForTimeout(2500); await shot('v9-mid1'); await click('#bCheer'); await page.waitForTimeout(600); await shot('v9-cheer');
await page.waitForTimeout(3000); await shot('v9-mid2');
await page.waitForSelector('#arena .ctl .pri', {timeout: 120000}); await shot('v9-end');
const log = await page.$$eval('#blog div', d => d.map(x => x.textContent)); console.log('log lines:', log.length); console.log(log.slice(0, 6).join(' / ')); console.log('...', log.slice(-3).join(' / '));
await click('#arena .ctl .pri'); await page.waitForTimeout(300); await tapMsg(); await page.waitForTimeout(200); await tapMsg();
// 2戦目：カブト（まけずぎらい）をはやおくりで
await click('#tabs [data-t=sumo]'); await page.waitForTimeout(300); const btn = await page.$('[data-r="1"]:not([disabled])') || await page.$('[data-r="0"]:not([disabled])');
if (btn) { await btn.click(); await (await page.$$('#msgLayer .ans button'))[1].click(); await page.waitForTimeout(150); await tapMsg(); await page.waitForTimeout(300); await click('#bFast'); await page.waitForSelector('#arena .ctl .pri', {timeout: 60000}); console.log('fast battle done'); await click('#arena .ctl .pri'); await tapMsg(); await page.waitForTimeout(200); await tapMsg(); }
console.log('stats:', await page.evaluate(() => S.stats));
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
