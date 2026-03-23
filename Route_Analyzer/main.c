#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "graph.h"
#include "dijkstra.h"

// ANSI Color Codes
#define COLOR_RESET   "\033[0m"
#define COLOR_RED     "\033[1;31m"
#define COLOR_GREEN   "\033[1;32m"
#define COLOR_YELLOW  "\033[1;33m"
#define COLOR_CYAN    "\033[1;36m"
#define COLOR_MAGENTA "\033[1;35m"
#define COLOR_BOLD    "\033[1m"

static void clear_input_buffer(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF) {
    }
}

static void build_graph_from_user(Graph *g) {
    int num_nodes, num_edges;
    int i;

    printf(COLOR_CYAN "\nEnter number of nodes (max %d): " COLOR_RESET, MAX_NODES);
    if (scanf("%d", &num_nodes) != 1 || num_nodes <= 0 || num_nodes > MAX_NODES) {
        printf(COLOR_RED "[!] Invalid number of nodes.\n" COLOR_RESET);
        clear_input_buffer();
        return;
    }

    init_graph(g, num_nodes);

    printf(COLOR_CYAN "Enter number of edges: " COLOR_RESET);
    if (scanf("%d", &num_edges) != 1 || num_edges < 0) {
        printf(COLOR_RED "[!] Invalid number of edges.\n" COLOR_RESET);
        clear_input_buffer();
        return;
    }

    printf("\n" COLOR_YELLOW "Enter edges in the format:" COLOR_RESET "\n");
    printf(COLOR_BOLD "from to distance traffic_factor weather_factor road_condition_factor temperature_factor\n" COLOR_RESET);
    printf("Node indices should be between 0 and %d.\n", num_nodes - 1);

    for (i = 0; i < num_edges; i++) {
        int from, to;
        double distance;
        double traffic_factor, weather_factor, road_condition_factor, temperature_factor;

        printf("Edge %d: ", i + 1);
        if (scanf("%d %d %lf %lf %lf %lf %lf",
                  &from, &to, &distance,
                  &traffic_factor, &weather_factor,
                  &road_condition_factor, &temperature_factor) != 7) {
            printf(COLOR_RED "[!] Invalid input format for edge. Stopping edge input.\n" COLOR_RESET);
            clear_input_buffer();
            break;
        }

        add_edge(g, from, to, distance,
                 traffic_factor, weather_factor,
                 road_condition_factor, temperature_factor);
    }
    printf(COLOR_GREEN "[+] Manual graph creation successful.\n" COLOR_RESET);
}

static void load_graph_from_file(Graph *g) {
    char filename[256];
    printf(COLOR_CYAN "\nEnter filename to load (e.g., map.txt): " COLOR_RESET);
    if (scanf("%255s", filename) != 1) {
        clear_input_buffer();
        return;
    }

    FILE *f = fopen(filename, "r");
    if (!f) {
        printf(COLOR_RED "[!] Error: Could not open file '%s'\n" COLOR_RESET, filename);
        return;
    }

    int num_nodes, num_edges;
    if (fscanf(f, "%d %d", &num_nodes, &num_edges) != 2) {
        printf(COLOR_RED "[!] Invalid file format. Expected: <nodes> <edges>\n" COLOR_RESET);
        fclose(f);
        return;
    }

    if (num_nodes <= 0 || num_nodes > MAX_NODES) {
        printf(COLOR_RED "[!] Invalid number of nodes in file.\n" COLOR_RESET);
        fclose(f);
        return;
    }

    init_graph(g, num_nodes);

    // Read node names
    for (int i = 0; i < num_nodes; i++) {
        if (fscanf(f, "%63s", g->node_names[i]) != 1) {
            printf(COLOR_RED "[!] Error reading name for location %d\n" COLOR_RESET, i);
        }
    }

    int loaded_edges = 0;
    for (int i = 0; i < num_edges; i++) {
        int from, to;
        double dist, trafic, weath, road, temp;
        if (fscanf(f, "%d %d %lf %lf %lf %lf %lf", &from, &to, &dist, &trafic, &weath, &road, &temp) == 7) {
            add_edge(g, from, to, dist, trafic, weath, road, temp);
            loaded_edges++;
        }
    }

    fclose(f);
    printf(COLOR_GREEN "\n[+] Successfully loaded graph with %d nodes and %d edges from '%s'.\n" COLOR_RESET, num_nodes, loaded_edges, filename);
}

static void display_detailed_path(const Graph *g, int parent[], int dest, int source) {
    int path[MAX_NODES];
    int count = 0;
    int curr = dest;
    
    // Build path sequence backward
    while (curr != -1) {
        path[count++] = curr;
        if (curr == source) break;
        curr = parent[curr];
    }

    printf("\n" COLOR_CYAN "=== 🧭 Turn-by-Turn GPS Navigation ===" COLOR_RESET "\n");
    printf(COLOR_GREEN "[Start]" COLOR_RESET " at %s\n", g->node_names[path[count-1]]);
    
    double total_eff_cost = 0;
    double total_distance = 0;
    
    // Traverse forward to print
    for (int i = count - 1; i > 0; i--) {
        int u = path[i];
        int v = path[i-1];
        
        // Find edge u->v
        AdjNode *cur = g->adj_lists[u];
        Edge *edge = NULL;
        while (cur != NULL) {
            if (cur->edge.to == v) {
                edge = &cur->edge;
                break;
            }
            cur = cur->next;
        }
        
        if (edge) {
            total_eff_cost += edge->final_weight;
            total_distance += edge->distance;
            printf("  " COLOR_YELLOW "↓" COLOR_RESET " Take road to " COLOR_BOLD "%s" COLOR_RESET " (Dist: " COLOR_MAGENTA "%.1fkm" COLOR_RESET ", Traffic: %.1fx, Weather: %.1fx)\n", 
                   g->node_names[v], edge->distance, edge->traffic_factor, edge->weather_factor);
        } else {
            printf("  " COLOR_RED "[Error: Edge %d->%d not found]" COLOR_RESET "\n", u, v);
        }
    }
    printf(COLOR_GREEN "[Arrived]" COLOR_RESET " at %s!\n", g->node_names[dest]);
    printf("\nTotal Travel Distance: " COLOR_MAGENTA "%.1fkm\n" COLOR_RESET, total_distance);
    printf("Total Effective Cost:  " COLOR_RED "%.2f\n" COLOR_RESET, total_eff_cost);
}

static void run_shortest_path(const Graph *g) {
    if (g->num_nodes <= 0) {
        printf(COLOR_RED "\n[!] Graph is empty. Please load or create a road network first.\n" COLOR_RESET);
        return;
    }

    printf(COLOR_CYAN "\nAvailable Locations:\n" COLOR_RESET);
    for (int i = 0; i < g->num_nodes; i++) {
        printf("  %d: %s\n", i, g->node_names[i]);
    }

    int source, dest;
    printf(COLOR_CYAN "\nEnter source location ID (0 to %d): " COLOR_RESET, g->num_nodes - 1);
    if (scanf("%d", &source) != 1 || source < 0 || source >= g->num_nodes) {
        printf(COLOR_RED "[!] Invalid source location.\n" COLOR_RESET);
        clear_input_buffer();
        return;
    }

    printf(COLOR_CYAN "Enter destination location ID (0 to %d): " COLOR_RESET, g->num_nodes - 1);
    if (scanf("%d", &dest) != 1 || dest < 0 || dest >= g->num_nodes) {
        printf(COLOR_RED "[!] Invalid destination location.\n" COLOR_RESET);
        clear_input_buffer();
        return;
    }

    double dist[MAX_NODES];
    int parent[MAX_NODES];

    dijkstra(g, source, dist, parent);

    if (dist[dest] >= INF / 2) {
        printf(COLOR_RED "\n[!] No path exists from %d to %d (Roads might be disconnected or one-way).\n" COLOR_RESET, source, dest);
        return;
    }

    display_detailed_path(g, parent, dest, source);
}

static void update_road_conditions(Graph *g) {
    if (g->num_nodes <= 0) {
        printf(COLOR_RED "\n[!] Graph is empty. Please load or create a road network first.\n" COLOR_RESET);
        return;
    }

    printf(COLOR_CYAN "\nAvailable Locations:\n" COLOR_RESET);
    for (int i = 0; i < g->num_nodes; i++) {
        printf("  %d: %s\n", i, g->node_names[i]);
    }

    int source, dest;
    printf(COLOR_CYAN "\nEnter starting location ID for the road: " COLOR_RESET);
    if (scanf("%d", &source) != 1 || source < 0 || source >= g->num_nodes) {
        printf(COLOR_RED "[!] Invalid location.\n" COLOR_RESET);
        clear_input_buffer();
        return;
    }

    printf(COLOR_CYAN "Enter ending location ID: " COLOR_RESET);
    if (scanf("%d", &dest) != 1 || dest < 0 || dest >= g->num_nodes) {
        printf(COLOR_RED "[!] Invalid location.\n" COLOR_RESET);
        clear_input_buffer();
        return;
    }

    double traf, weath, road, temp;
    printf(COLOR_YELLOW "Enter new factors (" COLOR_BOLD "traffic weather road temp" COLOR_YELLOW "): " COLOR_RESET);
    if (scanf("%lf %lf %lf %lf", &traf, &weath, &road, &temp) != 4) {
        printf(COLOR_RED "[!] Invalid input format. Expected 4 decimal numbers.\n" COLOR_RESET);
        clear_input_buffer();
        return;
    }

    if (update_edge(g, source, dest, traf, weath, road, temp)) {
        printf(COLOR_GREEN "[+] Successfully updated road conditions between %s and %s.\n" COLOR_RESET, g->node_names[source], g->node_names[dest]);
    } else {
        printf(COLOR_RED "[!] No direct road exists between %s and %s.\n" COLOR_RESET, g->node_names[source], g->node_names[dest]);
    }
}

static void show_rating_parameters(void) {
    printf(COLOR_CYAN "\n==== Rating Parameters Guide ====\n" COLOR_RESET);
    printf("Each edge weight is: distance * traffic * weather * road * temperature\n\n");

    printf(COLOR_YELLOW "1. Traffic level:\n" COLOR_RESET);
    printf("  0.8  - Very Low (free flow)\n  1.0  - Normal\n  1.5  - Heavy traffic\n\n");

    printf(COLOR_YELLOW "2. Weather condition:\n" COLOR_RESET);
    printf("  0.9  - Clear\n  1.0  - Cloudy\n  1.4  - Storm / Very bad\n\n");

    printf(COLOR_YELLOW "3. Road condition:\n" COLOR_RESET);
    printf("  0.9  - Excellent\n  1.0  - Good\n  1.4  - Poor condition\n\n");

    printf(COLOR_YELLOW "4. Temperature effect:\n" COLOR_RESET);
    printf("  0.95 - Cool / Ideal\n  1.00 - Normal\n  1.10 - Very hot or very cold\n\n");
}

static void show_menu(void) {
    printf(COLOR_CYAN "\n============================================\n");
    printf(" 🚗 " COLOR_BOLD "SMART ROUTE OPTIMIZATION SIMULATOR" COLOR_CYAN " 🚗 \n");
    printf("============================================\n" COLOR_RESET);
    printf("  " COLOR_YELLOW "1." COLOR_RESET " Create/Update Road Network Manually\n");
    printf("  " COLOR_YELLOW "2." COLOR_RESET " Load Road Network from File (e.g. map.txt)\n");
    printf("  " COLOR_YELLOW "3." COLOR_RESET " Display Current Road Network Layout\n");
    printf("  " COLOR_YELLOW "4." COLOR_RESET " Find Shortest Path (Turn-by-Turn GPS)\n");
    printf("  " COLOR_YELLOW "5." COLOR_RESET " Update Specific Road Conditions Dynamically\n");
    printf("  " COLOR_YELLOW "6." COLOR_RESET " Show Rating Parameters/Factors Help\n");
    printf("  " COLOR_YELLOW "7." COLOR_RESET " Exit\n");
    printf(COLOR_BOLD "Enter your choice: " COLOR_RESET);
}

int main(void) {
    Graph graph;
    graph.num_nodes = 0;

    int choice;
    int running = 1;
    
    // Clear screen on startup for a fresh UI
    system("clear");

    while (running) {
        show_menu();
        if (scanf("%d", &choice) != 1) {
            printf(COLOR_RED "[!] Invalid input. Please enter a number.\n" COLOR_RESET);
            clear_input_buffer();
            continue;
        }

        switch (choice) {
        case 1:
            build_graph_from_user(&graph);
            break;
        case 2:
            load_graph_from_file(&graph);
            break;
        case 3:
            display_graph(&graph);
            break;
        case 4:
            run_shortest_path(&graph);
            break;
        case 5:
            update_road_conditions(&graph);
            break;
        case 6:
            show_rating_parameters();
            break;
        case 7:
            running = 0;
            printf(COLOR_GREEN "\nShutting down Route Simulator. Fly safe! ✈️\n" COLOR_RESET);
            break;
        default:
            printf(COLOR_RED "[!] Invalid choice. Please select 1-7.\n" COLOR_RESET);
            break;
        }
    }

    return 0;
}
