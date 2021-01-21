import React, { useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'
import Axios from 'axios'

import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import Post from './Post'

import StateContext from '../StateContext'

export default function Home() {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true,
    feed: []
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post(
          '/getHomeFeed',
          {
            token: appState.user.token
          },
          { cancelToken: ourRequest.token }
        )
        setState((draft) => {
          draft.isLoading = false
          draft.feed = response.data
        })
      } catch (e) {
        console.log('there was a problems fetching profile data.')
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }, [])

  if (state.isLoading) {
    return <LoadingDotsIcon />
  }

  return (
    <Page title='Seu Feed'>
      {state.feed.length > 0 && (
        <>
          <h2 className='text-center mb-4'>Novidades no seu feed</h2>
          <div className='list-group mb-4'>
            {state.feed.map((post) => {
              return <Post post={post} key={post._id} />
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className='text-center'>
            Olá! <strong>{appState.user.username}</strong>, seu feed está vazio.
          </h2>
          <p className='lead text-muted text-center'>
            Seu feed exibe os ultimo posts dos seus amigos. Se você não segue
            niguem tudo bem, você pode buscar post escritos por pessoas com
            intresses parecidos com os seus e, então, segui-los.
          </p>
        </>
      )}
    </Page>
  )
}
;('')
