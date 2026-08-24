CC = gcc
CFLAGS = -Wall -Wextra -std=c11

OBJS = main.o graph.o bellman_ford.o

all: route_simulator

route_simulator: $(OBJS)
	$(CC) $(CFLAGS) -o route_simulator $(OBJS)

main.o: main.c graph.h bellman_ford.h

graph.o: graph.c graph.h

bellman_ford.o: bellman_ford.c bellman_ford.h graph.h

clean:
	rm -f $(OBJS) route_simulator
