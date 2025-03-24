#File: get_buildings_list.py
import psycopg2

# PostgreSQL connection details
DB_HOST = "localhost"  # Use "localhost" for local database
DB_NAME = "mobinav"  # Change to your database name
DB_USER = "sumo"  # Change to your PostgreSQL username
DB_PASSWORD = "sumouser"  # Change to your password
DB_PORT = "5432"  # Default PostgreSQL port

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

        # This code fetches the building locations (coordinates).
        query = f"""
            SELECT * FROM building;
            """
        cursor.execute(query)
        results = cursor.fetchall()
        return results

        # Close connection
        cursor.close()
        connection.close()

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    connect_and_fetch()


