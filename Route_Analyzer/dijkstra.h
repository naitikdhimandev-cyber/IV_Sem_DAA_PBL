#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include "graph.h"

#define INF 1e18

/* Run Dijkstra's algorithm from source to all nodes */
void dijkstra(const Graph *g, int source, double dist[], int parent[]);

#endif /* DIJKSTRA_H */
