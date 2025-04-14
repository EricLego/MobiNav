# File: main.py
import simulation_2
import time
import config_2
import pedestrians_2

NUM_RUNS = 30
DAY_TYPE = 8
day_type = ["Base", "LTP", "MWF", "TTh", "SSu", "MWF_Peak", "TTh_Peak", "SSu_Peak"]

def main():
    """Main function to start the simulation."""

    for day_type_number in range (0, DAY_TYPE):
        stats_type = day_type[day_type_number]
        config_2.day_type_today = stats_type
        test_day = config_2.day_type_today
        pedestrians_2.get_data()

        for run_number in range(1, NUM_RUNS+1):
            print(f"Starting simulation run {run_number} for {stats_type}")
            start_time = time.time() # Start time tracking
            simulation_2.start_simulation()
            simulation_2.run_simulation(run_number, stats_type)
            simulation_2.close_simulation()
            end_time = time.time()  # Capture end time
            print(f"Simulation took {end_time - start_time} seconds.")

if __name__ == "__main__":
    main()
