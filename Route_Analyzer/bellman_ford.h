#ifndef BELLMAN_FORD_H
#define BELLMAN_FORD_H

#include "graph.h"

#define INF 1e18

int bellman_ford(const Graph *g, int source, double dist[], int parent[]);

#endif 
