# File: main.py
import simulation
import pedestrians

def main():
    """Main function to start the simulation."""
    simulation.start_simulation()
    pedestrians.spawn_pedestrians()
    simulation.run_simulation()
    simulation.close_simulation()

if __name__ == "__main__":
    main()
