# File: simulation.py
import traci
import config
import csv
import math
from datetime import datetime, timedelta

def start_simulation():
    # Start SUMO simulation; to run with gui change "sumo" to "sumo-gui'
    traci.start(["sumo", "-c", config.SUMO_CONFIG_FILE])

def close_simulation():
    # Close the SUMO simulation.
    traci.close()
    print("Simulation done.")

def run_simulation(steps=config.SIMULATION_STEPS):

    # Dictionary to store per-pedestrian statistics (prevents excessive TraCI API calls)
    pedestrian_data = {}

    # Cache lane lengths once
    lane_lengths = {lane: traci.lane.getLength(lane) for lane in traci.lane.getIDList()}

    # Get the start of the current hour
    start_time = datetime.now().replace(minute=0, second=0, microsecond=0)

    # Open CSV for logging statistics
    with open("simulation_stats.csv", "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            "Time", "Total Pedestrians", "Mean Speed", "Waiting Pedestrians",
            "Average Route Time", "Throughput", "Max Pedestrian Density",
            "Max Density Lane", "Max Waiting Time", "Total Distance Traveled",
            "Average Distance", "Deviation from Shortest Route"
        ])

        step = 0
        total_route_times = []
        total_traveled_distances = []

        while traci.simulation.getMinExpectedNumber() > 0:  # runs the simulation while pedestrians are in the network
            if step % 30 != 0: # every 30 seconds the rest of the script outside of this if statement is run to capture statistics of the model.
                step += 1
                traci.simulationStep()
                continue
            traci.simulationStep()

            # Compute actual time corresponding to the current step
            current_time = (start_time + timedelta(seconds=step)).strftime("%H:%M:%S")

            # Fetch all pedestrian data
            pedestrian_ids = traci.person.getIDList()
            num_pedestrians = len(pedestrian_ids)

            # Store lane locations
            pedestrian_lane_count = {}
            pedestrian_positions = {p: traci.person.getLaneID(p) for p in pedestrian_ids}

            for lane_id in pedestrian_positions.values():
                pedestrian_lane_count[lane_id] = pedestrian_lane_count.get(lane_id, 0) + 1

            # Compute mean speed
            mean_speed = sum(traci.person.getSpeed(p) for p in pedestrian_ids) / num_pedestrians if num_pedestrians else 0

            # Count waiting pedestrians and max wait time
            waiting_times = [traci.person.getWaitingTime(p) for p in pedestrian_ids]
            waiting_pedestrians = sum(1 for t in waiting_times if t > 0)
            max_wait_time = max(waiting_times, default=0)

            # Track pedestrian movement and distance traveled
            for p in pedestrian_ids:
                prev_data = pedestrian_data.setdefault(p, {
                    "departure_time": step,
                    "initial_position": traci.person.getPosition(p),
                    "distance_traveled": 0,
                    "shortest_distance": 0
                })
                current_pos = traci.person.getPosition(p)

                # Calculate distance traveled
                prev_data["distance_traveled"] += math.dist(prev_data["initial_position"], current_pos)
                prev_data["initial_position"] = current_pos

                # If this is a new pedestrian, calculate shortest path
                if prev_data["shortest_distance"] == 0:
                    start_edge = traci.person.getRoadID(p)
                    route = traci.simulation.findRoute(start_edge, start_edge, vType="ped_pedestrian")
                    prev_data["shortest_distance"] = sum(
                        traci.lane.getLength(edge + "_0") for edge in route.edges
                        if (edge + "_0") in traci.lane.getIDList()
                    )

            # Identify finished pedestrians
            finished_pedestrians = set(pedestrian_data.keys()) - set(pedestrian_ids)
            total_route_times.extend(step - pedestrian_data[p]["departure_time"] for p in finished_pedestrians)
            total_traveled_distances.extend(pedestrian_data[p]["distance_traveled"] for p in finished_pedestrians)

            # Remove finished pedestrians from memory
            for p in finished_pedestrians:
                del pedestrian_data[p]

            # Compute max density
            max_density_lane, max_density = max(
                ((lane, count / lane_lengths.get(lane, 1)) for lane, count in pedestrian_lane_count.items()),
                key=lambda x: x[1],
                default=(None, 0)
            )

            # Get latitude and longitude of the edge with max density in GPS coordinates
            max_density_lat, max_density_lon = (0, 0)
            if max_density_lane:
                edge_shape = traci.lane.getShape(max_density_lane)
                if edge_shape:
                    x, y = edge_shape[0]  # Use the first coordinate of the edge
                    max_density_lon, max_density_lat = traci.simulation.convertGeo(x, y, fromGeo=False)  # Convert to GPS coordinates

            # Calculate deviation from shortest route
            deviation_ratios = [
                pedestrian_data[p]["distance_traveled"] / pedestrian_data[p]["shortest_distance"]
                for p in pedestrian_data if pedestrian_data[p]["shortest_distance"] > 0
            ]
            avg_deviation = sum(deviation_ratios) / len(deviation_ratios) if deviation_ratios else 1.0

            # Write statistics to file
            writer.writerow([
                step, num_pedestrians, mean_speed, waiting_pedestrians,
                sum(total_route_times) / len(total_route_times) if total_route_times else 0,
                len(finished_pedestrians), max_density, max_density_lane, max_density_lat, max_density_lon,
                max_wait_time, sum(total_traveled_distances),
                sum(total_traveled_distances) / len(total_traveled_distances) if total_traveled_distances else 0,
                avg_deviation
            ])

            step += 1
            print(f"Simulation step {step} - Time: {current_time}")
