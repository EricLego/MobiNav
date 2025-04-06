# File: main.py
import simulation
import time
import get_coordinates_occupancy

NUM_RUNS = 30

def main():
    """Main function to start the simulation."""
    stats_type = get_coordinates_occupancy.get_current_day_type()

    for run_number in range(1, NUM_RUNS+1):
        print(f"Starting simulation run {run_number} for {stats_type}")
        start_time = time.time() # Start time tracking
        simulation.start_simulation()
        simulation.run_simulation(run_number, stats_type)
        simulation.close_simulation()
        end_time = time.time()  # Capture end time
        print(f"Simulation took {end_time - start_time} seconds.")

if __name__ == "__main__":
    main()
