import React, { useContext } from 'react'

import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import DispatchContext from '../DispatchContext'
import StateContext from '../StateContext'

export default function HeaderLoggedIn() {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  function handleLogout() {
    appDispatch({ type: 'logout' })
    appDispatch({
      type: 'flashMessage',
      value: 'Você está deslogado!'
    })
  }

  function handleSearchIcon(e) {
    e.preventDefault()
    appDispatch({ type: 'openSearch' })
  }

  return (
    <div className='flex-row my-3 my-md-0'>
      <a
        onClick={handleSearchIcon}
        href='#'
        className='text-white mr-2 header-search-icon'
        data-for='search'
        data-tip='Search'
      >
        <i className='fas fa-search'></i>
      </a>
      <ReactTooltip place='bottom' id='search' className='custom-tooltip' />{' '}
      <span
        onClick={() => appDispatch({ type: 'toogleChat' })}
        data-for='chat'
        data-tip='Chat'
        className={
          'mr-2 header-chat-icon ' +
          (appState.unreadChatCount ? 'text-danger' : 'text-white')
        }
      >
        <i className='fas fa-comment'></i>
        {appState.unreadChatCount ? (
          <span className='chat-count-badge text-white'>
            {appState.unreadChatCount < 10 ? appState.unreadChatCount : '9+'}
          </span>
        ) : (
          ''
        )}
      </span>
      <ReactTooltip place='bottom' id='chat' className='custom-tooltip' />{' '}
      <Link
        to={`/profile/${appState.user.username}`}
        className='mr-2'
        data-for='profile'
        data-tip='My profile'
      >
        <img className='small-header-avatar' src={appState.user.avatar} />
      </Link>
      <ReactTooltip place='bottom' id='profile' className='custom-tooltip' />{' '}
      <Link className='btn btn-sm btn-success mr-2' to='/create-post'>
        Criar Post
      </Link>{' '}
      <button onClick={handleLogout} className='btn btn-sm btn-secondary'>
        Sign Out
      </button>
    </div>
  )
}
