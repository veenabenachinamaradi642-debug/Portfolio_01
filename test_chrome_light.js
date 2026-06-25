const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://localhost:8080/index.html';

console.log('Starting Chrome headless for Light Mode screenshots...');
const chromeProcess = exec(`"${chromePath}" --headless=new --no-sandbox --remote-debugging-port=9222 ${targetUrl}`);

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
                    // Set desktop viewport
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
                
                ws.on('message', (message) => {
                    const response = JSON.parse(message);
                    
                    if (response.id === 1) {
                        // Viewport set. Ingest JS to toggle light mode
                        ws.send(JSON.stringify({
                            id: 2,
                            method: 'Runtime.evaluate',
                            params: {
                                expression: `
                                    document.body.classList.add('light-mode');
                                    // Scroll to top
                                    window.scrollTo(0, 0);
                                    // Wait for particles and updates
                                    true;
                                `,
                                returnByValue: true
                            }
                        }));
                    }
                    
                    if (response.id === 2) {
                        // Capture light mode hero after delay
                        console.log('Toggled light mode and scrolled to top. Waiting for repaint...');
                        setTimeout(() => {
                            ws.send(JSON.stringify({
                                id: 3,
                                method: 'Page.captureScreenshot',
                                params: { format: 'png' }
                            }));
                        }, 1500);
                    }
                    
                    if (response.id === 3) {
                        const base64Data = response.result.data;
                        const filename = path.join(__dirname, 'screenshot_hero_light.png');
                        fs.writeFileSync(filename, Buffer.from(base64Data, 'base64'));
                        console.log('Captured Hero Light Mode');
                        
                        // Scroll to skills
                        ws.send(JSON.stringify({
                            id: 4,
                            method: 'Runtime.evaluate',
                            params: {
                                expression: `
                                    (function() {
                                        const el = document.querySelector('#skills');
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'auto', block: 'start' });
                                            // Force skills bars progress triggers
                                            const activeTab = document.querySelector('.skills-tab-content.active');
                                            if (activeTab) {
                                                const fills = activeTab.querySelectorAll('.progress-fill');
                                                fills.forEach(fill => {
                                                    const width = fill.parentElement.previousElementSibling.lastElementChild.textContent;
                                                    fill.style.width = width;
                                                });
                                            }
                                            return true;
                                        }
                                        return false;
                                    })()
                                `,
                                returnByValue: true
                            }
                        }));
                    }
                    
                    if (response.id === 4) {
                        console.log('Scrolled to Skills in Light Mode. Waiting...');
                        setTimeout(() => {
                            ws.send(JSON.stringify({
                                id: 5,
                                method: 'Page.captureScreenshot',
                                params: { format: 'png' }
                            }));
                        }, 1500);
                    }
                    
                    if (response.id === 5) {
                        const base64Data = response.result.data;
                        const filename = path.join(__dirname, 'screenshot_skills_light.png');
                        fs.writeFileSync(filename, Buffer.from(base64Data, 'base64'));
                        console.log('Captured Skills Light Mode');
                        
                        console.log('All Light Mode captures done!');
                        ws.close();
                        chromeProcess.kill();
                    }
                });
                
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
