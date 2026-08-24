const http = require('http');


function rand(min, max) {
    return Math.random() * (max - min) + min;
}

const server = http.createServer((req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/live') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        console.log('Client connected to Live Data Stream');

        res.write('data: {"status": "connected"}\n\n');


        const intervalId = setInterval(() => {
            const edgeData = {};

            for (let i = 0; i < 200; i++) {
                edgeData[`e${i}`] = {
                    traffic: rand(0.8, 4.0),   
                    weather: rand(1.0, 1.8),    
                    road: rand(0.9, 1.5),      
                    temp: Math.min(1.0, rand(0.9, 1.1))
                };
            }

            res.write(`data: ${JSON.stringify({ edgeFactors: edgeData })}\n\n`);
        }, 2000);

        req.on('close', () => {
            console.log('Client disconnected from stream');
            clearInterval(intervalId);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Live Data API Server running on http://localhost:${PORT}`);
    console.log(`SSE Stream endpoint available at http://localhost:${PORT}/live`);
});
