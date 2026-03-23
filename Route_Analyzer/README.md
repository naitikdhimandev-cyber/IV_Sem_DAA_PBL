# Smart Route Optimization Simulator

This project is a **Design and Analysis of Algorithms (DAA)** implementation of a real-world route optimizer. While standard routing algorithms (like basic GPS systems) often calculate paths based solely on physical distance, this simulator calculates the **optimal path** dynamically by considering real-world constraints such as traffic density, weather conditions, road quality, and temperature.

---

## 🚀 How to Build and Run

The project is written in standard C11 and utilizes a clean separated-module structure. A `Makefile` is provided to make compilation effortless.

1. **Compile the project**:
   Open your terminal in the root directory of the project and run:
   ```bash
   make
   ```
   *(If you want to force a fresh recompile, run `make clean && make`)*

2. **Execute the Simulator**:
   ```bash
   ./route_simulator
   ```

---

## 🧠 Core Modules and Architecture

The codebase is divided into three primary modules to keep concerns completely separated: Data Structure (`graph`), Algorithm (`dijkstra`), and User Interface (`main`).

### 1. `graph.c` & `graph.h` (The Network Data Structure)
This module is responsible for keeping track of the city map. 
- **Adjacency Lists**: Instead of a massive memory-heavy 2D array, the graph uses an **Adjacency List** technique (`AdjNode`). This is an optimized, memory-efficient way to map nodes (cities/intersections) and edges (roads), achieving `O(V + E)` space complexity.
- **Edge Structure**: Each road connection stores not just the destination, but the factors dynamically affecting the road: distance, traffic, weather, road condition, and temperature.
- **Functions**: `init_graph()`, `add_edge()`, `display_graph()`

### 2. `dijkstra.c` & `dijkstra.h` (The Pathfinding Engine)
This module houses the core mathematical logic solving the route.
- **Dijkstra's Algorithm**: Implements the classic greedy algorithm to find the Single-Source Shortest Path. It utilizes a tracking array (`dist[]`) for minimum tracking and a `parent[]` array to successfully trace the exact turn-by-turn route back to the source.
- **Time Complexity**: The current array-based implementation operates at `O(V^2)` which is highly efficient for standard city matrices (`MAX_NODES = 100`).

### 3. `main.c` (The Controller & UI)
This serves as the central hub of the application.
- **GPS Output**: Handles the beautiful GPS-style Turn-by-Turn terminal outputs (`display_detailed_path`), tracking each individual step and reconstructing the path seamlessly.
- **File I/O Intelligence**: The `load_graph_from_file()` function reads standard mapped files (like `map.txt`) so large networks don't have to be typed by hand.
- **ANSI Color Coding**: Adds terminal-level color formatting for an app-like UX.

---

## 🧮 How Things Are Calculated (The Intelligence)

The true power of this DAA project is in the math dictating edge traversal. If Road A is 10km long but has gridlocked traffic, and Road B is 15km long but completely empty, the algorithm must choose Road B.

We solve this by throwing away raw "distance" and calculating a singular **Effective Cost** for every road.

### The Mathematical Formula:
> `Effective Cost = Base Distance × Traffic Factor × Weather Factor × Road Condition × Temperature`

**Example:**
Imagine a 10km road (`Distance = 10.0`).
- **Traffic**: Heavy (Multiplier: `1.5`)
- **Weather**: Rain (Multiplier: `1.2`)
- **Road Condition**: Poor (Multiplier: `1.4`)
- **Temperature**: Normal (Multiplier: `1.0`)

`Effective Cost = 10.0 × 1.5 × 1.2 × 1.4 × 1.0 = 25.2`

When Dijkstra's algorithm scans the network, it views that 10km road as effectively being **25.2km long**. The algorithm then shifts its greed dynamically, ignoring this road in favor of physically longer roads that have an effective cost of less than 25.2.

---

## 📂 Formats: Loading Maps (`real.txt` & `map.txt`)

To test massive road networks instantly without manual input, simply use the text file format.
The simulator now fully supports **Named Locations**, meaning you must list the names linearly at the top of the file!

**Format Spec:**
```text
<total_nodes> <total_edges>
<Node_0_Name>
<Node_1_Name>
...
<source_id> <destination_id> <distance> <traffic> <weather> <road_cond> <temperature>
```

**Example `real.txt` (Included Dehradun Map!):**
```text
12 16
Clock_Tower
ISBT
Rajpur_Road
...
0 1 7.5 1.4 1.0 1.2 1.0
1 10 3.0 1.2 1.0 1.0 1.0
...
```
