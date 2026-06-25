const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://localhost:8080/index.html';
const outputPath = path.join(__dirname, 'screenshot_full.png');

console.log('Starting Chrome headless with debugging for full page screenshot...');
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
                    console.log('WS connection opened. Triggering scroll reveals...');
                    
                    // We scroll down the page to trigger all scroll reveal animations first
                    const scrollRevealAndResize = `
                        (async function() {
                            // Scroll down gradually
                            const distance = 100;
                            const delay = 30;
                            const totalHeight = document.documentElement.scrollHeight;
                            let scrolled = 0;
                            while (scrolled < totalHeight) {
                                window.scrollBy(0, distance);
                                scrolled += distance;
                                await new Promise(r => setTimeout(r, delay));
                            }
                            // Scroll back to top
                            window.scrollTo(0, 0);
                            // Wait for animations to settle
                            await new Promise(r => setTimeout(r, 1000));
                            return {
                                width: document.documentElement.scrollWidth,
                                height: document.documentElement.scrollHeight
                            };
                        })()
                    `;
                    
                    ws.send(JSON.stringify({
                        id: 1,
                        method: 'Runtime.evaluate',
                        params: {
                            expression: scrollRevealAndResize,
                            awaitPromise: true,
                            returnByValue: true
                        }
                    }));
                });
                
                ws.on('message', (message) => {
                    const response = JSON.parse(message);
                    
                    if (response.id === 1) {
                        const dims = response.result.result.value;
                        console.log('Page Dimensions:', dims);
                        
                        // Set device metrics override to capture full height
                        ws.send(JSON.stringify({
                            id: 2,
                            method: 'Emulation.setDeviceMetricsOverride',
                            params: {
                                width: 1200,
                                height: dims.height,
                                deviceScaleFactor: 1,
                                mobile: false
                            }
                        }));
                    }
                    
                    if (response.id === 2) {
                        console.log('Viewport resized. Capturing screenshot...');
                        ws.send(JSON.stringify({
                            id: 3,
                            method: 'Page.captureScreenshot',
                            params: {
                                format: 'png',
                                captureBeyondViewport: true
                            }
                        }));
                    }
                    
                    if (response.id === 3) {
                        const base64Data = response.result.data;
                        fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
                        console.log('Success! Full screenshot written to:', outputPath);
                        
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
