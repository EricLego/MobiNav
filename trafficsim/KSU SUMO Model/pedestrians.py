import traci
import random
import routing
import get_buildings_list
import get_coordinates_occupancy
from datetime import timedelta, datetime

# Retrieve all building and occupancy data for the entire day
building_data = get_buildings_list.connect_and_fetch() or []
occupancy_data = get_coordinates_occupancy.connect_and_fetch() or []

pedestrians_spawned = set()

def spawn_pedestrians(step):

    global pedestrians_spawned # Tracks already spawned pedestrians

    building_edge_map = {(b[7], b[8]): routing.get_edge_from_gps(b[7], b[8])[:2] for b in building_data}
    building_locations = list(building_edge_map.keys())

    current_time = (datetime.min + timedelta(seconds=step)).time()

    new_pedestrians = [row for row in occupancy_data if row[4] == current_time and (row[0], row[4]) not in pedestrians_spawned]

    if not new_pedestrians:
        return



    for row in new_pedestrians:
        batch_pedestrians = []
        start_lat, start_lon = row[2], row[3]
        occupancy = row[6]

        if occupancy <= 0:
            continue

        start_edge, start_edge_position, _ = routing.get_edge_from_gps(start_lat, start_lon)

        for _ in range(occupancy):
            end_lat, end_lon = random.choice(building_locations)
            end_edge, end_edge_position = building_edge_map[(end_lat, end_lon)]

            ped_id = f"ped_{step}_{random.randint(1, 1000000)}"
            route_edges = routing.find_route(start_edge, end_edge)
            speed = random.uniform(0.7, 2.0)

            batch_pedestrians.append((ped_id, start_edge, start_edge_position, end_edge, end_edge_position, route_edges, speed))

        pedestrians_spawned.add((row[0], row[4])) # Mark these pedestrians as added

        # Add pedestrians to SUMO
        for ped_id, start_edge, start_edge_position, end_edge, end_edge_position, route_edges, speed in batch_pedestrians:
            try:
                traci.person.add(personID=ped_id, edgeID=start_edge, pos=start_edge_position,
                                 typeID="ped_pedestrian", depart=step)
                traci.person.appendWalkingStage(personID=ped_id, edges=route_edges, arrivalPos=end_edge_position)
                traci.person.setSpeed(ped_id, speed)
            except traci.TraCIException as e:
                print(f"⚠️ Skipping {ped_id} due to error: {e}")

        print(f"✅ {len(batch_pedestrians)} pedestrians added at {current_time}.")

