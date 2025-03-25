# File: main.py
import simulation_CAP
import time

def main():
    """Main function to start the simulation."""
    start_time = time.time() # Start time tracking
    simulation_CAP.start_simulation()
    simulation_CAP.run_simulation()
    end_time = time.time()  # Capture end time
    simulation_CAP.close_simulation()
    print(f"Simulation took {end_time - start_time} seconds.")

if __name__ == "__main__":
    main()
