import React from 'react';
import '../LegalNotices/LegalNotices.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const AboutUs = () => {
  return (
    <div className="about-page">
      <Navbar />
      
      <div className="page-container">
        <div className="page-header">
          <h1>About Notflix</h1>
          <p className="subtitle">The world's leading streaming entertainment service</p>
        </div>

        <div className="about-section">
          <h2>Our Story</h2>
          <p>Founded in 1997, Notflix has grown from a DVD rental service to the world's leading streaming entertainment platform. We revolutionized the way people watch television and movies, bringing joy to millions of households worldwide.</p>
          <p>Today, Notflix serves over 500 million members in more than 190 countries, offering a wide variety of award-winning TV shows, movies, anime, documentaries, and more – on thousands of internet-connected devices.</p>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <div className="highlight-box">
            <p><strong>To entertain the world.</strong></p>
            <p>We want to entertain everyone, everywhere, with a personalized viewing experience that fits their lives. We're creating original stories that move the world, investing in local content that connects cultures, and giving people the freedom to watch what they want, when they want.</p>
          </div>
        </div>

        <div className="about-section">
          <h2>By the Numbers</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">500M+</span>
              <span className="stat-label">Members Worldwide</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">190+</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">50+</span>
              <span className="stat-label">Languages</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">15,000+</span>
              <span className="stat-label">Titles</span>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>What We Do</h2>
          <h3>Original Content</h3>
          <p>We invest billions in creating original movies, series, documentaries, and comedy specials. Our content has won numerous awards and critical acclaim worldwide.</p>
          
          <h3>Personalization</h3>
          <p>Our advanced recommendation engine uses AI and machine learning to personalize your viewing experience, helping you discover content you'll love.</p>
          
          <h3>Global Reach</h3>
          <p>We produce and license content in multiple languages and regions, celebrating diverse stories and cultures from around the world.</p>
          
          <h3>Innovation</h3>
          <p>We continuously innovate in streaming technology, video encoding, UI/UX design, and content delivery to provide the best possible experience.</p>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">🎯</span>
              <h3>Excellence</h3>
              <p>We strive for excellence in everything we do, from content creation to customer service.</p>
            </div>
            
            <div className="value-card">
              <span className="value-icon">🌍</span>
              <h3>Diversity</h3>
              <p>We embrace diversity and inclusion, celebrating stories from all cultures and backgrounds.</p>
            </div>
            
            <div className="value-card">
              <span className="value-icon">💡</span>
              <h3>Innovation</h3>
              <p>We push boundaries and embrace new technologies to enhance entertainment.</p>
            </div>
            
            <div className="value-card">
              <span className="value-icon">🤝</span>
              <h3>Integrity</h3>
              <p>We operate with honesty and transparency in all our business practices.</p>
            </div>
            
            <div className="value-card">
              <span className="value-icon">⭐</span>
              <h3>Quality</h3>
              <p>We are committed to delivering high-quality content and exceptional service.</p>
            </div>
            
            <div className="value-card">
              <span className="value-icon">🚀</span>
              <h3>Impact</h3>
              <p>We create content that moves people, sparks conversations, and makes a difference.</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Leadership</h2>
          <p>Notflix is led by a team of experienced executives with backgrounds in technology, entertainment, finance, and operations. Our leadership team is committed to our mission of entertaining the world while building a sustainable, profitable business.</p>
        </div>

        <div className="about-section">
          <h2>Social Responsibility</h2>
          <p>We believe in using our platform for positive social impact:</p>
          <ul>
            <li><strong>Sustainability:</strong> We're committed to reaching net zero greenhouse gas emissions by 2030</li>
            <li><strong>Inclusion:</strong> We invest in diverse voices both on and off screen</li>
            <li><strong>Education:</strong> We support film schools and provide scholarships for aspiring filmmakers</li>
            <li><strong>Community:</strong> We partner with organizations to bring joy and entertainment to underserved communities</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Awards & Recognition</h2>
          <p>Notflix content has earned hundreds of prestigious awards, including:</p>
          <ul>
            <li>Emmy Awards</li>
            <li>Academy Awards (Oscars)</li>
            <li>Golden Globe Awards</li>
            <li>Screen Actors Guild Awards</li>
            <li>Critics Choice Awards</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Join Our Team</h2>
          <p>We're always looking for talented individuals to join our team. If you're passionate about entertainment and technology, check out our careers page to explore opportunities.</p>
          <div className="contact-box">
            <p><strong>Careers</strong></p>
            <p>Visit: <a href="#">careers.notflix.com</a></p>
            <p>Email: <a href="mailto:careers@notflix.com">careers@notflix.com</a></p>
          </div>
        </div>

        <div className="about-section">
          <h2>Contact Us</h2>
          <div className="contact-box">
            <p><strong>Corporate Headquarters</strong></p>
            <p>Notflix, Inc.</p>
            <p>100 Winchester Circle</p>
            <p>Los Gatos, CA 95032</p>
            <p>United States</p>
            <p>Email: <a href="mailto:info@notflix.com">info@notflix.com</a></p>
            <p>Phone: 1-800-NOTFLIX</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
