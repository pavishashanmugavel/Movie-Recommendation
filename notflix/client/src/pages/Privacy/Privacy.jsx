import React from 'react';
import '../LegalNotices/LegalNotices.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <Navbar />
      
      <div className="page-container">
        <div className="page-header">
          <h1>Privacy Policy</h1>
          <p className="subtitle">Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
        </div>

        <div className="privacy-section">
          <h2>1. Information We Collect</h2>
          <h3>1.1 Information You Provide to Us</h3>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Account registration information (name, email address, password)</li>
            <li>Payment information (credit card or other payment details)</li>
            <li>Communications with Notflix customer service</li>
            <li>Ratings, reviews, and other content you provide</li>
            <li>Information in surveys or contests</li>
          </ul>
          
          <h3>1.2 Automatically Collected Information</h3>
          <p>We automatically collect information about you when you use our service:</p>
          <ul>
            <li>Your interactions with our service (titles viewed, search queries, viewing activity)</li>
            <li>Device and software characteristics (type, configuration, IP address)</li>
            <li>Connection information (network, browser type)</li>
            <li>Cookie data and similar technologies</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes:</p>
          <ul>
            <li><strong>Provide, maintain, and improve our service:</strong> Including content personalization and recommendations</li>
            <li><strong>Process payments:</strong> For memberships and other purchases</li>
            <li><strong>Communicate with you:</strong> About service-related announcements, promotions, and customer support</li>
            <li><strong>Personalize content:</strong> Suggest movies and TV shows we think you will enjoy</li>
            <li><strong>Monitor and analyze:</strong> Trends, usage, and activities in connection with our service</li>
            <li><strong>Detect and prevent fraud:</strong> And protect the security of our service</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>3. Information Sharing and Disclosure</h2>
          <h3>3.1 With Your Consent</h3>
          <p>We may share your information with third parties when you give us consent to do so.</p>
          
          <h3>3.2 Service Providers</h3>
          <p>We work with companies that provide services on our behalf, such as:</p>
          <ul>
            <li>Payment processing and fraud prevention</li>
            <li>Customer service and technical support</li>
            <li>Marketing and advertising services</li>
            <li>Content delivery networks</li>
          </ul>
          
          <h3>3.3 Legal Requirements</h3>
          <p>We may disclose your information if required by law or in response to valid requests by public authorities.</p>
        </div>

        <div className="privacy-section">
          <h2>4. Cookies and Similar Technologies</h2>
          <p>We use cookies and similar tracking technologies to collect and track information and improve our service.</p>
          <h3>Types of Cookies We Use:</h3>
          <ul>
            <li><strong>Essential Cookies:</strong> Necessary for the service to function</li>
            <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our service</li>
            <li><strong>Functionality Cookies:</strong> Remember your preferences and personalize your experience</li>
            <li><strong>Advertising Cookies:</strong> Deliver relevant advertisements</li>
          </ul>
          <p>You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.</p>
        </div>

        <div className="privacy-section">
          <h2>5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
          <div className="highlight-box">
            <p><strong>Security Measures Include:</strong></p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure data centers and infrastructure</li>
            </ul>
          </div>
        </div>

        <div className="privacy-section">
          <h2>6. Your Rights and Choices</h2>
          <h3>6.1 Access and Update</h3>
          <p>You can access and update your account information at any time through your account settings.</p>
          
          <h3>6.2 Marketing Communications</h3>
          <p>You can opt out of receiving promotional emails by following the unsubscribe instructions in those emails.</p>
          
          <h3>6.3 Data Deletion</h3>
          <p>You can request deletion of your personal information, subject to certain exceptions under applicable law.</p>
          
          <h3>6.4 Cookie Preferences</h3>
          <p>You can manage your cookie preferences through your browser settings.</p>
        </div>

        <div className="privacy-section">
          <h2>7. Children's Privacy</h2>
          <p>Notflix is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us.</p>
        </div>

        <div className="privacy-section">
          <h2>8. International Data Transfers</h2>
          <p>Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.</p>
          <p>We take steps to ensure your information is treated securely and in accordance with this Privacy Policy.</p>
        </div>

        <div className="privacy-section">
          <h2>9. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
          <p>We encourage you to review this Privacy Policy periodically for any changes.</p>
          <p className="last-updated">Last Updated: November 20, 2025</p>
        </div>

        <div className="privacy-section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
          <div className="contact-box">
            <p><strong>Privacy Office</strong></p>
            <p>Notflix, Inc.</p>
            <p>100 Winchester Circle</p>
            <p>Los Gatos, CA 95032</p>
            <p>Email: <a href="mailto:privacy@notflix.com">privacy@notflix.com</a></p>
            <p>Phone: 1-800-NOTFLIX</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
