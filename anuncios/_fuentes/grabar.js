// uso: node grabar.js ad2.html salida/ 23.2 [t1,t2,...]  (con lista de tiempos = solo capturas de prueba)
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [html, out, dur, lista] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + __dirname + '/' + html);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const ts = lista ? lista.split(',').map(Number) : Array.from({ length: Math.round(dur * 30) }, (_, i) => i / 30);
  for (let i = 0; i < ts.length; i++) {
    await p.evaluate(t => window.setT(t), ts[i]);
    const name = lista ? `p-${ts[i]}.jpg` : `f${String(i).padStart(5, '0')}.jpg`;
    await p.screenshot({ path: out + '/' + name, type: 'jpeg', quality: 90 });
  }
  await b.close();
})();
