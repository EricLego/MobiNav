import traci
import config
import csv
import math
import pedestrians
from datetime import datetime, timedelta

def start_simulation():
    """Start the SUMO simulation."""
    traci.start(["sumo-gui", "-c", config.SUMO_CONFIG_FILE])

def close_simulation():
    """Close the SUMO simulation."""
    traci.close()
    print("Simulation done.")

def run_simulation():
    """Run a full 24-hour SUMO simulation while logging pedestrian statistics."""

    pedestrian_data = {}
    lane_lengths = {lane: traci.lane.getLength(lane) for lane in traci.lane.getIDList()}
    start_time = datetime.combine(datetime.today(), datetime.min.time())  # Midnight

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

        while step < 86400:  # Run for 24 hours (1 step = 1 second)
            pedestrians.spawn_pedestrians(step)  # Add pedestrians at correct step

            traci.simulationStep()  # Move simulation forward

            if step % 60 != 0:
                step += 1
                continue

            # Convert step count to a human-readable time
            current_time = (start_time + timedelta(seconds=step)).strftime("%H:%M:%S")
            pedestrian_ids = traci.person.getIDList()
            num_pedestrians = len(pedestrian_ids)

            # Track waiting times and speeds
            speeds = [traci.person.getSpeed(p) for p in pedestrian_ids]
            waiting_times = [traci.person.getWaitingTime(p) for p in pedestrian_ids]

            mean_speed = sum(speeds) / num_pedestrians if num_pedestrians > 0 else 0
            waiting_pedestrians = sum(1 for t in waiting_times if t > 0)
            max_wait_time = max(waiting_times, default=0)

            # Compute pedestrian density on lanes
            pedestrian_lane_count = {}
            for p in pedestrian_ids:
                lane_id = traci.person.getLaneID(p)
                if lane_id:
                    pedestrian_lane_count[lane_id] = pedestrian_lane_count.get(lane_id, 0) + 1

            max_density_lane, max_density = max(
                ((lane, count / lane_lengths.get(lane, 1)) for lane, count in pedestrian_lane_count.items()),
                key=lambda x: x[1], default=(None, 0)
            )

            # Compute distance traveled for each pedestrian
            for p in pedestrian_ids:
                current_pos = traci.person.getPosition(p)
                if p in pedestrian_data:
                    prev_data = pedestrian_data[p]
                    distance_traveled = math.dist(prev_data["initial_position"], current_pos)
                    prev_data["distance_traveled"] += distance_traveled
                    prev_data["initial_position"] = current_pos
                else:
                    pedestrian_data[p] = {
                        "departure_time": step,
                        "initial_position": current_pos,
                        "distance_traveled": 0,
                        "shortest_distance": 0
                    }

            # Identify finished pedestrians and record route times
            finished_pedestrians = set(pedestrian_data.keys()) - set(pedestrian_ids)
            for p in finished_pedestrians:
                total_route_times.append(step - pedestrian_data[p]["departure_time"])
                total_traveled_distances.append(pedestrian_data[p]["distance_traveled"])
                del pedestrian_data[p]

            avg_route_time = sum(total_route_times) / len(total_route_times) if total_route_times else 0
            avg_traveled_distance = sum(total_traveled_distances) / len(total_traveled_distances) if total_traveled_distances else 0

            # Compute deviation from shortest route
            deviation_ratios = [
                pedestrian_data[p]["distance_traveled"] / pedestrian_data[p]["shortest_distance"]
                for p in pedestrian_data if pedestrian_data[p]["shortest_distance"] > 0
            ]
            avg_deviation = sum(deviation_ratios) / len(deviation_ratios) if deviation_ratios else 1.0

            # Log statistics every 60 steps (1 minute)
            if step % 60 == 0:
                writer.writerow([
                    current_time, num_pedestrians, mean_speed, waiting_pedestrians,
                    avg_route_time, len(finished_pedestrians), max_density,
                    max_density_lane, max_wait_time, sum(total_traveled_distances),
                    avg_traveled_distance, avg_deviation
                ])
                print(f"📝 Logged statistics for {current_time}")

            step += 1  # Move to next second

    print("✅ Simulation completed. Statistics saved to simulation_stats.csv.")
