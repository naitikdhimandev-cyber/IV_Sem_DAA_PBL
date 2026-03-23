#ifndef GRAPH_H
#define GRAPH_H

#define MAX_NODES 100

/* Edge structure representing a road between two locations */
typedef struct {
    int to;                    /* destination node index */
    double distance;           /* base distance */
    double traffic_factor;
    double weather_factor;
    double road_condition_factor;
    double temperature_factor;
    double final_weight;       /* computed weight */
} Edge;

/* Adjacency list node */
typedef struct AdjNode {
    Edge edge;
    struct AdjNode *next;
} AdjNode;

/* Graph structure using adjacency lists */
typedef struct {
    int num_nodes;
    AdjNode *adj_lists[MAX_NODES];
    char node_names[MAX_NODES][64];
} Graph;

/* Graph-related functions */
void init_graph(Graph *g, int num_nodes);
void add_edge(Graph *g, int from, int to, double distance,
              double traffic_factor, double weather_factor,
              double road_condition_factor, double temperature_factor);

/* Weight calculation helper */
void compute_edge_weight(Edge *e);

/* Display live graph showing all factors */
void display_graph(const Graph *g);

/* Update an existing edge's factors dynamically */
int update_edge(Graph *g, int from, int to, double traffic_factor, double weather_factor, double road_condition_factor, double temperature_factor);

#endif /* GRAPH_H */
