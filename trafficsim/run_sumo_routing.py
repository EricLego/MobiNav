import traci
import random

traci.start(["sumo-gui", "-c", "osm.sumocfg"])

all_edges = traci.edge.getIDList()
pedestrian_edges = []

# Find allowed vehicle classes for each edge
for edge in all_edges:
    lane_count = traci.edge.getLaneNumber(edge) #geta number of lanes in each edge
    for i in range(lane_count):
        lane_id = f"{edge}_{i}" #generates lane id
        # Find edges that allow pedestrians
        try:
            allowed_vehicles = traci.lane.getAllowed(lane_id) #gets the allowed vehicle types for the edge (i.e., car, truck, pedestrian, etc.)
            if "pedestrian" in allowed_vehicles: #if teh lane allows pedestrian, add the edge to pedestrian_edges and exit inner for loop
                pedestrian_edges.append(edge)
                break
        except traci.TraCIException as e:
            print(f"Error retrieving data for lane {lane_id}: {e}")

# Spawn number of pedestrians dynamically
for i in range(100):
    start_edge = "225485336#4" #specifies starting edge
    end_edge = "1134398603"
    ped_id = f"ped_{i+1}" # Unique pedestrian ID


    route = traci.simulation.findRoute(start_edge, end_edge, vType="ped_pedestrian", depart=0, routingMode=1)
    route_edges = [route.edges]
    route_edges = [edge for edge in route.edges if not edge.startswith(":")]

 # Add pedestrian to SUMO
    traci.person.add(personID=ped_id, edgeID=start_edge, pos=0, typeID="ped_pedestrian", depart=traci.simulation.getTime())

# Assign random walk path for random duration
    traci.person.appendWalkingStage(personID=ped_id, edges=route_edges, arrivalPos=-1, duration=300)

print(f"{ped_id} has end edge of: {end_edge} with a route of: {route_edges}")


# Run the simulation for the following number of steps
for step in range(1000):
    traci.simulationStep()
    print(f"Simulation step {traci.simulation.getTime()}")
    #print(f"ped_1 is located at: {traci.person.getPosition("ped_1")}")

traci.close()
print("Simulation done.")