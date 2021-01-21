import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import HeaderLoggedOut from './HeaderLoggedOut'
import HeaderLoggedIn from './HeaderLoggedIn'
import StateContext from '../StateContext'
import ProfilePosts from './ProfilePosts'

export default function Header(props) {
  const appState = useContext(StateContext)
  const HeaderContent = appState.loggedIn ? (
    <HeaderLoggedIn />
  ) : (
    <HeaderLoggedOut />
  )

  return (
    <header className='header-bar bg-primary mb-3'>
      <div className='container d-flex flex-column flex-md-row align-items-center p-3'>
        <h4 className='my-0 mr-md-auto font-weight-normal'>
          <Link to='/' className='text-white'>
            SocialApp!
          </Link>
        </h4>
        {!props.staticEmpty ? HeaderContent : ''}
      </div>
    </header>
  )
}
