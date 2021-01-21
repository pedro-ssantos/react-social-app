import React, { useState, useEffect, useContext } from 'react'
import { useImmerReducer } from 'use-immer'
import { useParams, Link, withRouter } from 'react-router-dom'
import Axios from 'axios'

import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import NotFound from './NotFound'

function EditPost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const originalState = {
    title: {
      value: '',
      hasErrors: false,
      message: ''
    },
    body: {
      value: '',
      hasErrors: false,
      message: ''
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case 'titleChange':
        draft.title.value = action.value
        draft.title.hasErrors = false
        return
      case 'bodyChange':
        draft.body.value = action.value
        draft.body.hasErrors = false
        return
      case 'submitRequest':
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        return
      case 'saveRequestStarted':
        draft.isSaving = true
        return
      case 'saveRequestFinished':
        draft.isSaving = false
        return
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = 'Você deve dar um titulo'
        }
        return
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = 'Você deve escrever um conteúdo pra post.'
        }
        return
      case 'notFound':
        draft.notFound = true
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: 'titleRules', value: state.title.value })
    dispatch({ type: 'boodyRules', value: state.body.value })
    dispatch({ type: 'submitRequest' })
  }

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' })
      const ourRequest = Axios.CancelToken.source()

      async function fetchPost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token
            },
            {
              cancelToken: ourRequest.token
            }
          )
          dispatch({ type: 'saveRequestFinished' })
          appDispatch({ type: 'flashMessage', value: 'Post foi atualizado.' })
        } catch (e) {
          console.log(e)
          console.log('There was a error fectching data from users posts')
        }
      }
      fetchPost()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.sendCount])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: ourRequest.token
        })
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data })
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: 'flashMessage',
              value: 'Você não tem permissão para editar esse Post.'
            })
            props.history.push('/')
          }
        } else {
          dispatch({ type: 'notFound' })
        }
      } catch (e) {
        console.log(e)
        console.log('There was a error fectching data from users posts')
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
  }, [])

  if (state.notFound) {
    return <NotFound />
  }

  if (state.isFetching)
    return (
      <Page title='Loading...'>
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title='Edit Post'>
      <Link className='small font-wieght-bold' to={`/post/${state.id}`}>
        &laquo; Voltar para post
      </Link>

      <form onSubmit={submitHandler} className='mt-3'>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input
            autoFocus
            name='title'
            id='post-title'
            className='form-control form-control-lg form-control-title'
            type='text'
            placeholder=''
            autoComplete='off'
            value={state.title.value}
            onChange={(e) =>
              dispatch({ type: 'titleChange', value: e.target.value })
            }
            onBlur={(e) =>
              dispatch({ type: 'titleRules', value: e.target.value })
            }
          />
          {state.title.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>
              {state.title.message}
            </div>
          )}
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Post conteúdo</small>
          </label>
          <textarea
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
            type='text'
            value={state.body.value}
            onChange={(e) =>
              dispatch({ type: 'bodyChange', value: e.target.value })
            }
            onBlur={(e) =>
              dispatch({ type: 'bodyRules', value: e.target.value })
            }
          />
          {state.body.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>
              {state.body.message}
            </div>
          )}
        </div>

        <button className='btn btn-primary' disabled={state.isSaving}>
          Salvar mudanças
        </button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
