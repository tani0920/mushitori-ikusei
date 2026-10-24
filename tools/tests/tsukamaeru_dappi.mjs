import { chromium } from 'playwright';
import { BASE, SHOTS, LAUNCH } from './_env.mjs';
const SP = SHOTS;
const browser = await chromium.launch(LAUNCH);
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
const click = async sel => { const el = await page.waitForSelector(sel); await el.evaluate(e => e.scrollIntoView({block:'center'})); await page.waitForTimeout(60); await el.click(); };
const shot = async n => page.screenshot({ path: `${SP}/${n}.png` });
const tapMsg = async () => { const out = []; for (let i = 0; i < 20; i++) { if (await page.$('#msgLayer input')) return out; const a = await page.$('#msgLayer .ans button'); if (a) { await a.click(); await page.waitForTimeout(120); continue; } if (await page.$('#msgLayer .tap')) { out.push(await page.$eval('#msgLayer .win', e => e.textContent.slice(0,60))); await page.click('#msgLayer .win', {position:{x:20,y:20}}); await page.waitForTimeout(120); continue; } return out; } return out; };
await page.goto(BASE + '?t=' + Date.now()); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);
await click('#btnNew'); await page.waitForTimeout(300); await tapMsg();
await page.evaluate(() => { for(const k in ITEMS) if(!ITEMS[k].cat) S.items[k] = 10; save(); });
console.log('hud:', await page.$eval('#hud', e => e.textContent));
await click('#tabs [data-t=out]'); await page.selectOption('#demoSpot', 'akama'); await click('#btnDemoGo'); await tapMsg();
for (let t = 0; t < 3; t++) { await click('#btnFind'); await page.waitForTimeout(1800); if (await page.$('#bTake')) { console.log('found txt:', await page.$eval('.found .win', e => e.textContent)); await shot('v11-found'); await click('#bTake'); console.log('take:', await tapMsg()); if (await page.$('#msgLayer .ans')) { await (await page.$$('#msgLayer .ans button'))[0].click(); await page.waitForTimeout(150); await (await page.$$('#msgLayer .ans button'))[0].click(); console.log('take2:', await tapMsg()); } break; } else if (await page.$('#btnAgain')) await click('#btnAgain'); }
await click('#btnLeave'); await click('#tabs [data-t=dex]'); await page.waitForTimeout(300); await shot('v11-dex-unknown');
await click('.dexGrid .d:not(.no)'); await page.waitForTimeout(300); await shot('v11-dex-detail-unknown'); await page.keyboard.press('Escape');
await click('#rtabs [data-t=home]'); await page.waitForTimeout(200); console.log('card:', await page.$eval('.case .nm', e => e.textContent)); await shot('v11-home');
// 1回脱皮させる
await page.evaluate(() => { const c = S.cases[0]; c.prog = stageOf(c).days*24; c.pending = true; save(); });
await click('.case[data-i="0"]'); await page.waitForTimeout(900); if (await page.$('#evLayer')) { await page.waitForTimeout(3000); await page.click('#evLayer'); await page.waitForTimeout(300); console.log('molt msgs:', await tapMsg()); }
await click('#btnBack'); await click('#tabs [data-t=dex]'); await page.waitForTimeout(300); await shot('v11-dex-known');
console.log('dex:', await page.evaluate(() => JSON.stringify(S.dex)));
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
