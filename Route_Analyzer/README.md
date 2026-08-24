<p align="center">
  <h1 align="center">🚗 Smart Route Optimization Simulator</h1>
  <p align="center">
    <strong>A multi-factor shortest-path routing engine built with the Bellman-Ford algorithm</strong>
  </p>
  <p align="center">
    <em>Design & Analysis of Algorithms (DAA) — IV Semester Project</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Language-C11-blue?style=flat-square" alt="C11" />
  <img src="https://img.shields.io/badge/Algorithm-Bellman--Ford-orange?style=flat-square" alt="Bellman-Ford" />
  <img src="https://img.shields.io/badge/Frontend-HTML%2FJS%2FCSS-green?style=flat-square" alt="Frontend" />
  <img src="https://img.shields.io/badge/Live%20API-Node.js%20SSE-purple?style=flat-square" alt="Node.js SSE" />
  <img src="https://img.shields.io/badge/Build-Makefile-lightgrey?style=flat-square" alt="Makefile" />
</p>

---

## 📌 Overview

Standard GPS routing calculates paths based on raw physical distance alone. The real world is far more complex — a 10 km highway in a storm with gridlocked traffic is *far worse* than a 15 km clear back-road.

**Smart Route Optimization Simulator** solves this problem by computing an **Effective Cost** for every road segment using four real-world environmental multipliers, and then routing through the cheapest path using the **Bellman-Ford** shortest-path algorithm.

The project ships in **three layers**:

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **CLI Simulator** | C11 (gcc) | Terminal-based interactive routing with ANSI-colored GPS output |
| **Live Data API** | Node.js (SSE) | Streams randomized real-time environmental factor updates |
| **Web GUI** | HTML5 Canvas + Vanilla JS | Interactive graph visualization with drag, zoom, and live recalculation |

---

## ✨ Key Features

- **Multi-Factor Edge Weighting** — Each edge weight is a product of distance × traffic × weather × road condition × temperature
- **Bellman-Ford Algorithm** — Handles all edge-weight scenarios including negative-cycle detection with epsilon-safe floating point comparison
- **Early-Exit Optimization** — Skips remaining relaxation passes when no edge is updated (best-case `O(E)`)
- **Dynamic Condition Updates** — Modify individual road conditions at runtime (both directions updated atomically)
- **Force-Directed Graph Layout** — Physics-based node positioning (repulsion + spring attraction) for readable topology visualization
- **Real-Time Live API** — Server-Sent Events (SSE) stream continuously mutating environmental factors to the web GUI
- **Interactive Canvas** — Pan, zoom, click-to-select edges, per-edge or global factor sliders
- **Pre-built Map Presets** — Includes a 25-node Mega City, a real 12-node Dehradun city network, and smaller test graphs
- **Custom Map Input** — Paste or load any graph via standardized text format
- **Turn-by-Turn GPS Output** — Step-by-step navigation with per-hop distance and factor breakdown (CLI) and visual route highlighting (GUI)

---

## 🏗️ Architecture

```
Route_Analyzer/
├── main.c                  # CLI controller, menu system, file I/O, GPS output
├── graph.c / graph.h       # Graph data structure (adjacency lists), edge weight computation
├── bellman_ford.c / .h     # Bellman-Ford SSSP implementation with negative-cycle detection
├── Makefile                # Build configuration (gcc, C11, -Wall -Wextra)
├── map.txt                 # Sample graph: 5 nodes (generic locations)
├── real.txt                # Sample graph: 12 nodes (Dehradun city landmarks)
│
├── api/
│   └── server.js           # Node.js SSE server — streams live edge factor updates
│
└── gui/
    ├── index.html           # Landing page + main app layout
    ├── script.js            # JS Bellman-Ford, force-directed layout, canvas renderer
    └── style.css            # Monochrome design system (Inter font, glassmorphism cards)
```

### Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     Web GUI (Browser)                        │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐   │
│  │ Map Parser  │───>│ Bellman-Ford │───>│ Canvas Render  │   │
│  │ (text→graph)│    │ (JS impl.)   │    │ + Path Overlay │   │
│  └─────────────┘    └──────┬───────┘    └────────────────┘   │
│                            │                                  │
│         ┌──────────────────┘                                  │
│         ▼                                                     │
│  ┌──────────────┐     SSE Stream      ┌──────────────────┐   │
│  │ Edge Factors │<════════════════════>│  api/server.js   │   │
│  │   (live)     │    (localhost:3000)  │  (Node.js SSE)   │   │
│  └──────────────┘                     └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   CLI Simulator (Terminal)                    │
│                                                              │
│  main.c ───> graph.c (adjacency lists) ───> bellman_ford.c   │
│     │                                            │           │
│     └──── ANSI-colored GPS turn-by-turn <────────┘           │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧮 The Mathematical Model

### Effective Cost Formula

```
Effective Cost = Distance × Traffic Factor × Weather Factor × Road Condition Factor × Temperature Factor
```

### Factor Rating Scale

| Factor | Low (Best) | Normal | High (Worst) |
|:-------|:-----------|:-------|:--------------|
| 🚗 Traffic | 0.8 (free flow) | 1.0 | 1.5+ (gridlock) |
| 💨 Weather | 0.9 (clear) | 1.0 (cloudy) | 1.4+ (storm) |
| ⚠️ Road Condition | 0.9 (excellent) | 1.0 (good) | 1.4+ (poor) |
| 🌡️ Temperature | 0.95 (ideal) | 1.0 | 1.10 (extreme) |

### Worked Example

A 10 km road with heavy traffic (1.5×), rain (1.2×), and poor condition (1.4×):

```
Effective Cost = 10.0 × 1.5 × 1.2 × 1.4 = 25.2
```

The algorithm sees this road as "25.2 km" and will prefer a physically longer but lower-cost alternative.

---

## ⚙️ Algorithm Details — Bellman-Ford

### Why Bellman-Ford over Dijkstra?

While Dijkstra's algorithm is faster on non-negative graphs (`O(V²)` or `O((V+E) log V)` with a min-heap), **Bellman-Ford** was chosen because:

1. **Negative-cycle detection** — If misconfigured factors produce a cycle with net-negative cost, Bellman-Ford will detect and report it rather than looping infinitely.
2. **Simplicity** — Straightforward triple-loop structure that clearly demonstrates the relaxation principle for academic study.
3. **Correctness guarantee** — Works on any weighted graph (positive or negative edges).

### Complexity

| Metric | Value |
|:-------|:------|
| **Time Complexity** | `O(V × E)` worst case |
| **Space Complexity** | `O(V + E)` (adjacency list) |
| **Best Case** | `O(E)` (early exit when no relaxation occurs) |
| **Graph Capacity** | Up to `MAX_NODES = 100` nodes |

### Implementation Highlights (C Backend)

```c
// Relaxation with early-exit optimization
for (i = 1; i <= num_v - 1; i++) {
    int changed = 0;
    for (v = 0; v < num_v; v++) {
        /* ... relax all neighbors of v ... */
        if (dist[v] + weight < dist[u]) {
            dist[u] = dist[v] + weight;
            parent[u] = v;
            changed = 1;
        }
    }
    if (!changed) break;  // Early exit — O(E) best case
}

// Negative-cycle detection with epsilon tolerance
if (dist[v] + weight < dist[u] - 1e-9) return 0;
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Required For | Install |
|:-----|:-------------|:--------|
| `gcc` | CLI Simulator | Xcode CLT (macOS), `apt install gcc` (Ubuntu) |
| `make` | Build system | Included with gcc |
| `node` (v14+) | Live API Server | [nodejs.org](https://nodejs.org) |
| Modern browser | Web GUI | Chrome / Firefox / Safari |

### 1. Build & Run the CLI Simulator

```bash
# Clone or navigate to the project directory
cd Route_Analyzer

# Compile
make

# Run
./route_simulator
```

To force a clean rebuild:

```bash
make clean && make
```

### 2. Launch the Web GUI

```bash
# Open the GUI directly in your browser
open gui/index.html        # macOS
# or
xdg-open gui/index.html   # Linux
```

From the landing page, select a preset map (Mega City, Dehradun, Default, or Test) or paste custom map data.

### 3. Enable Live Data Streaming (Optional)

```bash
# Start the SSE server
node api/server.js
```

Then click **🔴 CONNECT LIVE API** in the web GUI sidebar. The button turns **🟢 LIVE DATA: ON** when connected. Edge factors will update every 2 seconds with randomized environmental data.

---

## 📂 Map File Format

Both the CLI simulator (`Load from file` option) and the web GUI accept the same text format:

```
<num_nodes> <num_edges>
<Node_0_Name>
<Node_1_Name>
...
<Node_N-1_Name>
<from> <to> <distance> <traffic> <weather> <road_condition> <temperature>
...
```

### Example — `real.txt` (Dehradun City Network)

```
12 16
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
0 9 1.5 1.5 1.0 1.2 1.0
1 10 3.0 1.2 1.0 1.0 1.0
1 0 7.5 1.4 1.0 1.2 1.0
...
```

> **Node indices** are 0-based. Names use underscores (displayed as spaces in the GUI).  
> **Edges are bidirectional** — the graph automatically creates reverse edges.

---

## 🖥️ CLI Simulator Menu

```
============================================
 🚗 SMART ROUTE OPTIMIZATION SIMULATOR 🚗
============================================
  1. Create/Update Road Network Manually
  2. Load Road Network from File (e.g. map.txt)
  3. Display Current Road Network Layout
  4. Find Shortest Path (Turn-by-Turn GPS)
  5. Update Specific Road Conditions Dynamically
  6. Show Rating Parameters/Factors Help
  7. Exit
```

### Sample Turn-by-Turn Output

```
=== 🧭 Turn-by-Turn GPS Navigation ===
[Start] at Clock Tower
  ↓ Take road to Rajpur Road (Dist: 2.5km, Traffic: 1.2x, Weather: 1.0x)
  ↓ Take road to Pacific Mall (Dist: 5.0km, Traffic: 1.0x, Weather: 1.0x)
  ↓ Take road to DIT University (Dist: 4.5km, Traffic: 0.8x, Weather: 1.0x)
[Arrived] at DIT University!

Total Travel Distance: 12.0km
Total Effective Cost:  11.60
```

---

## 🌐 Web GUI Features

| Feature | Description |
|:--------|:------------|
| **Preset Maps** | Mega City (25 nodes), Real Dehradun (12 nodes), Default (6 nodes), Test (5 nodes) |
| **Custom Input** | Paste any map data in the standard text format |
| **Force-Directed Layout** | Physics simulation positions nodes for readability (150 iterations, spring + repulsion forces) |
| **Canvas Interaction** | Click-drag to pan, scroll to zoom, click edges to select |
| **Per-Edge Editing** | Select an edge → sliders control that specific edge's factors |
| **Global Editing** | No edge selected → sliders apply to all edges simultaneously |
| **Path Overlay** | Shortest path rendered as bold black lines with turn-by-turn steps |
| **Live API** | SSE connection to `localhost:3000` for real-time factor updates every 2s |

---

## 🛠️ Tech Stack Summary

| Component | Technology | Key Details |
|:----------|:-----------|:------------|
| Core Algorithm | **C11** | Bellman-Ford with `O(V×E)` complexity, early-exit, ε-safe negative-cycle detection |
| Data Structure | **Adjacency List** | `O(V+E)` space, linked-list per node, bidirectional edges |
| Build System | **GNU Make** | `gcc -Wall -Wextra -std=c11` |
| Live API | **Node.js** | HTTP server with SSE (`text/event-stream`), CORS-enabled, 2s interval |
| Frontend | **HTML5 Canvas** | Force-directed layout, custom renderer, pan/zoom/select interactions |
| Styling | **Vanilla CSS** | Inter font, monochrome design, glassmorphism cards |

---

## 📜 License

This project was built as an academic submission for the **Design & Analysis of Algorithms** course (IV Semester). Feel free to use, modify, and learn from it.

---

<p align="center">
  <sub>Built with ❤️ using C, JavaScript, and graph theory</sub>
</p>
