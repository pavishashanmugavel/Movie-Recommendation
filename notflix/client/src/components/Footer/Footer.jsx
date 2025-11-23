import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Footer.css'
import youtube_icon from '../../assets/youtube_icon.png'
import twitter_icon from '../../assets/twitter_icon.png'
import instagram_icon from '../../assets/instagram_icon.png'
import facebook_icon from '../../assets/facebook_icon.png'

const Footer = () => {
  const navigate = useNavigate()

  const handleLinkClick = (path) => {
    navigate(path)
  }

  return (
    <div className='footer'>
      <div className="footer-icons">
        <img src={facebook_icon} alt="" />
        <img src={instagram_icon} alt="" />
        <img src={twitter_icon} alt="" />
        <img src={youtube_icon} alt="" />
      </div>
      <ul>
        <li onClick={() => handleLinkClick('/media-center')}>Media Centre</li>
        <li onClick={() => handleLinkClick('/legal-notices')}>Legal Notices</li>
        <li onClick={() => handleLinkClick('/terms-of-use')}>Terms of Use</li>
        <li onClick={() => handleLinkClick('/privacy')}>Privacy</li>
        <li onClick={() => handleLinkClick('/about-us')}>About Us</li>
      </ul>
      <p className='copyright-text'>© 1997-2023 Netflix, Inc.</p>
    </div>
  )
}

export default Footer