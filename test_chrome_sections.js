const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://localhost:8080/index.html';

console.log('Starting Chrome headless for section screenshots...');
const chromeProcess = exec(`"${chromePath}" --headless=new --no-sandbox --remote-debugging-port=9222 ${targetUrl}`);

const sections = [
    { name: 'about', selector: '#about' },
    { name: 'skills', selector: '#skills' },
    { name: 'projects', selector: '#projects' },
    { name: 'experience', selector: '#experience' }
];

setTimeout(() => {
    http.get('http://localhost:9222/json/list', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const tabs = JSON.parse(data);
                if (tabs.length === 0) {
                    console.log('No tabs found');
                    chromeProcess.kill();
                    return;
                }
                const targetTab = tabs.find(t => t.url.includes('localhost:8080')) || tabs[0];
                const wsUrl = targetTab.webSocketDebuggerUrl;
                console.log('Connecting to WS:', wsUrl);
                
                const ws = new WebSocket(wsUrl);
                
                ws.on('open', () => {
                    // Set standard desktop viewport
                    ws.send(JSON.stringify({
                        id: 1,
                        method: 'Emulation.setDeviceMetricsOverride',
                        params: {
                            width: 1280,
                            height: 800,
                            deviceScaleFactor: 1,
                            mobile: false
                        }
                    }));
                });
                
                let step = 0;
                
                ws.on('message', async (message) => {
                    const response = JSON.parse(message);
                    
                    if (response.id === 1) {
                        // Viewport set. Start capturing sections
                        captureNextSection(ws);
                    }
                    
                    if (response.id > 10 && response.id % 2 === 0) {
                        // Scroll evaluation done. Wait 1.5s, then capture screenshot
                        const sectionIndex = Math.floor((response.id - 10) / 2) - 1;
                        const currentSection = sections[sectionIndex];
                        console.log(`Scrolled to ${currentSection.name}. Waiting for reveal...`);
                        
                        setTimeout(() => {
                            ws.send(JSON.stringify({
                                id: response.id + 1,
                                method: 'Page.captureScreenshot',
                                params: { format: 'png' }
                            }));
                        }, 1500);
                    }
                    
                    if (response.id > 10 && response.id % 2 !== 0) {
                        // Screenshot data received. Write to file
                        const sectionIndex = Math.floor((response.id - 10) / 2) - 1;
                        const currentSection = sections[sectionIndex];
                        const base64Data = response.result.data;
                        const filename = path.join(__dirname, `screenshot_${currentSection.name}.png`);
                        fs.writeFileSync(filename, Buffer.from(base64Data, 'base64'));
                        console.log(`Captured: ${filename}`);
                        
                        // Proceed to next section or finish
                        step++;
                        if (step < sections.length) {
                            captureNextSection(ws);
                        } else {
                            console.log('All sections captured successfully!');
                            ws.close();
                            chromeProcess.kill();
                        }
                    }
                });
                
                function captureNextSection(websocket) {
                    const currentSection = sections[step];
                    const nextId = 10 + (step + 1) * 2;
                    console.log(`Navigating to section: ${currentSection.name}...`);
                    
                    const scrollScript = `
                        (function() {
                            const el = document.querySelector('${currentSection.selector}');
                            if (el) {
                                el.scrollIntoView({ behavior: 'auto', block: 'start' });
                                return true;
                            }
                            return false;
                        })()
                    `;
                    
                    websocket.send(JSON.stringify({
                        id: nextId,
                        method: 'Runtime.evaluate',
                        params: {
                            expression: scrollScript,
                            returnByValue: true
                        }
                    }));
                }
                
                ws.on('error', (err) => {
                    console.error('WS Error:', err);
                    chromeProcess.kill();
                });
            } catch (e) {
                console.error('Exception:', e);
                chromeProcess.kill();
            }
        });
    }).on('error', (err) => {
        console.error('HTTP Error:', err);
        chromeProcess.kill();
    });
}, 4000);
