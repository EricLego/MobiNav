import traci
import config
import csv
import math
import pedestrians
from datetime import datetime, timedelta


def start_simulation():
    # Start SUMO simulation; to run with gui change "sumo" to "sumo-gui'
    traci.start(["sumo-gui", "-c", config.SUMO_CONFIG_FILE])


def close_simulation():
    # Close the SUMO simulation.
    traci.close()
    print("Simulation done.")


def run_simulation(steps=config.SIMULATION_STEPS):

    pedestrian_data = {}
    lane_lengths = {lane: traci.lane.getLength(lane) for lane in traci.lane.getIDList()}
    start_time = datetime.combine(datetime.today(), datetime.min.time())  # Midnight

    # Open CSV for logging edge density statistics
    with open("edge_density_stats.csv", "w", newline="") as edgefile:
        edge_writer = csv.writer(edgefile)
        edge_writer.writerow(["Time Step", "Time of Day", "Edge ID", "Pedestrian Density", "Latitude", "Longitude"])

        step = 0

        while step < 86400:  # Run for 24 hours (1 step = 1 second)
            pedestrians.spawn_pedestrians(step)  # Add pedestrians at correct step

            traci.simulationStep()  # Move simulation forward

            if step % 60 != 0:
                step += 1
                continue

            # Compute actual time corresponding to the current step
            current_time = (start_time + timedelta(seconds=step)).strftime("%H:%M:%S")

            # Fetch all pedestrian data
            pedestrian_ids = traci.person.getIDList()

            # Store lane locations instead of repeated TraCI API calls
            pedestrian_lane_count = {}
            for p in pedestrian_ids:
                lane_id = traci.person.getLaneID(p)
                if lane_id:
                    pedestrian_lane_count[lane_id] = pedestrian_lane_count.get(lane_id, 0) + 1

            # Write edge density statistics, filtering for densities >= 2
            for lane, count in pedestrian_lane_count.items():
                density = count / lane_lengths.get(lane, 1)
                if density >= 2:
                    latitude, longitude = (0, 0)
                    edge_shape = traci.lane.getShape(lane)
                    if edge_shape:
                        x, y = edge_shape[0]  # Use the first coordinate of the edge
                        longitude, latitude = traci.simulation.convertGeo(x, y, fromGeo=False)  # Convert to GPS coordinates
                    edge_writer.writerow([step, current_time, lane, density, latitude, longitude])

            step += 1
            print(f"Simulation step {step} - Time: {current_time}")
