import traci

sumo_config_path = "/home/administrator/sumo/trafficsim/osm.sumocfg"  # Full path to config file

traci.start(["sumo", "-c", sumo_config_path])

for step in range(86400):  # Run for 1000 simulation steps
    traci.simulationStep()

traci.close()
print("Simulation finished.")