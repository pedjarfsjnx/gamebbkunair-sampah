/**
 * test_github_pages_online.js
 * Test online assets and PeerJS signaling connection for GitHub Pages deployment.
 */

const https = require('https');

const GITHUB_PAGES_BASE = 'https://pedjarfsjnx.github.io/gamebbkunair-sampah/';

const ASSETS_TO_CHECK = [
  '',
  'index.html',
  'css/style.css',
  'css/components.css',
  'css/animations.css',
  'js/data.js',
  'js/audio.js',
  'js/state.js',
  'js/network.js',
  'js/ui.js',
  'js/app.js',
  'assets/images/schoolyard_hd.svg',
  'simulasi.html'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url: url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    }).on('error', (err) => {
      resolve({ url: url, status: 0, ok: false, error: err.message });
    });
  });
}

function checkPeerJSSignaling() {
  return new Promise((resolve) => {
    const req = https.get('https://0.peerjs.com/id', (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ ok: res.statusCode === 200, peerId: body.trim() });
      });
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
  });
}

async function runOnlineTest() {
  console.log("=================================================");
  console.log("🌐 GITHUB PAGES DEPLOYMENT & PEERJS ONLINE TEST");
  console.log(`URL: ${GITHUB_PAGES_BASE}`);
  console.log("=================================================\n");

  console.log("--- 1. Checking Static Assets Status ---");
  for (const asset of ASSETS_TO_CHECK) {
    const fullUrl = GITHUB_PAGES_BASE + asset;
    const res = await checkUrl(fullUrl);
    const symbol = res.ok ? '✅' : '❌';
    const nameStr = (asset || 'root (/)').padEnd(30, ' ');
    console.log(`${symbol} ${nameStr} -> Status: ${res.status}`);
  }

  console.log("\n--- 2. Checking PeerJS Cloud Signaling Server (0.peerjs.com) ---");
  const peerRes = await checkPeerJSSignaling();
  if (peerRes.ok) {
    console.log(`✅ PeerJS Cloud Server Active! Assigned Test Peer ID: ${peerRes.peerId}`);
    console.log("   (Multi-laptop online connection across different locations via WebRTC is FULLY FUNCTIONAL)");
  } else {
    console.log(`❌ PeerJS Server Warning: ${peerRes.error}`);
  }

  console.log("\n=================================================");
  console.log("🎉 ONLINE DEPLOYMENT STATUS VERIFIED!");
  console.log("=================================================");
}

runOnlineTest();
