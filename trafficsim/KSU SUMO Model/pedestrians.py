# File: pedestrians.py
import traci
import random
import routing
import get_buildings_list
import get_coordinates_occupancy

def spawn_pedestrians():
    """Spawn pedestrians efficiently using batch processing."""

    # Retrieve building data and occupancy data from database
    building_data = get_buildings_list.connect_and_fetch() or []
    spawning_data = get_coordinates_occupancy.connect_and_fetch() or []

    if not building_data or not spawning_data:
        print("Warning: No data retrieved from the database.")
        return

    pedestrians_count = 0
    building_edge_map = {(b[7], b[8]): routing.get_edge_from_gps(b[7], b[8])[:2] for b in building_data}
    building_locations = list(building_edge_map.keys())

    # Use a list to store a batch of pedestrians for TraCI commands
    batch_pedestrians = []

    for row in spawning_data:
        start_lat, start_lon = row[2], row[3]
        occupancy = row[6]

        if occupancy <= 0:
            continue

        start_edge, start_edge_position, lane_index = routing.get_edge_from_gps(start_lat, start_lon)

        for _ in range(occupancy): #iterate the creation of a pedestrian the number of times equal to occupancy received from database.
            end_lat, end_lon = random.choice(building_locations) # chooses a random building on campus to route pedestrian to.
            end_edge, end_edge_position = building_edge_map[(end_lat, end_lon)]

            ped_id = f"ped_{pedestrians_count + 1}"
            route_edges = routing.find_route(start_edge, end_edge)
            speed = random.uniform(0.7, 2.0) # assigns rqandom speed to pedestrian in the range of average human walking speeds.

            # Store commands instead of executing immediately
            batch_pedestrians.append((ped_id, start_edge, start_edge_position, end_edge, end_edge_position, route_edges, speed))
            pedestrians_count += 1

    # Process batch TraCI commands
    for ped_id, start_edge, start_edge_position, end_edge, end_edge_position, route_edges, speed in batch_pedestrians:
        try:
            traci.person.add(personID=ped_id, edgeID=start_edge, pos=start_edge_position, typeID="ped_pedestrian", depart=random.randint(10, 600))
            traci.person.appendWalkingStage(personID=ped_id, edges=route_edges, arrivalPos=end_edge_position)
            traci.person.setSpeed(ped_id, speed)
            #print (f"Added pedestrian {ped_id} with speed {speed}")
        except traci.TraCIException as e:
            print(f"Skipping {ped_id} due to error: {e}")