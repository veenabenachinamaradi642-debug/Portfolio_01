const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputPath = path.join(__dirname, 'screenshot.png');
const targetUrl = 'http://localhost:8080/index.html';

const command = `"${chromePath}" --headless=new --no-sandbox --disable-gpu --screenshot="${outputPath}" --window-size=1280,1024 ${targetUrl}`;

console.log('Running command:', command);

exec(command, (err, stdout, stderr) => {
    console.log('Error:', err);
    console.log('Stdout:', stdout);
    console.log('Stderr:', stderr);
    
    if (fs.existsSync(outputPath)) {
        console.log('Success! Screenshot created at:', outputPath);
    } else {
        console.log('Failure: Screenshot was not created.');
    }
});
