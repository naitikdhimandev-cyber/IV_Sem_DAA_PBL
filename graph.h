#ifndef GRAPH_H
#define GRAPH_H

#define MAX_NODES 100

typedef struct {
    int to;                   
    double distance;          
    double traffic_factor;
    double weather_factor;
    double road_condition_factor;
    double temperature_factor;
    double final_weight;      
} Edge;

typedef struct AdjNode {
    Edge edge;
    struct AdjNode *next;
} AdjNode;

typedef struct {
    int num_nodes;
    AdjNode *adj_lists[MAX_NODES];
    char node_names[MAX_NODES][64];
} Graph;


void init_graph(Graph *g, int num_nodes);
void add_edge(Graph *g, int from, int to, double distance,
              double traffic_factor, double weather_factor,
              double road_condition_factor, double temperature_factor);

void compute_edge_weight(Edge *e);

void display_graph(const Graph *g);

int update_edge(Graph *g, int from, int to, double traffic_factor, double weather_factor, double road_condition_factor, double temperature_factor);

#endif
