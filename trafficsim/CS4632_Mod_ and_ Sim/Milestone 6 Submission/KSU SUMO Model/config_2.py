# File: config.py
SUMO_CONFIG_FILE = "KSUMariettaConfig.sumocfg"
NET_FILE = "KSUMarietta.net.xml.gz"

SIMULATION_STEPS = 86400 # Simulation is preset to run for one day. However, the simulation will stop when no pedestrians are in the network any longer
congested_lanes = set()
day_type_today = ""
building_data = []
occupancy_data = []