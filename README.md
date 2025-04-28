# MobiNav
The MobiNav Project is a campus navigation system for Kennesaw State University's Marietta campus, aimed at improving accessibility for individuals with mobility needs. The web-based application provides a user-friendly map that routes around obstacles such as stairs and construction zones. Key features include real-time construction updates, optimized routing, and mobile accessibility. The project emphasizes accessibility compliance, including screen reader compatibility and contrast adjustments.

## Technologies Used
- **Frontend**: React.js, Tailwind CSS, Google Maps API
- **Backend**: Python, Flask
- **Database**: SQLite
- **Other Tools**: Leaflet (map visualization)

## Running the Application

### Backend Setup
1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Initialize the database:
   ```
   python init_db.py
   ```
4. Start the Flask server:
   ```
   python run.py
   ```

### Frontend Setup
1. Navigate to the campus-map directory:
   ```
   cd campus-map
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Access the application at http://localhost:3000
