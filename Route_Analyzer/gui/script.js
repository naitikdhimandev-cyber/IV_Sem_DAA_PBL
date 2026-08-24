let nodes = [];
let edges = [];
let edgeFactors = {};
let selectedEdgeId = null;
let sourceId = null;
let targetId = null;
let currentResult = { path: [], totalDistance: 0, totalCost: 0 };

// --- Default Data ---
const DEFAULT_MAP_DATA = `6 8
Clock_Tower
ISBT
Rajpur_Road
Pacific_Mall
Railway_Station
Ballupur_Chowk
0 1 7.5 1.0 1.0 1.0 1.0
0 2 4.2 1.0 1.0 1.0 1.0
2 3 3.5 1.0 1.0 1.0 1.0
1 4 6.0 1.0 1.0 1.0 1.0
1 5 3.2 1.0 1.0 1.0 1.0
5 4 4.5 1.0 1.0 1.0 1.0
3 4 8.0 1.0 1.0 1.0 1.0
0 4 5.5 1.0 1.0 1.0 1.0`;

const REAL_MAP_DATA = `12 16
Clock_Tower
ISBT
Rajpur_Road
Prem_Nagar
Sahastradhara
Robbers_Cave
Pacific_Mall
FRI
Tapkeshwar
Paltan_Bazaar
Graphic_Era_University
DIT_University
0 9 1.5 1.0 1.0 1.0 1.0
1 10 3.0 1.0 1.0 1.0 1.0
1 0 7.5 1.0 1.0 1.0 1.0
0 2 2.5 1.0 1.0 1.0 1.0
2 6 5.0 1.0 1.0 1.0 1.0
6 11 4.5 1.0 1.0 1.0 1.0
4 11 6.0 1.0 1.0 1.0 1.0
2 5 7.0 1.0 1.0 1.0 1.0
0 7 6.5 1.0 1.0 1.0 1.0
7 3 4.5 1.0 1.0 1.0 1.0
0 8 5.5 1.0 1.0 1.0 1.0
10 7 8.0 1.0 1.0 1.0 1.0
3 7 4.5 1.0 1.0 1.0 1.0
1 3 10.0 1.0 1.0 1.0 1.0
0 4 12.0 1.0 1.0 1.0 1.0
9 6 6.0 1.0 1.0 1.0 1.0`;

const TEST_MAP_DATA = `5 6
Location_A
Location_B
Location_C
Location_D
Location_E
0 1 10.0 1.0 1.0 1.0 1.0
1 2 5.0 1.0 1.0 1.0 1.0
0 2 12.0 1.0 1.0 1.0 1.0
2 3 7.0 1.0 1.0 1.0 1.0
3 4 8.0 1.0 1.0 1.0 1.0
2 4 18.0 1.0 1.0 1.0 1.0`;

const MEGA_MAP_DATA = `25 40
City_Center
North_District
East_District
South_District
West_District
Airport
Sea_Port
Tech_Park
University
Stadium
Industrial_Zone
Financial_Hub
Resident_A
Resident_B
Resident_C
Shopping_Mall
Central_Station
Hospital_Main
Central_Park
Subway_Hub
Highway_A
Highway_B
Forest_Reserve
Lake_View
Mountain_Pass
0 1 4.5 1.0 1.0 1.0 1.0
0 2 3.2 1.0 1.0 1.0 1.0
0 3 5.1 1.0 1.0 1.0 1.0
0 4 3.8 1.0 1.0 1.0 1.0
0 16 1.5 1.0 1.0 1.0 1.0
16 19 2.0 1.0 1.0 1.0 1.0
1 5 12.0 1.0 1.0 1.0 1.0
1 7 6.5 1.0 1.0 1.0 1.0
1 12 2.5 1.0 1.0 1.0 1.0
2 6 14.5 1.0 1.0 1.0 1.0
2 11 4.0 1.0 1.0 1.0 1.0
2 13 3.5 1.0 1.0 1.0 1.0
3 8 5.5 1.0 1.0 1.0 1.0
3 9 4.2 1.0 1.0 1.0 1.0
3 14 3.0 1.0 1.0 1.0 1.0
4 10 8.5 1.0 1.0 1.0 1.0
4 15 2.8 1.0 1.0 1.0 1.0
4 17 3.5 1.0 1.0 1.0 1.0
5 20 18.0 1.0 1.0 1.0 1.0
6 21 15.5 1.0 1.0 1.0 1.0
7 8 7.2 1.0 1.0 1.0 1.0
8 18 4.5 1.0 1.0 1.0 1.0
9 15 6.0 1.0 1.0 1.0 1.0
10 6 11.0 1.0 1.0 1.0 1.0
11 16 2.5 1.0 1.0 1.0 1.0
12 18 3.2 1.0 1.0 1.0 1.0
13 15 5.5 1.0 1.0 1.0 1.0
14 17 6.2 1.0 1.0 1.0 1.0
15 0 4.0 1.0 1.0 1.0 1.0
17 0 2.5 1.0 1.0 1.0 1.0
18 0 3.0 1.0 1.0 1.0 1.0
19 1 4.5 1.0 1.0 1.0 1.0
19 2 4.2 1.0 1.0 1.0 1.0
19 3 3.8 1.0 1.0 1.0 1.0
19 4 4.0 1.0 1.0 1.0 1.0
20 21 25.0 1.0 1.0 1.0 1.0
22 1 9.5 1.0 1.0 1.0 1.0
22 24 12.0 1.0 1.0 1.0 1.0
23 2 8.0 1.0 1.0 1.0 1.0
24 4 15.0 1.0 1.0 1.0 1.0`;

// --------------------------------------- Parser ---------------------------------------
function parseMapData(rawStr) {
    const lines = rawStr.trim().split(/\s+/);
    if (lines.length < 2) return null;

    let idx = 0;
    const numNodes = parseInt(lines[idx++]);
    const numEdges = parseInt(lines[idx++]);

    const newNodes = [];
    for (let i = 0; i < numNodes; i++) {
        newNodes.push({ id: i.toString(), name: lines[idx++].replace(/_/g, ' ') });
    }

    const newEdges = [];
    for (let i = 0; i < numEdges; i++) {
        const from = lines[idx++];
        const to = lines[idx++];
        const distance = parseFloat(lines[idx++]);
        const traffic = parseFloat(lines[idx++]);
        const weather = parseFloat(lines[idx++]);
        const road = parseFloat(lines[idx++]);
        const temp = parseFloat(lines[idx++]);
        newEdges.push({ id: `e${i}`, from, to, distance, traffic, weather, road, temp });
    }

    return { nodes: newNodes, edges: newEdges };
}

function applyForceDirectedLayout(nodesList, edgesList) {

    nodesList.forEach((node) => {
        node.x = Math.random() * 800;
        node.y = Math.random() * 800;
        node.vx = 0; node.vy = 0;
    });

    const iterations = 150;
    const kRepel = 6000;  
    const kSpring = 0.04; 
    const damping = 0.85; 

    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < nodesList.length; i++) {
            for (let j = i + 1; j < nodesList.length; j++) {
                const u = nodesList[i], v = nodesList[j];
                const dx = u.x - v.x, dy = u.y - v.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = kRepel / (dist * dist);
                const fx = (dx / dist) * force, fy = (dy / dist) * force;
                u.vx += fx; u.vy += fy;
                v.vx -= fx; v.vy -= fy;
            }
        }


        edgesList.forEach(edge => {
            const u = nodesList.find(n => n.id === edge.from);
            const v = nodesList.find(n => n.id === edge.to);
            if (!u || !v) return;
            const dx = v.x - u.x, dy = v.y - u.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;


            const targetDist = Math.max(edge.distance * 15, 60);

            const force = (dist - targetDist) * kSpring;
            const fx = (dx / dist) * force, fy = (dy / dist) * force;
            u.vx += fx; u.vy += fy;
            v.vx -= fx; v.vy -= fy;
        });


        nodesList.forEach(node => {
            node.x += node.vx; node.y += node.vy;
            node.vx *= damping; node.vy *= damping;
        });
    }
}

// --------------------------------------- bellman ford  ---------------------------------------
function computeWeight(edge) {
    const ef = edgeFactors[edge.id];
    return edge.distance * ef.traffic * ef.weather * ef.road * ef.temp;
}

function runBellmanFord() {
    const dist = {};
    const parent = {};

    nodes.forEach(n => { dist[n.id] = Infinity; parent[n.id] = null; });
    if (sourceId === null) return { path: [], totalDistance: 0, totalCost: 0 };
    dist[sourceId] = 0;

    for (let i = 1; i < nodes.length; i++) {
        let changed = false;
        edges.forEach(edge => {
            const u = edge.from;
            const v = edge.to;
            const w = computeWeight(edge);
            if (dist[u] !== Infinity && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; parent[v] = u; changed = true; }
            if (dist[v] !== Infinity && dist[v] + w < dist[u]) { dist[u] = dist[v] + w; parent[u] = v; changed = true; }
        });
        if (!changed) break;
    }

    let negativeCycle = false;
    edges.forEach(edge => {
        const u = edge.from, v = edge.to;
        const w = computeWeight(edge);
        if (dist[u] !== Infinity && dist[u] + w < dist[v] - 0.001) negativeCycle = true;
        if (dist[v] !== Infinity && dist[v] + w < dist[u] - 0.001) negativeCycle = true;
    });

    if (negativeCycle) return { path: [], totalDistance: 0, totalCost: 0, error: "Negative Cycle!" };
    if (dist[targetId] === Infinity) return { path: [], totalDistance: 0, totalCost: 0, error: "No Path" };

    const path = [];
    let curr = targetId;
    let distSum = 0;
    while (curr !== null) {
        path.push(curr);
        let prev = parent[curr];
        if (prev !== null) {
            const edge = edges.find(e => (e.from === prev && e.to === curr) || (e.from === curr && e.to === prev));
            distSum += (edge ? edge.distance : 0);
        }
        if (curr === sourceId) break;
        curr = prev;
    }
    return { path: path.reverse(), totalDistance: distSum, totalCost: dist[targetId] };
}


const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
let offsetX = 0, offsetY = 0;

let transform = { x: 0, y: 0, scale: 1 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };

function resizeCanvas(fitToScreen = false) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    if (nodes.length > 0 && fitToScreen) {
        const minX = Math.min(...nodes.map(n => n.x)), maxX = Math.max(...nodes.map(n => n.x));
        const minY = Math.min(...nodes.map(n => n.y)), maxY = Math.max(...nodes.map(n => n.y));
        const graphW = maxX - minX;
        const graphH = maxY - minY;

        const scaleX = (canvas.width * 0.8) / (graphW || 1);
        const scaleY = (canvas.height * 0.8) / (graphH || 1);
        transform.scale = Math.min(scaleX, scaleY);

        offsetX = -minX;
        offsetY = -minY;
        transform.x = (canvas.width - graphW * transform.scale) / 2;
        transform.y = (canvas.height - graphH * transform.scale) / 2;
    }
    drawGraph();
}

function getPos(n) { return { x: n.x + offsetX, y: n.y + offsetY }; }

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (nodes.length === 0) return;

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    edges.forEach(edge => {
        const u = getPos(nodes.find(n => n.id === edge.from));
        const v = getPos(nodes.find(n => n.id === edge.to));
        const isPath = currentResult.path.some((id, i) => (id === edge.from && currentResult.path[i + 1] === edge.to) || (id === edge.to && currentResult.path[i + 1] === edge.from));
        const isSelected = edge.id === selectedEdgeId;

        ctx.beginPath();
        ctx.moveTo(u.x, u.y); ctx.lineTo(v.x, v.y);
        ctx.strokeStyle = isSelected ? '#3b82f6' : (isPath ? '#000' : '#ddd');
        ctx.lineWidth = isSelected ? 5 : (isPath ? 3 : 1.5);
        ctx.stroke();

        const midX = (u.x + v.x) / 2;
        const midY = (u.y + v.y) / 2;
        ctx.fillStyle = '#888';
        ctx.font = '500 10px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const label = edge.distance.toFixed(1);
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = '#fff';
        ctx.fillRect(midX - textWidth / 2 - 2, midY - 6, textWidth + 4, 12);

        ctx.fillStyle = isSelected ? '#3b82f6' : '#888';
        ctx.fillText(label, midX, midY);
    });

    nodes.forEach(node => {
        const pos = getPos(node);
        const isSource = node.id === sourceId, isTarget = node.id === targetId;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = (isSource || isTarget) ? '#000' : '#fff'; ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.font = (isSource || isTarget) ? '800 11px Inter' : '600 10px Inter';
        ctx.textAlign = 'center'; ctx.fillText(node.name.toUpperCase(), pos.x, pos.y - 15);
    });

    ctx.restore();
}

function getDistanceToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2; if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2; t = Math.max(0, Math.min(1, t));
    return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
}
// ---------------------------------------
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    const worldX = (mx - transform.x) / transform.scale;
    const worldY = (my - transform.y) / transform.scale;

    let closestEdge = null, minDist = 15 / transform.scale;
    edges.forEach(edge => {
        const u = getPos(nodes.find(n => n.id === edge.from)), v = getPos(nodes.find(n => n.id === edge.to));
        const dist = getDistanceToSegment(worldX, worldY, u.x, u.y, v.x, v.y);
        if (dist < minDist) { minDist = dist; closestEdge = edge; }
    });

    if (closestEdge) {
        if (selectedEdgeId === closestEdge.id) selectedEdgeId = null;
        else selectedEdgeId = closestEdge.id;
        syncSidebarWithSelected(); updateUI();
    } else {
        isDragging = true;
        dragStart = { x: mx - transform.x, y: my - transform.y };
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    transform.x = mx - dragStart.x;
    transform.y = my - dragStart.y;
    drawGraph();
});


// ---------------------------------------

window.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'default'; });
canvas.addEventListener('mouseleave', () => { isDragging = false; canvas.style.cursor = 'default'; });

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    const worldXBefore = (mx - transform.x) / transform.scale;
    const worldYBefore = (my - transform.y) / transform.scale;

    const zoomFactor = 1.1;
    if (e.deltaY < 0) transform.scale *= zoomFactor;
    else transform.scale /= zoomFactor;

    transform.scale = Math.max(0.1, Math.min(transform.scale, 8));

    transform.x = mx - worldXBefore * transform.scale;
    transform.y = my - worldYBefore * transform.scale;

    drawGraph();
}, { passive: false });

function syncSidebarWithSelected() {
    const label = document.getElementById('factor-ctx-label');
    const edge = edges.find(e => e.id === selectedEdgeId);
    if (edge) {
        const u = nodes.find(n => n.id === edge.from).name, v = nodes.find(n => n.id === edge.to).name;
        label.innerText = `Route: ${u} ↔ ${v}`;
        const f = edgeFactors[edge.id];
        ['traffic', 'weather', 'road', 'temp'].forEach(t => updateSlider(t, f[t]));
    } else { label.innerText = `Environmental Factors (Global Mode)`; }
}

function updateSlider(type, val) {
    document.getElementById(`${type}-slider`).value = val;
    document.getElementById(`${type}-val`).innerText = `${val.toFixed(1)}x`;
}

function updateUI() {
    currentResult = runBellmanFord();
    document.getElementById('total-dist').innerText = `${currentResult.totalDistance.toFixed(1)} km`;
    document.getElementById('total-cost').innerText = currentResult.totalCost.toFixed(2);
    const list = document.getElementById('route-list'); list.innerHTML = '';
    currentResult.path.forEach((id, i) => {
        const node = nodes.find(n => n.id === id);
        const div = document.createElement('div'); div.className = 'route-step';
        const isStart = i === 0, isEnd = i === currentResult.path.length - 1;
        if (isStart || isEnd) div.innerHTML = `<span class="step-dot ${isStart ? 'start' : 'end'}"></span> ${node.name.toUpperCase()}`;
        else div.innerHTML = `<span class="step-arrow">↓</span> ${node.name.toUpperCase()}`;
        list.appendChild(div);
    });
    drawGraph();
}

// --- App Launch ---
function launchApp(data) {
    nodes = data.nodes;
    edges = data.edges;
    edgeFactors = {};
    edges.forEach(e => {
        edgeFactors[e.id] = { traffic: e.traffic, weather: e.weather, road: e.road, temp: e.temp };
    });


    applyForceDirectedLayout(nodes, edges);

    const sSelect = document.getElementById('source-select');
    const tSelect = document.getElementById('target-select');
    sSelect.innerHTML = ''; tSelect.innerHTML = '';
    nodes.forEach(n => {
        sSelect.add(new Option(n.name.toUpperCase(), n.id));
        tSelect.add(new Option(n.name.toUpperCase(), n.id));
    });
    sourceId = nodes[0].id;
    targetId = nodes[nodes.length - 1].id;
    sSelect.value = sourceId; tSelect.value = targetId;

    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');

    requestAnimationFrame(() => {
        resizeCanvas(true);
        updateUI();
    });
}

// --- Init Listeners ---
document.getElementById('load-preset-btn').onclick = () => {
    const val = document.getElementById('map-preset').value;
    let data = DEFAULT_MAP_DATA;
    if (val === 'real') data = REAL_MAP_DATA;
    if (val === 'test') data = TEST_MAP_DATA;
    if (val === 'mega') data = MEGA_MAP_DATA;
    launchApp(parseMapData(data));
};

document.getElementById('launch-btn').onclick = () => {
    const input = document.getElementById('map-input').value;
    const data = parseMapData(input);
    if (data) launchApp(data);
    else alert("Invalid map data format!");
};

let liveEventSource = null;
document.getElementById('live-api-btn').onclick = () => {
    const btn = document.getElementById('live-api-btn');
    if (liveEventSource) {
        // Disconnect
        liveEventSource.close();
        liveEventSource = null;
        btn.innerText = '🔴 CONNECT LIVE API';
        btn.style.borderColor = '#000';
        btn.style.color = '#000';
        btn.style.background = '#fff';
    } else {
        // Connect
        btn.innerText = '🟡 CONNECTING...';
        liveEventSource = new EventSource('http://localhost:3000/live');

        liveEventSource.onopen = () => {
            btn.innerText = '🟢 LIVE DATA: ON';
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            btn.style.background = 'rgba(16, 185, 129, 0.1)';
        };

        liveEventSource.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                if (payload.status) return; 

                if (payload.edgeFactors) {
                    edges.forEach(edge => {
                        const data = payload.edgeFactors[edge.id];
                        if (data) {
                            edgeFactors[edge.id].traffic = data.traffic;
                            edgeFactors[edge.id].weather = data.weather;
                            edgeFactors[edge.id].road = data.road;
                            edgeFactors[edge.id].temp = data.temp;
                        }
                    });
                }

                if (selectedEdgeId) syncSidebarWithSelected();

                updateUI();
            } catch (e) { }
        };

        liveEventSource.onerror = () => {
            btn.innerText = '🔴 CONNECTION FAILED';
            liveEventSource.close();
            liveEventSource = null;
            setTimeout(() => {
                if (!liveEventSource) {
                    btn.innerText = '🔴 CONNECT LIVE API';
                    btn.style.borderColor = '#000';
                    btn.style.color = '#000';
                    btn.style.background = '#fff';
                }
            }, 2000);
        };
    }
};

document.getElementById('source-select').onchange = (e) => { sourceId = e.target.value; updateUI(); };
document.getElementById('target-select').onchange = (e) => { targetId = e.target.value; updateUI(); };

['traffic', 'weather', 'road', 'temp'].forEach(type => {
    const el = document.getElementById(`${type}-slider`);
    el.oninput = (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById(`${type}-val`).innerText = `${val.toFixed(1)}x`;
        if (selectedEdgeId) edgeFactors[selectedEdgeId][type] = val;
        else edges.forEach(edge => edgeFactors[edge.id][type] = val);
        updateUI();
    };
});

window.addEventListener('resize', resizeCanvas);
document.getElementById('recalc-btn').onclick = updateUI;
