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

        # Execute a query
        cursor.execute("SELECT * FROM building;")  # Change table name
        rows = cursor.fetchall()
        # Print results
        for row in rows:
            print(row)

        cursor.execute("SELECT * FROM occupancy_schedule;")  # Change table name
        rows = cursor.fetchall()
        # Print results
        for row in rows:
            print(row)

        # Close connection
        cursor.close()
        connection.close()

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    connect_and_fetch()
