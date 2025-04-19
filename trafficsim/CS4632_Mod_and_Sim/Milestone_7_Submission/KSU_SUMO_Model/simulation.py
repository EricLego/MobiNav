# File: simulation.py
"""This module starts, runs, and stops the simulation. It also collects pedestrian statistics while running"""

import csv
import math
from datetime import datetime, timedelta

import traci

import config
import pedestrians


def start_simulation():
    """Start the SUMO simulation."""
    traci.start(["sumo", "-c", config.SUMO_CONFIG_FILE])


def close_simulation():
    """Stops the SUMO simulation."""
    pedestrians.reset_pedestrian_state()  # resets pedestrian state for subsequent runs
    traci.close()  # Closes traci connection to SUMO
    print("Simulation done.")


def run_simulation(run_number, stats_type):
    """Runs full 24-hour SUMO simulation while logging pedestrian statistics."""
    pedestrian_data = (
        {}
    )  # clears pedestrian data used for batch spawning to start fresh each simulakion
    config.congested_lanes.clear()  # clears congested_lane data to start fresh each simulation
    lane_lengths = {
        lane: traci.lane.getLength(lane) for lane in traci.lane.getIDList()
    }  # acquires lane length data in a batch to use for pedestrian statistics data collection
    start_time = datetime.combine(datetime.today(), datetime.min.time())  # Midnight
    stats_filename = f"simulation_stats_{stats_type}_run_{run_number}.csv"

    with open(
        stats_filename, "w", newline=""
    ) as csvfile:  # starts and opens data collection file
        writer = csv.writer(csvfile)
        writer.writerow(
            [
                "Time",
                "Total Pedestrians",
                "Mean Speed",
                "Waiting Pedestrians",
                "Average Route Time",
                "Throughput",
                "Max Pedestrian Density",
                "Max Density Lane",
                "Max Waiting Time",
                "Total Distance Traveled",
                "Average Distance",
            ]
        )

        step = 0
        total_route_times = []
        total_traveled_distances = []

        while step < 86400:  # Run for 24 hours (1 step = 1 second)
            pedestrians.spawn_pedestrians(step)  # Add pedestrians at correct step
            traci.simulationStep()  # Move simulation forward

            if (
                step % 60 != 0
            ):  # bypasses pedestrian data collection until one minute interval (simulation time) has been reached
                step += 1
                continue

            current_time = (start_time + timedelta(seconds=step)).strftime(
                "%H:%M:%S"
            )  # converts step count to human-readable time
            pedestrian_ids = (
                traci.person.getIDList()
            )  # acquires current pedestrian list
            num_pedestrians = len(
                pedestrian_ids
            )  # number of pedestrian count currently in simulation

            # Track waiting times and speeds
            speeds = [traci.person.getSpeed(p) for p in pedestrian_ids]
            waiting_times = [traci.person.getWaitingTime(p) for p in pedestrian_ids]

            mean_speed = sum(speeds) / num_pedestrians if num_pedestrians > 0 else 0
            waiting_pedestrians = sum(1 for t in waiting_times if t > 0)
            max_wait_time = max(waiting_times, default=0)

            congestion_threshhold = 2.5  # set congestion threshold for adding lane to congested lane data block

            # Compute pedestrian density on lanes
            pedestrian_lane_count = {}
            for p in pedestrian_ids:
                lane_id = traci.person.getLaneID(p)
                if lane_id:
                    pedestrian_lane_count[lane_id] = (
                        pedestrian_lane_count.get(lane_id, 0) + 1
                    )

            # Identify congested lanes
            for lane, count in pedestrian_lane_count.items():
                density = count / lane_lengths.get(lane, 1)
                if density > congestion_threshhold:
                    config.congested_lanes.add(lane)  # Mark this lane as congested

            # Identify the most congested lane
            max_density_lane, max_density = max(
                (
                    (lane, count / lane_lengths.get(lane, 1))
                    for lane, count in pedestrian_lane_count.items()
                ),
                key=lambda x: x[1],
                default=(None, 0),
            )

            # Run congestion checks every 60 steps (1 minute) to re-route pedestrian if needed
            if step % 60 == 0:
                pedestrians.update_pedestrian_routes()  # Call function to reroute pedestrians if pedestrian on lane that is in congested_lanes data block

            # Compute distance traveled for each pedestrian
            for p in pedestrian_ids:
                current_pos = traci.person.getPosition(p)
                if p in pedestrian_data:
                    prev_data = pedestrian_data[p]
                    distance_traveled = math.dist(
                        prev_data["initial_position"], current_pos
                    )
                    prev_data["distance_traveled"] += distance_traveled
                    prev_data["initial_position"] = current_pos
                else:
                    pedestrian_data[p] = {
                        "departure_time": step,
                        "initial_position": current_pos,
                        "distance_traveled": 0,
                        "shortest_distance": 0,
                    }

            # Identify finished pedestrians and record route times
            finished_pedestrians = set(pedestrian_data.keys()) - set(pedestrian_ids)
            for p in finished_pedestrians:
                total_route_times.append(step - pedestrian_data[p]["departure_time"])
                total_traveled_distances.append(pedestrian_data[p]["distance_traveled"])
                del pedestrian_data[p]

            avg_route_time = (
                sum(total_route_times) / len(total_route_times)
                if total_route_times
                else 0
            )
            avg_traveled_distance = (
                sum(total_traveled_distances) / len(total_traveled_distances)
                if total_traveled_distances
                else 0
            )

            # Write statistics every 60 steps (1 minute)
            if step % 60 == 0:
                writer.writerow(
                    [
                        current_time,
                        num_pedestrians,
                        mean_speed,
                        waiting_pedestrians,
                        avg_route_time,
                        len(finished_pedestrians),
                        max_density,
                        max_density_lane,
                        max_wait_time,
                        sum(total_traveled_distances),
                        avg_traveled_distance,
                    ]
                )
                print(f"📝 Logged statistics for {current_time}")
            step += 1  # Move to next second

    print(f"✅ Simulation completed. Statistics saved to {stats_filename}.")
