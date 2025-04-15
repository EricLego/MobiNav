import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutPage.css';

const AboutPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Eric Legostaev',
      role: 'Front-end Developer',
      bio: 'Specializes in React development and responsive UI design.',
      skills: ['React', 'JavaScript', 'CSS', 'UI/UX Design'],
      image: '/team/profile-placeholder.jpg'
    },
    {
      id: 2,
      name: 'Damien Castro',
      role: 'Full-stack Developer',
      bio: 'Experienced in both frontend and backend development with a focus on system architecture.',
      skills: ['React', 'Node.js', 'Python', 'Database Design'],
      image: '/team/profile-placeholder.jpg'
    },
    {
      id: 3,
      name: 'Dom Evans',
      role: 'Back-end Developer',
      bio: 'Specializes in API development and database optimization.',
      skills: ['Python', 'Flask', 'SQL', 'API Design'],
      image: '/team/profile-placeholder.jpg'
    }
  ];

  return (
    <div className="about-page">
      <div className="about-header">
        <div className="container">
          <h1>About MobiNav</h1>
          <p className="about-description">
            MobiNav is an accessible campus navigation system designed to help all users, especially those with mobility challenges, navigate the KSU campus efficiently.
          </p>
          <div className="actions">
            <Link to="/map" className="primary-button">Explore the Map</Link>
            <Link to="/report" className="secondary-button">Report an Obstacle</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            We believe that campus navigation should be accessible to everyone. MobiNav is built to provide 
            customized routing that accounts for individual mobility needs, helping users find the most 
            accessible paths across campus.
          </p>
        </section>

        <section className="team-section">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="profile-card">
                <div className="profile-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="profile-info">
                  <h3>{member.name}</h3>
                  <p className="role">{member.role}</p>
                  <p className="bio">{member.bio}</p>
                  <div className="skills">
                    {member.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="tech-section">
          <h2>Technology Stack</h2>
          <div className="tech-list">
            <div className="tech-item">
              <h3>Front-end</h3>
              <ul>
                <li>React</li>
                <li>Google Maps API</li>
                <li>Leaflet/OSRM</li>
                <li>Responsive Design</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Back-end</h3>
              <ul>
                <li>Flask (Python)</li>
                <li>SQLAlchemy</li>
                <li>RESTful API</li>
                <li>OSRM Engine</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Features</h3>
              <ul>
                <li>Accessible Routing</li>
                <li>Obstacle Reporting</li>
                <li>Building Information</li>
                <li>User Preferences</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;