import traci

# Start SUMO-GUI with TraCI
sumoCmd = ["sumo", "-c", "osm.sumocfg"]
traci.start(sumoCmd)

# Get all pedestrian-walkable edges
pedestrian_edges = []
for edge in traci.edge.getIDList():
    if "pedestrian" in traci.lane.getAllowed(f"{edge}_0"):
        pedestrian_edges.append(edge)

# Print pedestrian edges
print(f"SUMO recognizes these {len(pedestrian_edges)} pedestrian-allowed edges:", pedestrian_edges)

# Check lane directions
for edge in pedestrian_edges:
    lane_count = traci.edge.getLaneNumber(edge)
    print(f"Edge {edge} has {lane_count} lanes")
    for lane in range(lane_count):
        lane_id = f"{edge}_{lane}"
        print(f"  - Lane {lane_id} allows: {traci.lane.getAllowed(lane_id)}")

traci.close()
