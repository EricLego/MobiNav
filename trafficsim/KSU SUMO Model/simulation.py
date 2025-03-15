# File: simulation.py
import traci
import sumolib
import config

def start_simulation():
    """Start the SUMO simulation with GUI."""
    traci.start(["sumo-gui", "-c", config.SUMO_CONFIG_FILE])

def close_simulation():
    """Close the SUMO simulation."""
    traci.close()
    print("Simulation done.")

def run_simulation(steps=config.SIMULATION_STEPS):
    """Execute simulation steps."""
    for step in range(steps):
        traci.simulationStep()
        print(f"Simulation step {traci.simulation.getTime()}")
