#File: get_coordinates_occupancy_24.py
import psycopg2
import datetime

# PostgreSQL connection details
DB_HOST = "localhost"  # Use "localhost" for local database
DB_NAME = "mobinav"  # Change to your database name
DB_USER = "sumo"  # Change to your PostgreSQL username
DB_PASSWORD = "sumouser"  # Change to your password
DB_PORT = "5432"  # Default PostgreSQL port

def get_current_day_type():
    return ("MWF")

def connect_and_fetch():
    try:
        # Establish connection
        connection = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cursor = connection.cursor()

        table1 = "building"
        table2 = "occupancy_schedule"
        common_column = "building_id"
        day_type = get_current_day_type()

        # Fetches all occupancy data for the entire day (current day).
        query = f"""
                    SELECT building.building_id, building.name, building.latitude, building.longitude, 
                           occupancy_schedule.start_time, occupancy_schedule.end_time, occupancy_schedule.occupancy_value 
                    FROM {table1} AS building
                    INNER JOIN {table2} AS occupancy_schedule 
                    ON building.{common_column} = occupancy_schedule.{common_column}
                    WHERE occupancy_schedule.day = %s
                    ORDER BY occupancy_schedule.start_time;
                """
        cursor.execute(query, (day_type,))
        results = cursor.fetchall()
        return results

        # Close connection
        cursor.close()
        connection.close()

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    #connect_and_fetch()
    print(connect_and_fetch())  # Test fetching occupancy data
