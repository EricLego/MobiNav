import networkx as nx
import matplotlib.pyplot as plt
import random

def create_6x6_grid():
    return nx.grid_2d_graph(6, 6)

def plot_grid(G, selected_nodes=None):
    pos = {node: (node[1], -node[0]) for node in G.nodes()}
    plt.figure(figsize=(8, 8))  # Increase figure size for bigger/better visibility
    nx.draw(G, pos, with_labels=True, node_color='lightblue', node_size=160, edge_color='black')
    if selected_nodes:
        nx.draw_networkx_nodes(G, pos, nodelist=selected_nodes, node_color='red', node_size=80)
    plt.show()

def remove_random_edges(G, min_edges=10, max_edges=20):
    num_edges_to_remove = random.randint(min_edges, max_edges)
    edges = list(G.edges())
    random_edges = random.sample(edges, k=num_edges_to_remove)
    G.remove_edges_from(random_edges)
    return G

def select_two_nodes(G):
#    print("Available nodes:", list(G.nodes()))
    selected_nodes = []

    for i in range(1, 3):
        node_input = input(f"Enter node {i} to select (as x,y): ")
        try:
            node = tuple(map(int, node_input.split(',')))
            if node in G.nodes():
                print(f"Node {node} selected.")
                selected_nodes.append(node)

            else:
                print("Node not in graph. Please try again.")
        except ValueError:
            print("Invalid input format. Please enter as x,y. Example: 2,3")
    return selected_nodes

def optimize_route(G, nodes):
    if len(nodes) != 2:
        raise ValueError("Please enter two nodes")
    start, end = nodes[0], nodes[1]
    distances = {node: float('infinity') for node in G.nodes()}
    previous = {node: None for node in G.nodes()}
    distances[start] = 0
    vertices = set(G.nodes())

    while vertices:
        current = min(vertices, key=lambda v: distances[v])
        vertices.remove(current)
        if distances[current] == float('infinity') or current == end:
            break
        for neighbor in G.neighbors(current):
            alt_route = distances[current] + 1
            if alt_route < distances[neighbor]:
                distances[neighbor] = alt_route
                previous[neighbor] = current

    path, current = [], end
    while current is not None:
        path.insert(0, current)
        current = previous[current]
    return path

# Main execution
G = create_6x6_grid()
G = remove_random_edges(G)
nodes = select_two_nodes(G)
#print("Nodes are {nodes[0]} and {nodes[1]} and length is {len(nodes)}")
path = optimize_route(G, nodes)
print(f"Shortest path from {nodes[0]} to {nodes[-1]}: {path}")
plot_grid(G, path)
