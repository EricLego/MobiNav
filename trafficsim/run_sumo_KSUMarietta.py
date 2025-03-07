import traci
import sumolib
import random

traci.start(["sumo-gui", "-c", "KSUMariettaConfig.sumocfg"])
net = sumolib.net.readNet("KSUMarietta.net.xml.gz")

# Find the nearest edge from coordinates
cur_lat, cur_lon = 33.939520, -84.518931
# Replace with current GPS coordinates
dest_lat, dest_lon = 33.9365841870687, -84.52225348427882  # Replace with GPS coordinates pulled from database
cur_edge, cur_edge_position, cur_lane_index = traci.simulation.convertRoad(cur_lon, cur_lat, isGeo=1)
dest_edge, dest_edge_position, dest_lane_index = traci.simulation.convertRoad(dest_lon, dest_lat, isGeo=1)
print(f"cur_edge: {cur_edge} and dest_edge: {dest_edge}")

# Spawn number of pedestrians dynamically
for i in range(100):
    start_edge = cur_edge #specifies starting edge
    end_edge = dest_edge #random.choice(pedestrian_edges)
    ped_id = f"ped_{i+1}" # Unique pedestrian ID
    route = traci.simulation.findRoute(start_edge, end_edge, vType="ped_pedestrian", depart=0, routingMode=1)
    route_edges = [edge for edge in route.edges if not edge.startswith(":")]

 # Add pedestrian to SUMO
    traci.person.add(personID=ped_id, edgeID=start_edge, pos=cur_edge_position, typeID="ped_pedestrian", depart=random.randint(5,900))

# Assign random walk path for random duration
    traci.person.appendWalkingStage(personID=ped_id, edges=route_edges, arrivalPos=dest_edge_position, duration=300)

# Run the simulation for the following number of steps
for step in range(1000):
    traci.simulationStep()
    print(f"Simulation step {traci.simulation.getTime()}")

traci.close()
print("Simulation done.")