const { exec } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://localhost:8080/index.html';

// We run Chrome with remote debugging port to query it, or we just evaluate scripts via chrome headless dump.
// A simpler way is to use Chrome with --dump-dom. But dump-dom prints the HTML immediately before JS runs.
// We can use a Node script that runs Chrome, but wait, we can also use a Puppeteer-like fetch.
// Actually, since we have Chrome running, let's write a Node script that runs Chrome in headless mode with remote debugging,
// and uses chrome-remote-interface or simply waits and evaluates.
// Wait! Let's check if we can run Chrome and pass a script using --repl or another technique?
// No, the simplest way is to fetch the page using a Node script with a small delay and print the body.
// Wait, Node.js doesn't have a built-in browser, so it will just get the static HTML.
// Let's write a script that uses Puppeteer? Wait, we don't have Puppeteer installed.
// We can write a script that starts Chrome with remote debugging:
// chrome.exe --headless=new --remote-debugging-port=9222 http://localhost:8080/index.html
// And then we can query the debugging port from Node!
// Let's write that script. It is very simple and standard!

const fs = require('fs');
const http = require('http');

console.log('Starting Chrome with remote debugging...');
const chromeProcess = exec(`"${chromePath}" --headless=new --no-sandbox --remote-debugging-port=9222 ${targetUrl}`);

setTimeout(() => {
    // Fetch tab list from Chrome debugging port
    http.get('http://localhost:9222/json/list', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const tabs = JSON.parse(data);
                console.log('Active Tabs:', tabs);
                if (tabs.length > 0) {
                    const wsUrl = tabs[0].webSocketDebuggerUrl;
                    console.log('WebSocket Debugger URL:', wsUrl);
                    
                    // We can connect to the WS and send Page.evaluate or just use simple HTTP.
                    // Wait, Chrome has a simple HTTP endpoint for evaluation? No, only WebSocket.
                    // But wait! We can install the ws library or just write a basic WebSocket handshake in Node.js!
                    // Even simpler: we can just run a browser script that writes the DOM to window.localStorage
                    // or console.logs it, and we can read it from Chrome logs?
                    // Yes! If our script in script.js logs the outerHTML of the socials, it will be printed in Chrome's stderr!
                    // Let's check if the current Chrome stderr has any logs.
                }
            } catch (e) {
                console.error('Error parsing tabs:', e);
            }
            chromeProcess.kill();
        });
    }).on('error', (err) => {
        console.error('HTTP Error:', err);
        chromeProcess.kill();
    });
}, 3000);
