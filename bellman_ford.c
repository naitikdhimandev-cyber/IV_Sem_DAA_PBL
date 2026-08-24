#include "bellman_ford.h"
#include <stdio.h>
#include <stdlib.h>

int bellman_ford(const Graph *g, int source, double dist[], int parent[]) {
  int v, i;
  int num_v = g->num_nodes;

  // 1. Initialize
  for (i = 0; i < num_v; i++) {
    dist[i] = INF;
    parent[i] = -1;
  }
  dist[source] = 0;

  // 2. Relax edges |V| - 1 times
  for (i = 1; i <= num_v - 1; i++) {
    int changed = 0;
    for (v = 0; v < num_v; v++) {
      if (dist[v] == INF)     
        continue;

      AdjNode *cur = g->adj_lists[v];
      while (cur != NULL) {
        int u = cur->edge.to;
        double weight = cur->edge.final_weight;

        if (dist[v] + weight < dist[u]) {
          dist[u] = dist[v] + weight;
          parent[u] = v;
          changed = 1;
        }
        cur = cur->next;
      }
    }
    if (!changed)
      break; // Optimization
  }

  // 3. Check for negative cycles
  for (v = 0; v < num_v; v++) {
    if (dist[v] == INF)
      continue;

    AdjNode *cur = g->adj_lists[v];
    while (cur != NULL) {
      int u = cur->edge.to;
      double weight = cur->edge.final_weight;

      if (dist[v] + weight <
          dist[u] - 1e-9) { // Using epsilon for double precision
        return 0;           // Negative cycle detected
      }
      cur = cur->next;
    }
  }

  return 1;
}
