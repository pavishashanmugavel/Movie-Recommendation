import React, { useEffect } from 'react'
import Home from './pages/Home/Home'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import AdminLogin from './pages/Login/AdminLogin'
import Player from './pages/Player/Player'
import Profile from './pages/Profile/Profile'
import MediaCentre from './pages/MediaCentre/MediaCentre'
import LegalNotices from './pages/LegalNotices/LegalNotices'
import TermsOfUse from './pages/TermsOfUse/TermsOfUse'
import Privacy from './pages/Privacy/Privacy'
import AboutUs from './pages/AboutUs/AboutUs'
import { auth } from './firebase'
import { AppProvider } from './context/AppContext'
import NotificationContainer from './components/NotificationContainer/NotificationContainer'

const App = () => {

  const navigate = useNavigate();

  useEffect(()=>{
    const unsubscribe = auth.onAuthStateChanged(async(user)=>{
      if(user){
        navigate('/')
      } else {
        navigate('/login')
      }
    })
    return unsubscribe
  },[])

  return (
    <AppProvider>
      <div>
        <NotificationContainer />
        <Routes>
          <Route path='/' element = {<Home />}/>
          <Route path='/login' element = {<Login />}/>
          <Route path='/admin/login' element = {<AdminLogin />}/>
          <Route path='/player/:id' element = {<Player />}/>
          <Route path='/profile' element = {<Profile />}/>
          <Route path='/media-center' element = {<MediaCentre />}/>
          <Route path='/legal-notices' element = {<LegalNotices />}/>
          <Route path='/terms-of-use' element = {<TermsOfUse />}/>
          <Route path='/privacy' element = {<Privacy />}/>
          <Route path='/about-us' element = {<AboutUs />}/>
        </Routes>
        
      </div>
    </AppProvider>
  )
}

export default App