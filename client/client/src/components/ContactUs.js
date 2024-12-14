import React from 'react';
import '../styles/ContactUs.css';

function ContactUs() {
  return (
    <div className="contact-us">
      <h2>Contact Us</h2>
      <div className="contact-info">
        <div className="contact-card">
          <i className="fas fa-phone"></i>
          <h3>Emergency Hotline</h3>
          <p>24/7 Available</p>
          <a href="tel:1-800-HOSPIADMIN">1-800-HOSPIADMIN</a>
        </div>

        <div className="contact-card">
          <i className="fas fa-envelope"></i>
          <h3>Email Support</h3>
          <p>Response within 24 hours</p>
          <a href="mailto:support@hospiadmin.com">support@hospiadmin.com</a>
        </div>

        <div className="contact-card">
          <i className="fas fa-location-dot"></i>
          <h3>Location</h3>
          <p>123 Healthcare Avenue</p>
          <p>Medical District, City</p>
          <p>Country, ZIP</p>
        </div>
      </div>

      <div className="contact-form">
        <h3>Send us a Message</h3>
        <form>
          <div className="form-group">
            <label>Name:</label>
            <input type="text" required />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input type="email" required />
          </div>

          <div className="form-group">
            <label>Subject:</label>
            <input type="text" required />
          </div>

          <div className="form-group">
            <label>Message:</label>
            <textarea rows="5" required></textarea>
          </div>

          <button type="submit" className="submit-button">Send Message</button>
        </form>
      </div>
    </div>
  );
}

export default ContactUs;
