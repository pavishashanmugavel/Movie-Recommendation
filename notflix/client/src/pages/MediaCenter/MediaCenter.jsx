import React from 'react'
import { useNavigate } from 'react-router-dom'
import './MediaCenter.css'
import back_arrow_icon from '../../assets/back_arrow_icon.png'

const MediaCenter = () => {
  const navigate = useNavigate()

  const handleBackClick = () => {
    navigate(-1)
  }

  return (
    <div className='media-center-page'>
      <div className='back-button' onClick={handleBackClick}>
        <img src={back_arrow_icon} alt="Back" />
        <span>Back</span>
      </div>
      
      <div className='content-container'>
        <h1>Media Center</h1>
        
        <div className='content-section'>
          <h2>Press Releases</h2>
          <p>Stay updated with the latest news and announcements from Netflix.</p>
          <div className='press-release'>
            <h3>Netflix Announces New Original Series</h3>
            <p className='date'>December 2024</p>
            <p>Netflix continues to expand its original content library with exciting new series and films.</p>
          </div>
        </div>

        <div className='content-section'>
          <h2>Media Resources</h2>
          <p>Access high-resolution images, logos, and other media assets for press use.</p>
          <div className='resource-grid'>
            <div className='resource-item'>
              <h4>Logo Assets</h4>
              <p>Official Netflix logos and branding materials</p>
            </div>
            <div className='resource-item'>
              <h4>Press Photos</h4>
              <p>High-resolution images for media use</p>
            </div>
            <div className='resource-item'>
              <h4>Video Content</h4>
              <p>Official trailers and promotional videos</p>
            </div>
          </div>
        </div>

        <div className='content-section'>
          <h2>Contact Information</h2>
          <p>For media inquiries, please contact our press team:</p>
          <div className='contact-info'>
            <p><strong>Email:</strong> press@netflix.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediaCenter
