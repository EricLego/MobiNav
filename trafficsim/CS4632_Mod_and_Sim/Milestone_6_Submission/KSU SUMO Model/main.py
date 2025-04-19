# File: main.py
import simulation
import time
import get_coordinates_occupancy

NUM_RUNS = 1 # sets the number of times the simulation will run.

def main():
    """Main function to start the simulation."""
    stats_type = get_coordinates_occupancy.get_current_day_type()
    # stats_type = "" # this line can be used to hardcode in a schedule type (MWF, TTh, SSu, MWF_Peak, TTh_Peak, SSu_Peak, Base); ensure previous line is commented out when using this line.

    for run_number in range(1, NUM_RUNS+1):
        print(f"Starting simulation run {run_number} for {stats_type}")
        start_time = time.time() # Start time tracking
        simulation.start_simulation() # starts SUMO
        simulation.run_simulation(run_number, stats_type) # starts pedestrian spawning and data collection
        simulation.close_simulation() # stops SUMO
        end_time = time.time()  # Capture end time
        print(f"Simulation took {end_time - start_time} seconds.")

if __name__ == "__main__":
    main()
