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


# Spawn 500 pedestrians dynamically
for i in range(500):
    start_edge = "-1085025207" #specifies starting edge
    ped_id = f"ped_{i+1}" # Unique pedestrian ID

    # Spawn pedestrian at location 0 of edge
    spawn_position = 0

 # Add pedestrian to SUMO
    traci.person.add(personID=ped_id, edgeID=start_edge, pos=spawn_position, typeID="DEFAULT_PEDTYPE")

# Assign random walk path for random duration
    walk_edges = random.sample(pedestrian_edges, min(5, len(pedestrian_edges))) # select up to random edges to walk (from edges that allow pedestrians)
    #end_edge = random.choice([e for e in pedestrian_edges if e != start_edge])
    traci.person.appendWalkingStage(personID=ped_id, edges=walk_edges, arrivalPos=0.0, duration=random.randint(30, 300))
    #traci.person.appendWalkingStage(personID=ped_id, edges=end_edge, arrivalPos=0.0, duration=random.randint(30, 300))
    print(f"Pedestrian {ped_id} starts at {start_edge}, pos {spawn_position}, walking to {walk_edges}")
    #print(f"Pedestrian {ped_id} starts at {start_edge}, pos {spawn_position}, walking to {end_edge}")

# Run the simulation for the following number of steps
for step in range(5000):
    traci.simulationStep()
    print(f"Simulation step {traci.simulation.getTime()}")

traci.close()
print("Simulation done.")