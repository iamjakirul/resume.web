const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromeProc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9333',
  '--window-size=1280,950',
  'about:blank'
]);

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  await wait(1500);
  const targets = await getJson('http://127.0.0.1:9333/json/list');
  const target = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();

  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise(res => {
      const msgId = id++;
      callbacks.set(msgId, res);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onopen = async () => {
    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await wait(1500);

    const sections = ['hero', 'about', 'projects', 'experience', 'skills', 'contact'];
    for (const sec of sections) {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.getElementById("${sec}");
            if (el) {
              el.scrollIntoView({ behavior: 'instant', block: 'start' });
              window.scrollBy(0, -60);
            }
          })()
        `
      });
      await wait(800);
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res.result && res.result.data) {
        fs.writeFileSync(
          `/Users/jakirulislam/.gemini/antigravity-ide/brain/4b3e09ba-e2ce-472c-be6f-04c3b5284c08/verified_${sec}.png`,
          Buffer.from(res.result.data, 'base64')
        );
        console.log(`Saved verified_${sec}.png`);
      }
    }

    // Also trigger resume dropdown and capture
    await send('Runtime.evaluate', {
      expression: `
        const dropdown = document.getElementById("nav-resume-dropdown");
        if (dropdown) dropdown.classList.add("open");
      `
    });
    await wait(300);
    const dropRes = await send('Page.captureScreenshot', { format: 'png' });
    if (dropRes.result && dropRes.result.data) {
      fs.writeFileSync(
        `/Users/jakirulislam/.gemini/antigravity-ide/brain/4b3e09ba-e2ce-472c-be6f-04c3b5284c08/verified_resume_dropdown.png`,
        Buffer.from(dropRes.result.data, 'base64')
      );
      console.log('Saved verified_resume_dropdown.png');
    }

    chromeProc.kill();
    process.exit(0);
  };
}

main().catch(err => {
  console.error(err);
  chromeProc.kill();
  process.exit(1);
});
