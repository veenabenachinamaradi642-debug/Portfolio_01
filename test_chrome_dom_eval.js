const { exec } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://localhost:8080/index.html';

console.log('Starting Chrome headless with debugging...');
const chromeProcess = exec(`"${chromePath}" --headless=new --no-sandbox --remote-debugging-port=9222 ${targetUrl}`);

setTimeout(() => {
    http.get('http://localhost:9222/json/list', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const tabs = JSON.parse(data);
                if (tabs.length === 0) {
                    console.log('No active tabs found');
                    chromeProcess.kill();
                    return;
                }
                // Find tab with localhost:8080
                const targetTab = tabs.find(t => t.url.includes('localhost:8080')) || tabs[0];
                console.log('Target Tab:', targetTab.url);
                const wsUrl = targetTab.webSocketDebuggerUrl;
                console.log('Connecting to WS:', wsUrl);
                
                const ws = new WebSocket(wsUrl);
                
                ws.on('open', () => {
                    console.log('WS connection opened. Sending evaluation request...');
                    
                    const evalScript = `
                        (function() {
                            const socials = document.querySelector('.hero-socials') ? document.querySelector('.hero-socials').innerHTML : 'not found';
                            const resources = window.performance.getEntriesByType('resource').map(r => ({ name: r.name, duration: r.duration }));
                            const consoleMessages = window.errors || [];
                            return JSON.stringify({ socials, resources, consoleMessages });
                        })()
                    `;
                    
                    const msg = {
                        id: 1,
                        method: 'Runtime.evaluate',
                        params: {
                            expression: evalScript,
                            returnByValue: true
                        }
                    };
                    
                    ws.send(JSON.stringify(msg));
                });
                
                ws.on('message', (message) => {
                    const response = JSON.parse(message);
                    if (response.id === 1) {
                        const result = JSON.parse(response.result.result.value);
                        console.log('\n--- EVALUATION RESULTS ---');
                        console.log('Socials HTML:\n', result.socials);
                        console.log('\nResources Loaded:');
                        result.resources.forEach(r => console.log(`  - ${r.name} (${Math.round(r.duration)}ms)`));
                        console.log('\nConsole Errors:', result.consoleMessages);
                        console.log('--------------------------\n');
                        
                        ws.close();
                        chromeProcess.kill();
                    }
                });
                
                ws.on('error', (err) => {
                    console.error('WS Error:', err);
                    chromeProcess.kill();
                });
                
            } catch (e) {
                console.error('Error handling Chrome list:', e);
                chromeProcess.kill();
            }
        });
    }).on('error', (err) => {
        console.error('HTTP GET Error:', err);
        chromeProcess.kill();
    });
}, 4000);
