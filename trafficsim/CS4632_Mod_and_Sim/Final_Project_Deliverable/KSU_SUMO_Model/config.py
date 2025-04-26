# File: config.py
"""This module sets the configuration data for the simulation"""

SUMO_CONFIG_FILE = "KSUMariettaConfig.sumocfg"
NET_FILE = "KSUMarietta.net.xml.gz"

SIMULATION_STEPS = 86400  # Simulation is preset to run for one day. However, the simulation will stop when no pedestrians are in the network any longer
congested_lanes = set()  # set global congested lanes variable

stats_type = ""  # leave "" if desire is to pull current day data or enter day schedule desired (e.g., MWF for Monday, Wednesday, Friday; TTh for Tuesday, Thursday; and SSu for Saturday and Sunday)

# PostgreSQL connection details
DB_HOST = "localhost"  # Use "localhost" for local database
DB_NAME = "mobinav"  # Change to your database name
DB_USER = "sumo"  # Change to your PostgreSQL username
DB_PASSWORD = "sumouser"  # Change to your password
DB_PORT = "5432"  # Default PostgreSQL port
