import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, ExternalLink, Menu, X } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const team = [
    {
      name: 'Kamsiyochuku Ezeonu',
      username: 'Kamsy',
      title: 'Lead Designer',
      bio: 'Shaped the visual identity and UX.',
      github: 'https://github.com/Goodie',
      linkedin: '#',
      portfolio: '#'
    },
    {
      name: 'Sherifa Abdullahi',
      username: 'SHE',
      title: 'Programs Facilitator',
      bio: 'Built learner success pathways.',
      github: 'https://github.com/hijabscancode',
      linkedin: '#',
      portfolio: '#'
    },
    {
      name: 'Felix Demkir',
      username: 'Msugh1',
      title: 'Research Lead I',
      bio: 'Researched industry trends & learning science.',
      github: 'https://github.com/msugh1',
      linkedin: '#',
      portfolio: '#'
    },
    {
      name: 'James Mkegh',
      username: 'jamesava-mk',
      title: 'Research Lead II & Community Manager',
      bio: 'Connected learners to opportunities.',
      github: 'https://github.com/jamesava-mk',
      linkedin: '#',
      portfolio: '#'
    },
    {
      name: 'Titobioluwa Odulana',
      username: 'batman',
      title: 'Developer',
      bio: 'Full-stack implementation.',
      github: 'https://github.com/BatTito',
      linkedin: '#',
      portfolio: '#'
    },
    {
      name: 'David Idowu',
      username: 'manofval0r',
      title: 'Developer & Project Lead',
      bio: 'Technical vision & architecture.',
      github: 'https://github.com/manofval0r',
      linkedin: '#',
      portfolio: '#'
    }
  ];

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => navigate('/')}>
            <span className="logo-text">WHAT'S NEXT</span>
          </div>

          <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="#about" className="nav-link">About</a>
            <a href="#problem" className="nav-link">Problem & Solution</a>
            <a href="#team" className="nav-link">Team</a>
            <button className="nav-btn signin" onClick={() => navigate('/auth')}>
              Sign In
            </button>
            <button className="nav-btn signup" onClick={() => navigate('/auth')}>
              Get Started
            </button>
          </div>

          <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Escape Tutorial Hell.<br />Build Real Skills.</h1>
          <p>Your personalized guide from learning chaos to job-ready mastery. No fluff. No endless playlists. Just a clear path to your dream tech role.</p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => navigate('/auth')}>Start Learning</button>
            <button className="btn-secondary" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>Learn More</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="gradient-blur"></div>
        </div>
      </section>

      {/* ABOUT THE PLATFORM */}
      <section id="about" className="about">
        <h2>How It Works</h2>
        <div className="about-grid">
          <div className="about-card">
            <div className="card-icon">🧭</div>
            <h3>AI Roadmaps</h3>
            <p>Personalized learning paths tailored to your background and career goals.</p>
          </div>
          <div className="about-card">
            <div className="card-icon">🛠️</div>
            <h3>Real Projects</h3>
            <p>Build portfolio-ready projects with automated feedback and peer review.</p>
          </div>
          <div className="about-card">
            <div className="card-icon">✓</div>
            <h3>Verified Skills</h3>
            <p>Community verification ensures your achievements are legitimate and trustworthy.</p>
          </div>
          <div className="about-card">
            <div className="card-icon">💼</div>
            <h3>Job Matching</h3>
            <p>Direct access to entry-level roles matched to your verified skills.</p>
          </div>
        </div>
      </section>

      {/* PROBLEM & SOLUTION */}
      <section id="problem" className="problem-solution">
        <h2>The Challenge & Our Solution</h2>
        <div className="ps-container">
          <div className="ps-column">
            <h3 className="ps-title problem-title">The Problem</h3>
            <ul className="ps-list">
              <li><strong>Tutorial Hell:</strong> Endless videos with no clear end goal.</li>
              <li><strong>Skill Gaps:</strong> Learning disconnected topics without a coherent path.</li>
              <li><strong>No Feedback:</strong> Unsure if your skills are job-ready.</li>
              <li><strong>Portfolio Chaos:</strong> Difficult to showcase what you've learned.</li>
            </ul>
          </div>
          <div className="ps-divider"></div>
          <div className="ps-column">
            <h3 className="ps-title solution-title">Our Solution</h3>
            <ul className="ps-list">
              <li><strong>Structured Roadmaps:</strong> AI creates personalized learning paths.</li>
              <li><strong>Unified Learning:</strong> Every skill connects to real career goals.</li>
              <li><strong>Instant Feedback:</strong> Automated scoring + peer verification.</li>
              <li><strong>Portfolio Export:</strong> One-click professional portfolio generation.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="team">
        <h2>Built by a Talented Team</h2>
        <p className="team-subtitle">Meet the people behind WHAT'S NEXT.</p>
        <div className="team-grid">
          {team.map((member, idx) => (
            <div key={idx} className="team-card">
              <div className="team-avatar">{member.username.charAt(0).toUpperCase()}</div>
              <h3 className="team-name">{member.name}</h3>
              <p className="team-username">@{member.username}</p>
              <p className="team-role">{member.title}</p>
              <p className="team-bio">{member.bio}</p>
              <div className="team-socials">
                <a href={member.github} target="_blank" rel="noopener noreferrer" title="GitHub" className="social-link">
                  <Github size={18} />
                </a>
                {member.linkedin !== '#' && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="social-link">
                    <Linkedin size={18} />
                  </a>
                )}
                {member.portfolio !== '#' && (
                  <a href={member.portfolio} target="_blank" rel="noopener noreferrer" title="Portfolio" className="social-link">
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <p>Empowering learners to break into tech and build fulfilling careers.</p>
          </div>
          <div className="footer-right">
            <p className="footer-credits">
              <span className="credit-valor">Designed By<a href="https://david-idowu-portfolio.vercel.app"> <strong>Valor</strong></a></span>
              <span className="credit-batman">&amp; <strong>batman</strong></span>
              <span className="credit-tech">| AI | Full-Stack</span>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 WHAT'S NEXT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
