#include <stdio.h>
#include <float.h>

#include "dijkstra.h"

/* Simple array-based implementation of Dijkstra's algorithm */
void dijkstra(const Graph *g, int source, double dist[], int parent[]) {
    int n = g->num_nodes;
    int visited[MAX_NODES];
    int i, j;

    for (i = 0; i < n; i++) {
        dist[i] = INF;
        parent[i] = -1;
        visited[i] = 0;
    }

    dist[source] = 0.0;

    for (i = 0; i < n - 1; i++) {
        double min_dist = INF;
        int u = -1;

        for (j = 0; j < n; j++) {
            if (!visited[j] && dist[j] < min_dist) {
                min_dist = dist[j];
                u = j;
            }
        }

        if (u == -1) {
            break;
        }

        visited[u] = 1;

        AdjNode *cur = g->adj_lists[u];
        while (cur != NULL) {
            int v = cur->edge.to;
            double weight = cur->edge.final_weight;

            if (!visited[v] && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                parent[v] = u;
            }

            cur = cur->next;
        }
    }
}
