# File: config.py
SUMO_CONFIG_FILE = "KSUMariettaConfig.sumocfg"
NET_FILE = "KSUMarietta.net.xml.gz"

# GPS Coordinates (replace with database connection later)
CURRENT_LOCATION = (33.938286, -84.518969)  # Latitude, Longitude
DESTINATION_LOCATION = (33.940275, -84.520132)  # Latitude, Longitude

# Simulation parameters
BUILDING_OCCUPANCY = 100  # Number of pedestrians to simulate
SIMULATION_STEPS = 1000
