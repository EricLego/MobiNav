# File: get_buildings_list.py
"""This file retrieves a campus building list from the database"""

import psycopg2

import config


def connect_and_fetch():
    try:
        # Establish connection
        connection = psycopg2.connect(
            host=config.DB_HOST,
            database=config.DB_NAME,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            port=config.DB_PORT,
        )
        cursor = connection.cursor()

        # This code fetches the building locations (coordinates).
        query = f"""
            SELECT * FROM building;
            """
        cursor.execute(query)
        results = cursor.fetchall()

        # Close connection
        cursor.close()
        connection.close()

        return results

    except Exception as e:
        print("Error:", e)


if __name__ == "__main__":
    connect_and_fetch()
