import React from 'react';
import './MediaCentre.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const MediaCentre = () => {
  return (
    <div className="media-centre-page">
      <Navbar />
      
      <div className="page-container">
        <div className="page-header">
          <h1>Media Centre</h1>
          <p className="subtitle">Latest news, press releases, and media assets from Notflix</p>
        </div>

        <div className="media-section">
          <h2>Press Releases</h2>
          <div className="press-releases">
            <div className="press-item">
              <div className="press-date">November 20, 2025</div>
              <h3>Notflix Announces New Original Content for 2026</h3>
              <p>Notflix today announced a slate of new original movies and series coming in 2026, expanding its commitment to quality entertainment across all genres.</p>
              <a href="#" className="read-more">Read More →</a>
            </div>

            <div className="press-item">
              <div className="press-date">November 15, 2025</div>
              <h3>Notflix Expands Global Reach with 50 New Languages</h3>
              <p>In a major expansion, Notflix now offers content in 50 languages, making entertainment accessible to millions more viewers worldwide.</p>
              <a href="#" className="read-more">Read More →</a>
            </div>

            <div className="press-item">
              <div className="press-date">November 10, 2025</div>
              <h3>Notflix Hits 500 Million Subscribers Milestone</h3>
              <p>Notflix celebrates reaching 500 million subscribers globally, cementing its position as the world's leading streaming entertainment service.</p>
              <a href="#" className="read-more">Read More →</a>
            </div>

            <div className="press-item">
              <div className="press-date">November 5, 2025</div>
              <h3>Introducing Notflix AI: Personalized Recommendations Reimagined</h3>
              <p>Notflix unveils its next-generation AI recommendation system, delivering unprecedented personalization for every viewer.</p>
              <a href="#" className="read-more">Read More →</a>
            </div>
          </div>
        </div>

        <div className="media-section">
          <h2>Media Assets</h2>
          <div className="media-grid">
            <div className="asset-card">
              <div className="asset-icon">🎨</div>
              <h3>Brand Assets</h3>
              <p>Download official logos, brand guidelines, and creative assets.</p>
              <button className="asset-btn">Download Kit</button>
            </div>

            <div className="asset-card">
              <div className="asset-icon">📸</div>
              <h3>Press Photos</h3>
              <p>High-resolution images of original content and productions.</p>
              <button className="asset-btn">Browse Gallery</button>
            </div>

            <div className="asset-card">
              <div className="asset-icon">🎬</div>
              <h3>Video Content</h3>
              <p>Trailers, behind-the-scenes footage, and promotional videos.</p>
              <button className="asset-btn">View Library</button>
            </div>

            <div className="asset-card">
              <div className="asset-icon">📰</div>
              <h3>Fact Sheets</h3>
              <p>Detailed information about Notflix shows, movies, and company.</p>
              <button className="asset-btn">Download</button>
            </div>
          </div>
        </div>

        <div className="media-section">
          <h2>Contact Media Relations</h2>
          <div className="contact-info">
            <div className="contact-card">
              <h3>Press Inquiries</h3>
              <p>Email: <a href="mailto:press@notflix.com">press@notflix.com</a></p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>

            <div className="contact-card">
              <h3>Partnership Opportunities</h3>
              <p>Email: <a href="mailto:partnerships@notflix.com">partnerships@notflix.com</a></p>
              <p>Phone: +1 (555) 123-4568</p>
            </div>

            <div className="contact-card">
              <h3>Content Licensing</h3>
              <p>Email: <a href="mailto:licensing@notflix.com">licensing@notflix.com</a></p>
              <p>Phone: +1 (555) 123-4569</p>
            </div>
          </div>
        </div>

        <div className="media-section">
          <h2>Social Media</h2>
          <div className="social-links">
            <a href="#" className="social-btn">
              <span className="social-icon">🐦</span>
              <span>Twitter</span>
            </a>
            <a href="#" className="social-btn">
              <span className="social-icon">📘</span>
              <span>Facebook</span>
            </a>
            <a href="#" className="social-btn">
              <span className="social-icon">📷</span>
              <span>Instagram</span>
            </a>
            <a href="#" className="social-btn">
              <span className="social-icon">▶️</span>
              <span>YouTube</span>
            </a>
            <a href="#" className="social-btn">
              <span className="social-icon">💼</span>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MediaCentre;
