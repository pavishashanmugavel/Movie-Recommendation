import React from 'react';
import './LegalNotices.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const LegalNotices = () => {
  return (
    <div className="legal-page">
      <Navbar />
      
      <div className="page-container">
        <div className="page-header">
          <h1>Legal Notices</h1>
          <p className="subtitle">Important legal information about using Notflix</p>
        </div>

        <div className="legal-section">
          <h2>Copyright Notice</h2>
          <p>© 1997-{new Date().getFullYear()} Notflix, Inc. All rights reserved.</p>
          <p>All content on this website, including text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Notflix or its content suppliers and protected by international copyright laws.</p>
        </div>

        <div className="legal-section">
          <h2>Trademark Information</h2>
          <p>NOTFLIX, the Notflix logo, and other Notflix trademarks, service marks, graphics, and logos used in connection with Notflix are trademarks or registered trademarks of Notflix, Inc. Other trademarks, service marks, graphics, and logos used in connection with the Notflix service may be the trademarks of their respective owners.</p>
          <p>You are granted no right or license with respect to any of these trademarks and any use of such trademarks.</p>
        </div>

        <div className="legal-section">
          <h2>Content Licensing</h2>
          <p>The Notflix service and any content accessed through our service are for your personal and non-commercial use only. You may not download, copy, reproduce, distribute, transmit, broadcast, display, sell, license, or otherwise exploit any content for any purposes without the express written consent of Notflix or the respective licensors of the content.</p>
        </div>

        <div className="legal-section">
          <h2>Digital Millennium Copyright Act (DMCA)</h2>
          <p>Notflix respects the intellectual property rights of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please provide our Copyright Agent with the following information:</p>
          <ul>
            <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright interest</li>
            <li>A description of the copyrighted work that you claim has been infringed</li>
            <li>A description of where the material that you claim is infringing is located on the Notflix service</li>
            <li>Your address, telephone number, and email address</li>
            <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law</li>
            <li>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf</li>
          </ul>
          <p>Notflix's Copyright Agent for notice of claims of copyright infringement can be reached at:</p>
          <div className="contact-box">
            <p><strong>Copyright Agent</strong></p>
            <p>Notflix, Inc.</p>
            <p>100 Winchester Circle</p>
            <p>Los Gatos, CA 95032</p>
            <p>Email: <a href="mailto:copyright@notflix.com">copyright@notflix.com</a></p>
          </div>
        </div>

        <div className="legal-section">
          <h2>Patent Notices</h2>
          <p>One or more patents owned by Notflix apply to the Notflix service and to the features and services accessible via the Notflix service. Portions of the Notflix service operate under license of one or more patents.</p>
        </div>

        <div className="legal-section">
          <h2>Third-Party Content</h2>
          <p>Notflix makes available content licensed from third parties. All such content is the property of the respective third parties and is protected by applicable copyright and other intellectual property laws. Notflix does not grant any licenses to third-party intellectual property rights.</p>
        </div>

        <div className="legal-section">
          <h2>Governing Law</h2>
          <p>These Legal Notices shall be governed by and construed in accordance with the laws of the United States and the State of California, without regard to conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located in Santa Clara County, California.</p>
        </div>

        <div className="legal-section">
          <h2>Changes to Legal Notices</h2>
          <p>Notflix reserves the right to modify these Legal Notices at any time. We will notify users of any material changes by posting the new Legal Notices on this page.</p>
          <p className="last-updated">Last Updated: November 20, 2025</p>
        </div>

        <div className="legal-section">
          <h2>Contact Information</h2>
          <p>If you have any questions about these Legal Notices, please contact us at:</p>
          <div className="contact-box">
            <p><strong>Legal Department</strong></p>
            <p>Notflix, Inc.</p>
            <p>100 Winchester Circle</p>
            <p>Los Gatos, CA 95032</p>
            <p>Email: <a href="mailto:legal@notflix.com">legal@notflix.com</a></p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LegalNotices;
