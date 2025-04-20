# File: pedestrians.py
"""This module spawns pedestrians, updates pedestrian routes due to congestion, and resets pedestrian data for automated back-to-back runs"""

import random
from datetime import timedelta, datetime

import traci

import config
import get_buildings_list
import get_coordinates_occupancy
import routing

# Retrieve all building and occupancy data for the entire day and declare pedestrians already spawned data block
building_data = get_buildings_list.connect_and_fetch() or []
occupancy_data = get_coordinates_occupancy.connect_and_fetch() or []
pedestrians_spawned = set()


def spawn_pedestrians(step):
    building_edge_map = {
        (b[7], b[8]): routing.get_edge_from_gps(b[7], b[8])[:2] for b in building_data
    }  # acquires building edges from gps data acquired from database
    building_locations = list(
        building_edge_map.keys()
    )  # identifies building edge information

    current_time = (datetime.min + timedelta(seconds=step)).time()

    new_pedestrians = [
        row
        for row in occupancy_data
        if row[5] == current_time and (row[0], row[5]) not in pedestrians_spawned
    ]  # adds pedestrian to spawn in next batch

    if (
        not new_pedestrians
    ):  # if there are no pedestrians to spawn in this batch return to push simulation forward
        return

    for row in new_pedestrians:  # creates batching data for pedestrian spawning
        batch_pedestrians = []
        start_lat, start_lon = row[2], row[3]
        occupancy = row[6]

        if occupancy <= 0:
            continue

        start_edge, start_edge_position, _ = routing.get_edge_from_gps(
            start_lat, start_lon
        )

        for _ in range(occupancy):
            end_lat, end_lon = random.choice(building_locations)
            end_edge, end_edge_position = building_edge_map[(end_lat, end_lon)]

            ped_id = f"ped_{step}_{random.randint(1, 1000000)}"
            route_edges = routing.find_route(start_edge, end_edge)
            speed = random.uniform(0.7, 2.0)

            batch_pedestrians.append(
                (
                    ped_id,
                    start_edge,
                    start_edge_position,
                    end_edge,
                    end_edge_position,
                    route_edges,
                    speed,
                )
            )

        pedestrians_spawned.add((row[0], row[5]))  # Mark these pedestrians as added

        # Add pedestrians to SUMO
        for (
            ped_id,
            start_edge,
            start_edge_position,
            end_edge,
            end_edge_position,
            route_edges,
            speed,
        ) in batch_pedestrians:
            try:
                traci.person.add(
                    personID=ped_id,
                    edgeID=start_edge,
                    pos=start_edge_position,
                    typeID="ped_pedestrian",
                    depart=step,
                )
                traci.person.appendWalkingStage(
                    personID=ped_id, edges=route_edges, arrivalPos=end_edge_position
                )
                traci.person.setSpeed(ped_id, speed)
            except traci.TraCIException as e:
                print(f"⚠️ Skipping {ped_id} due to error: {e}")

        print(f"✅ {len(batch_pedestrians)} pedestrians added at {current_time}.")


def update_pedestrian_routes():
    """Re-route pedestrians in congested areas."""
    pedestrian_ids = traci.person.getIDList()

    for p in pedestrian_ids:
        current_lane = traci.person.getLaneID(p)

        if current_lane in config.congested_lanes:  # Access congestion info
            print(f"⚠️ Re-routing pedestrian {p} due to congestion on {current_lane}.")

            current_edges = traci.person.getEdges(p)  # ✅ Get list of edges
            if not current_edges:
                print(f"⚠️ Pedestrian {p} has no active route. Skipping rerouting.")
                continue

            current_edge = current_edges[-1]  # ✅ Get pedestrian's current edge

            # ✅ Correct way to get stage edges
            stage = traci.person.getStage(p)
            if hasattr(stage, "edges") and stage.edges:
                destination = stage.edges[-1]  # ✅ Fix: Use `.edges`
            else:
                print(f"⚠️ Pedestrian {p} has no destination. Skipping rerouting.")
                continue

            new_route = routing.find_route(current_edge, destination)
            if new_route:
                traci.person.appendWalkingStage(
                    personID=p, edges=new_route, arrivalPos=0
                )
                print(f"✅ Re-routed pedestrian {p} to new path: {new_route}")


def reset_pedestrian_state():
    """✅ Reset pedestrian tracking between simulation runs."""
    pedestrians_spawned.clear()  # ✅ Clears previously spawned pedestrians
    print("✅ Pedestrian state reset for new simulation run.")
