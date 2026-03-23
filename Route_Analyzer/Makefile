CC = gcc
CFLAGS = -Wall -Wextra -std=c11

OBJS = main.o graph.o dijkstra.o

all: route_simulator

route_simulator: $(OBJS)
	$(CC) $(CFLAGS) -o route_simulator $(OBJS)

main.o: main.c graph.h dijkstra.h

graph.o: graph.c graph.h

dijkstra.o: dijkstra.c dijkstra.h graph.h

clean:
	rm -f $(OBJS) route_simulator
