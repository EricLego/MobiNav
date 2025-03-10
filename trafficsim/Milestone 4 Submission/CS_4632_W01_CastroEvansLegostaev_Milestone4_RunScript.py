import traci
import sumolib
import random

traci.start(["sumo-gui", "-c", "CS_4632_W01_CastroEvansLegostaev_Milestone4_RunScriptKSUMariettaConfig.sumocfg"])
net = sumolib.net.readNet("CS_4632_W01_CastroEvansLegostaev_Milestone4_RunScriptKSUMarietta.net.xml.gz")

# Find the nearest edge from coordinates
cur_lat, cur_lon = 33.939520, -84.518931 # Replace withG PS coordinates pulled from database (building location or parking lot)
dest_lat, dest_lon = 33.9365841870687, -84.52225348427882  # Replace with GPS coordinates pulled from database (building location or parking lot)
cur_edge, cur_edge_position, cur_lane_index = traci.simulation.convertRoad(cur_lon, cur_lat, isGeo=1) # convert GPS coordinate to Open Maps edge network location
dest_edge, dest_edge_position, dest_lane_index = traci.simulation.convertRoad(dest_lon, dest_lat, isGeo=1) # convert GPS coordinate to Open Maps edge network location
# print(f"cur_edge: {cur_edge} and dest_edge: {dest_edge}") #use this to check if correct GPS coordinates are pulled from database when connection is made

# Spawn number of pedestrians dynamically
building_occupancy = 100 # Replace with estimated building occupancy from database
for i in range(building_occupancy):
    start_edge = cur_edge #specifies starting edge
    end_edge = dest_edge #specifed ending edge
    ped_id = f"ped_{i+1}" # Unique pedestrian ID
    route = traci.simulation.findRoute(start_edge, end_edge, vType="ped_pedestrian", depart=0, routingMode=1) # force SUMO to find a route
    route_edges = [edge for edge in route.edges if not edge.startswith(":")] # remove internal edges of duplicated junctions that will error the route

 # Add pedestrian to SUMO
    traci.person.add(personID=ped_id, edgeID=start_edge, pos=cur_edge_position, typeID="ped_pedestrian", depart=random.randint(5,900)) # add the pedestrian to the model

# Assign random walk path for random duration
    traci.person.appendWalkingStage(personID=ped_id, edges=route_edges, arrivalPos=dest_edge_position, duration=300) # assign the route to the current pedestrian

# Run the simulation for the following number of steps
for step in range(1000):
    traci.simulationStep()
    print(f"Simulation step {traci.simulation.getTime()}")

traci.close()
print("Simulation done.")