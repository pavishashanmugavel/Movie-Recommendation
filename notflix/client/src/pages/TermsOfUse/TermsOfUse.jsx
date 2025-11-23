import React from 'react';
import '../LegalNotices/LegalNotices.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const TermsOfUse = () => {
  return (
    <div className="terms-page">
      <Navbar />
      
      <div className="page-container">
        <div className="page-header">
          <h1>Terms of Use</h1>
          <p className="subtitle">Please read these terms carefully before using Notflix</p>
        </div>

        <div className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Notflix, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </div>

        <div className="terms-section">
          <h2>2. Notflix Service</h2>
          <p>The Notflix service and any content accessed through the service are for your personal and non-commercial use only and may not be shared with individuals beyond your household.</p>
          <h3>2.1 Membership</h3>
          <p>Your Notflix membership will continue until terminated. To use the Notflix service you must have Internet access and a Notflix ready device, and provide us with one or more Payment Methods.</p>
          <h3>2.2 Promotional Offers</h3>
          <p>We may from time to time offer special promotional offers, plans or memberships. Promotional offers may have additional terms and conditions that will be disclosed to you.</p>
        </div>

        <div className="terms-section">
          <h2>3. Billing and Cancellation</h2>
          <h3>3.1 Billing Cycle</h3>
          <p>The membership fee for the Notflix service and any other charges you may incur in connection with your use of the service, such as taxes and possible transaction fees, will be charged to your Payment Method on the specific payment date indicated on your account page.</p>
          <h3>3.2 Payment Methods</h3>
          <p>You can find information on the available payment methods on our website. You must provide us with a current, valid, accepted method of payment. We reserve the right to change our pricing and available payment methods at any time.</p>
          <h3>3.3 Cancellation</h3>
          <p>You can cancel your Notflix membership at any time, and you will continue to have access to the Notflix service through the end of your billing period.</p>
        </div>

        <div className="terms-section">
          <h2>4. Notflix Service</h2>
          <h3>4.1 Service Limitations</h3>
          <p>You agree to use the Notflix service, including all features and functionalities associated therewith, in accordance with all applicable laws, rules and regulations.</p>
          <h3>4.2 Account Restrictions</h3>
          <p>You may not use the Notflix service for any purpose or in any manner that is unlawful or prohibited by these Terms of Use. You may not use the Notflix service if you are not at least 18 years of age.</p>
          <h3>4.3 Content Quality</h3>
          <p>The quality of the display of the streaming content may vary from device to device, and may be affected by a variety of factors, such as your location, the bandwidth available through and/or speed of your Internet connection.</p>
        </div>

        <div className="terms-section">
          <h2>5. Passwords and Account Access</h2>
          <p>You are responsible for maintaining the confidentiality of your account information and password and for restricting access to your computer or device.</p>
          <p>You agree to accept responsibility for all activities that occur under your account or password. You should take all necessary steps to ensure that the password is kept confidential and secure.</p>
        </div>

        <div className="terms-section">
          <h2>6. Disclaimers of Warranties and Limitations on Liability</h2>
          <p>THE NOTFLIX SERVICE AND ALL CONTENT AND SOFTWARE ASSOCIATED THEREWITH, OR ANY OTHER FEATURES OR FUNCTIONALITIES ASSOCIATED WITH THE NOTFLIX SERVICE, ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND.</p>
          <div className="highlight-box">
            <p><strong>Important:</strong> NOTFLIX DOES NOT GUARANTEE, REPRESENT, OR WARRANT THAT YOUR USE OF THE NOTFLIX SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.</p>
          </div>
        </div>

        <div className="terms-section">
          <h2>7. Governing Law</h2>
          <p>These Terms of Use shall be governed by and construed in accordance with the laws of the United States and the State of California. You agree to submit to the personal and exclusive jurisdiction of the courts located in Santa Clara County, California.</p>
        </div>

        <div className="terms-section">
          <h2>8. Unsolicited Materials</h2>
          <p>Notflix does not accept unsolicited materials or ideas for Notflix content, and is not responsible for the similarity of any of its content or programming in any media to materials or ideas transmitted to Notflix.</p>
        </div>

        <div className="terms-section">
          <h2>9. Customer Support</h2>
          <p>For more information about our service and its features or if you need assistance with your account, please visit the Notflix Help Center. In certain instances, Customer Service may best be able to assist you by using a remote access support tool through which we have full access to your computer.</p>
        </div>

        <div className="terms-section">
          <h2>10. Changes to Terms of Use</h2>
          <p>Notflix may, from time to time, change these Terms of Use. We will notify you at least 30 days before these new Terms of Use apply to you.</p>
          <p className="last-updated">Last Updated: November 20, 2025</p>
        </div>

        <div className="terms-section">
          <h2>Contact Us</h2>
          <p>If you have any questions concerning our Terms of Use, please contact us at:</p>
          <div className="contact-box">
            <p><strong>Customer Support</strong></p>
            <p>Notflix, Inc.</p>
            <p>100 Winchester Circle</p>
            <p>Los Gatos, CA 95032</p>
            <p>Email: <a href="mailto:support@notflix.com">support@notflix.com</a></p>
            <p>Phone: 1-800-NOTFLIX</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
