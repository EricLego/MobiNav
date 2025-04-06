# File: main.py
import simulation
import time

def main():
    """Main function to start the simulation."""
    start_time = time.time() # Start time tracking
    simulation.start_simulation()
    simulation.run_simulation()
    end_time = time.time()  # Capture end time
    simulation.close_simulation()
    print(f"Simulation took {end_time - start_time} seconds.")

if __name__ == "__main__":
    main()
