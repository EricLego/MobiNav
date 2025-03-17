# File: pedestrians.py
import traci
import random
import routing
import get_buildings_list
import get_coordinates_occupancy

def spawn_pedestrians():
    """Spawn pedestrians dynamically based on building occupancy."""
    net = routing.get_network()

    building_data = get_buildings_list.connect_and_fetch() #gets list of available buildings
    spawning_data = get_coordinates_occupancy.connect_and_fetch()  # gets starting coordinates and occupancy data from database
    building_count = 0 # Used to keep track of cycling through building_data list.
    pedestrians_count = 0 # keep track of pedestrians to ensure no duplicates during a simulation run

    """Spawn pedestrians at the identified building/location. Number of pedestrians created is the occupancy_value for the building"""
    for row in spawning_data:
        start_lat, start_lon = spawning_data[building_count][2], spawning_data[building_count][3] #get GPS coordinates for starting location
        start_edge, start_edge_position, _ = routing.get_edge_from_gps(start_lat, start_lon) #convert GPS coordinates to edge and edge position

        for i in range(spawning_data[building_count][6]): # gets building occupancy information
            building_number = random.randint(0, len(building_data)-1) # placeholder. current sends pedestrians created to random building in database
            end_lat, end_lon = building_data[building_number][7], building_data[building_number][8]
            end_edge, end_edge_position, _ = routing.get_edge_from_gps(end_lat, end_lon)

            ped_id = f"ped_{pedestrians_count + 1}"
            route_edges = routing.find_route(start_edge, end_edge)
            speed = random.uniform(0.7, 1.2)

            try:
            # Add pedestrian to SUMO
                traci.person.add(
                    personID=ped_id,
                    edgeID=start_edge,
                    pos=start_edge_position,
                    typeID="ped_pedestrian",
                    depart=random.randint(10, 900)
                )

                # Assign walking route
                traci.person.appendWalkingStage(
                    personID=ped_id,
                    edges=route_edges,
                    arrivalPos=end_edge_position,
                )
                traci.person.setSpeed(ped_id, speed)
                pedestrians_count += 1
            except traci.TraCIException as e:
                #print (f"Skipping {ped_id} due to error: {e}")
                pedestrians_count += 1
                continue

        building_count += 1
