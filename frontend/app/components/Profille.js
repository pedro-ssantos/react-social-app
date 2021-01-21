import React, { useEffect, useContext } from 'react'
import { useParams, NavLink, Switch, Route } from 'react-router-dom'
import Axios from 'axios'
import { useImmer } from 'use-immer'

import Page from './Page'
import StateContext from '../StateContext'
import ProfilePosts from './ProfilePosts'
import ProfileFollowers from './ProfileFollowers'
import ProfileFollowing from './ProfileFollowing'

export default function Profille() {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    profileData: {
      profileUsername: '...',
      profileAvatar: 'https://gravatar.com/avatar/placeholder?=128',
      isFollowing: false,
      counts: {
        postCount: '',
        followerCount: '',
        followingCount: ''
      }
    },
    fallowAciotionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token
          },
          { cancelToken: ourRequest.token }
        )
        setState((draft) => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log('there was a problems fetching profile data.')
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.fallowAciotionLoading = true
      })

      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token
            },
            { cancelToken: ourRequest.token }
          )
          setState((draft) => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.fallowAciotionLoading = false
          })
        } catch (e) {
          console.log('there was a problems fetching profile data.')
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.fallowAciotionLoading = true
      })

      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token
            },
            { cancelToken: ourRequest.token }
          )
          setState((draft) => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.fallowAciotionLoading = false
          })
        } catch (e) {
          console.log('there was a problems fetching profile data.')
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title='Profille Screen'>
      <h2>
        <img className='avatar-small' src={state.profileData.profileAvatar} />{' '}
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button
              className='btn btn-primary btn-sm ml-2'
              onClick={startFollowing}
              disabled={state.fallowAciotionLoading}
            >
              Seguir <i className='fas fa-user-plus'></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button
              className='btn btn-danger btn-sm ml-2'
              onClick={stopFollowing}
              disabled={state.fallowAciotionLoading}
            >
              Parar de seguir <i className='fas fa-user-times'></i>
            </button>
          )}
      </h2>

      <div className='profile-nav nav nav-tabs pt-2 mb-4'>
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className='nav-item nav-link'
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className='nav-item nav-link'
        >
          Seguidores: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className='nav-item nav-link'
        >
          Seguindo: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Switch>
        <Route exact path='/profile/:username'>
          <ProfilePosts />
        </Route>
        <Route path='/profile/:username/followers'>
          <ProfileFollowers />
        </Route>
        <Route path='/profile/:username/following'>
          <ProfileFollowing />
        </Route>
      </Switch>
    </Page>
  )
}
