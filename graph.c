#include <stdio.h>
#include <stdlib.h>

#include "graph.h"

/* Initialize graph with given number of nodes */
void init_graph(Graph *g, int num_nodes) {
    int i;
    g->num_nodes = num_nodes;
    for (i = 0; i < MAX_NODES; i++) {
        g->adj_lists[i] = NULL;
        snprintf(g->node_names[i], 64, "Location_%d", i);
    }
}

/* Compute final weight for an edge based on all environmental factors */
void compute_edge_weight(Edge *e) {
    e->final_weight = e->distance *
                      e->traffic_factor *
                      e->weather_factor *
                      e->road_condition_factor *
                      e->temperature_factor;
}

/* Add a directed edge to the graph */
void add_edge(Graph *g, int from, int to, double distance,
              double traffic_factor, double weather_factor,
              double road_condition_factor, double temperature_factor) {
    if (from < 0 || from >= g->num_nodes || to < 0 || to >= g->num_nodes) {
        printf("Invalid edge: %d -> %d\n", from, to);
        return;
    }

    AdjNode *new_node = (AdjNode *)malloc(sizeof(AdjNode));
    if (!new_node) {
        printf("Memory allocation failed for edge.\n");
        return;
    }

    new_node->edge.to = to;
    new_node->edge.distance = distance;
    new_node->edge.traffic_factor = traffic_factor;
    new_node->edge.weather_factor = weather_factor;
    new_node->edge.road_condition_factor = road_condition_factor;
    new_node->edge.temperature_factor = temperature_factor;

    compute_edge_weight(&new_node->edge);

    new_node->next = g->adj_lists[from];
    g->adj_lists[from] = new_node;

    // Add reverse edge to make it a Two-Way street network (Undirected Graph)
    AdjNode *rev_node = (AdjNode *)malloc(sizeof(AdjNode));
    if (rev_node) {
        rev_node->edge.to = from;
        rev_node->edge.distance = distance;
        rev_node->edge.traffic_factor = traffic_factor;
        rev_node->edge.weather_factor = weather_factor;
        rev_node->edge.road_condition_factor = road_condition_factor;
        rev_node->edge.temperature_factor = temperature_factor;
        compute_edge_weight(&rev_node->edge);
        rev_node->next = g->adj_lists[to];
        g->adj_lists[to] = rev_node;
    }
}

/* Display the active graph connections and effective weights */
void display_graph(const Graph *g) {
    if (g->num_nodes == 0) {
        printf("\033[1;33m[!] \033[0mRoad network is empty.\n");
        return;
    }
    printf("\n\033[1;36m==== Current Road Network ====\033[0m\n");
    for (int i = 0; i < g->num_nodes; i++) {
        AdjNode *cur = g->adj_lists[i];
        if (cur != NULL) {
            printf("\033[1;32m[%s]\033[0m connects to:\n", g->node_names[i]);
            while (cur != NULL) {
                Edge e = cur->edge;
                printf("  -> \033[1;32m[%s]\033[0m | Distance: \033[1;35m%.1fkm\033[0m | Factors [T:%.1f W:%.1f R:%.1f t:%.1f] => \033[1;31mEFFECTIVE COST: %.2f\033[0m\n", 
                       g->node_names[e.to], e.distance, e.traffic_factor, e.weather_factor, 
                       e.road_condition_factor, e.temperature_factor, e.final_weight);
                cur = cur->next;
            }
        }
    }
    printf("\n");
}

/* Update an existing edge's factors dynamically (both directions) */
int update_edge(Graph *g, int from, int to, double traffic, double weather, double road, double temp) {
    if (from < 0 || from >= g->num_nodes || to < 0 || to >= g->num_nodes) return 0;
    
    int edge_found = 0;
    
    // Update forward edge
    AdjNode *cur = g->adj_lists[from];
    while (cur != NULL) {
        if (cur->edge.to == to) {
            cur->edge.traffic_factor = traffic;
            cur->edge.weather_factor = weather;
            cur->edge.road_condition_factor = road;
            cur->edge.temperature_factor = temp;
            compute_edge_weight(&cur->edge);
            edge_found = 1;
            break;
        }
        cur = cur->next;
    }
    
    // Update reverse edge
    cur = g->adj_lists[to];
    while (cur != NULL) {
        if (cur->edge.to == from) {
            cur->edge.traffic_factor = traffic;
            cur->edge.weather_factor = weather;
            cur->edge.road_condition_factor = road;
            cur->edge.temperature_factor = temp;
            compute_edge_weight(&cur->edge);
            break;
        }
        cur = cur->next;
    }
    
    return edge_found;
}
