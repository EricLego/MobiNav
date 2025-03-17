# File: main.py
import simulation
import pedestrians
import ped_test

def main():
    """Main function to start the simulation."""
    simulation.start_simulation()
    #ped_test.spawn_pedestrians()
    pedestrians.spawn_pedestrians()
    simulation.run_simulation()
    simulation.close_simulation()

if __name__ == "__main__":
    main()
