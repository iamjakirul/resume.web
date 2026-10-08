// capture.js - Automated high-res screenshot capture via Chrome DevTools Protocol
const http = require('http');
const fs = require('fs');
const path = require('path');

const targetDir = '/Users/jakirulislam/.gemini/antigravity-ide/brain/0608265b-7203-42aa-aba9-1e443017a7de';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const tabs = await getJson('http://127.0.0.1:9222/json/list');
  const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
  if (!pageTab) {
    console.error('No page tab found');
    process.exit(1);
  }

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onopen = async () => {
    console.log('Connected to Chrome DevTools Protocol');
    await send('Page.enable');
    await send('DOM.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });

    // 1. Capture Hero
    await send('Page.navigate', { url: 'http://localhost:3344/' });
    await new Promise(r => setTimeout(r, 1200));
    let snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, 'verified_hero.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('Captured verified_hero.png');

    // 2. Capture About
    await send('Runtime.evaluate', { expression: `document.getElementById('about').scrollIntoView({behavior: 'instant'});` });
    await new Promise(r => setTimeout(r, 600));
    snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, 'verified_about.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('Captured verified_about.png');

    // 3. Capture Projects
    await send('Runtime.evaluate', { expression: `document.getElementById('projects').scrollIntoView({behavior: 'instant'});` });
    await new Promise(r => setTimeout(r, 600));
    snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, 'verified_projects.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('Captured verified_projects.png');

    // 4. Capture Experience & Education
    await send('Runtime.evaluate', { expression: `document.getElementById('experience').scrollIntoView({behavior: 'instant'});` });
    await new Promise(r => setTimeout(r, 600));
    snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, 'verified_experience.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('Captured verified_experience.png');

    // 5. Capture Skills
    await send('Runtime.evaluate', { expression: `document.getElementById('skills').scrollIntoView({behavior: 'instant'});` });
    await new Promise(r => setTimeout(r, 600));
    snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, 'verified_skills.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('Captured verified_skills.png');

    // 6. Capture Contact
    await send('Runtime.evaluate', { expression: `document.getElementById('contact').scrollIntoView({behavior: 'instant'});` });
    await new Promise(r => setTimeout(r, 600));
    snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, 'verified_contact.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('Captured verified_contact.png');

    // 7. Open Terminal Simulation Modal
    await send('Runtime.evaluate', { expression: `document.querySelector('[data-run-terminal="hall-canteen"]').click();` });
    await new Promise(r => setTimeout(r, 600));
    snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, 'verified_terminal_modal.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('Captured verified_terminal_modal.png');

    // 8. Open Resume Modal
    await send('Runtime.evaluate', { expression: `document.getElementById('modal-close-btn').click(); document.getElementById('quick-preview-cv-btn').click();` });
    await new Promise(r => setTimeout(r, 600));
    snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(targetDir, 'verified_resume_modal.png'), Buffer.from(snap.result.data, 'base64'));
    console.log('Captured verified_resume_modal.png');

    ws.close();
    process.exit(0);
  };
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
