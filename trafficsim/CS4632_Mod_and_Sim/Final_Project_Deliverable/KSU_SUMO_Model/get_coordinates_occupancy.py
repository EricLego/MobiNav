# File: get_coordinates_occupancy.py
"""This module gets building coordinates and building occupancy schedules from the database"""

import datetime

import psycopg2

import config


def get_current_day_type():
    if config.stats_type == "":
        today = datetime.datetime.today().weekday()  # Monday = 0, Sunday = 6
        if today in [0, 2, 4]:  # Monday, Wednesday, Friday
            return "MWF"
        if today in [1, 3]:  # Tuesday, Thursday
            return "TTh"
            # Saturday, Sunday
        return "SSu"
    return config.stats_type


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

        table1 = "building"
        table2 = "occupancy_schedule"
        common_column = "building_id"
        day_type = get_current_day_type()

        # Fetches all occupancy data for the entire day (current day).
        query = f"""
                    SELECT building.building_id, building.name,
                            building.latitude, building.longitude,
                            occupancy_schedule.start_time,
                            occupancy_schedule.end_time,
                            occupancy_schedule.occupancy_value
                    FROM {table1} AS building
                    INNER JOIN {table2} AS occupancy_schedule
                    ON building.{common_column} =
                            occupancy_schedule.{common_column}
                    WHERE occupancy_schedule.day = %s
                    ORDER BY occupancy_schedule.start_time;
                """
        cursor.execute(query, (day_type,))
        results = cursor.fetchall()

        # Close connection
        cursor.close()
        connection.close()

        return results

    except Exception as e:
        print("Error:", e)


if __name__ == "__main__":
    # connect_and_fetch()
    print(connect_and_fetch())  # Test fetching occupancy data
