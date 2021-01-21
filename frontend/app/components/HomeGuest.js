import React, { useEffect, useContext } from 'react'
import Page from './Page'
import { useImmerReducer } from 'use-immer'
import Axios from 'axios'
import { CSSTransition } from 'react-transition-group'

import DispatchContext from '../DispatchContext'

export default function HomeGuest() {
  const appDispatch = useContext(DispatchContext)

  const initialState = {
    username: {
      value: '',
      hasErrors: false,
      message: '',
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: '',
      hasErrors: false,
      message: '',
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: '',
      hasErrors: false,
      message: ''
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'usernameImmediately':
        draft.username.hasErrors = false
        draft.username.value = action.value
        //Validation
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.message =
            'Username não pode ser maior que 30 caracteres'
        }
        // Only numbers and chars alowed
        if (
          draft.username.value &&
          !/^([a-zA-Z0-9]+)$/.test(draft.username.value)
        ) {
          draft.username.hasErrors = true
          draft.username.message = 'Username só pode conter letras e números.'
        }
        return
      case 'usernameAfterDelay':
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.message = 'Username deve ter ao menos 3 caracteres.'
        }
        if (!draft.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        return
      case 'usernameUniqueResults':
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = 'Esse Username não está dispónivel.'
        } else {
          draft.username.isUnique = true
        }
        return
      case 'emailImmediately':
        draft.email.hasErrors = false
        draft.email.value = action.value
        return
      case 'emailAfterDelay':
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = 'Você deve usar um email válido.'
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++
        }
        return
      case 'emailUniqueResults':
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.message = 'Esse email já está em uso.'
        } else {
          draft.email.isUnique = true
        }
        return
      case 'passwordImmediately':
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.message = 'Senha não deve exceder 50 caracteres.'
        }
        return
      case 'passwordAfterDelay':
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true
          draft.password.message = 'Senha deve ter ao menos 12 caracteres.'
        }
        return
      case 'submitForm':
        if (
          !draft.username.hasErrors &&
          draft.username.isUnique &&
          !draft.email.hasErrors &&
          draft.email.isUnique &&
          !draft.password.hasErrors
        ) {
          draft.submitCount++
        }
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(
        () => dispatch({ type: 'usernameAfterDelay' }),
        800
      )

      return () => {
        clearTimeout(delay)
      }
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: 'emailAfterDelay' }), 800)

      return () => {
        clearTimeout(delay)
      }
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(
        () => dispatch({ type: 'passwordAfterDelay' }),
        800
      )

      return () => {
        clearTimeout(delay)
      }
    }
  }, [state.password.value])

  useEffect(() => {
    if (state.username.checkCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResoults() {
        try {
          const response = await Axios.post(
            '/doesUsernameExist',
            { username: state.username.value },
            { cancelToken: ourRequest.token }
          )
          dispatch({ type: 'usernameUniqueResults', value: response.data })
        } catch (e) {
          console.log('There was a problems or the request was cancelled.')
        }
      }
      fetchResoults()
      return () => ourRequest.cancel()
    }
  }, [state.username.checkCount])

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResoults() {
        try {
          const response = await Axios.post(
            '/register',
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value
            },
            { cancelToken: ourRequest.token }
          )
          appDispatch({ type: 'login', data: response.data })
          appDispatch({
            type: 'flashMessage',
            value: 'Bem vindo!'
          })
        } catch (e) {
          console.log('There was a problems or the request was cancelled.')
        }
      }
      fetchResoults()
      return () => ourRequest.cancel()
    }
  }, [state.submitCount])

  async function handleSubmit(e) {
    e.preventDefault()
  }

  useEffect(() => {
    if (state.email.checkCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResoults() {
        try {
          const response = await Axios.post(
            '/doesEmailExist',
            { email: state.email.value },
            { cancelToken: ourRequest.token }
          )
          dispatch({ type: 'emailUniqueResults', value: response.data })
        } catch (e) {
          console.log('There was a problems or the request was cancelled.')
        }
      }
      fetchResoults()
      return () => ourRequest.cancel()
    }
  }, [state.email.checkCount])

  async function handleSubmit(e) {
    e.preventDefault()

    dispatch({ type: 'usernameImmediately', value: state.username.value })
    dispatch({
      type: 'usernameAfterDelay',
      value: state.username.value,
      noRequest: true
    })
    dispatch({ type: 'emailImmediately', value: state.email.value })
    dispatch({
      type: 'emailAfterDelay',
      value: state.email.value,
      noRequest: true
    })
    dispatch({ type: 'passwordImmediately', value: state.password.value })
    dispatch({ type: 'passwordAfterDelay', value: state.password.value })
    dispatch({ type: 'submitForm' })
  }

  return (
    <Page title='Welcome' wide={true}>
      <div className='row align-items-center'>
        <div className='col-lg-7 py-3 py-md-5'>
          <h1 className='display-3'>Vamos Escrever!</h1>
          <p className='lead text-muted'>
            Você está cansado de 280 caracteres? Vamos escrever sobre coisas
            interessantes como nos velhos bons tempos da internet.
          </p>
        </div>
        <div className='col-lg-5 pl-lg-5 pb-3 py-lg-5'>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label htmlFor='username-register' className='text-muted mb-1'>
                <small>Username</small>
              </label>
              <input
                id='username-register'
                name='username'
                className='form-control'
                type='text'
                placeholder='Pick a username'
                autoComplete='off'
                onChange={(e) =>
                  dispatch({
                    type: 'usernameImmediately',
                    value: e.target.value
                  })
                }
              />
              <CSSTransition
                in={state.username.hasErrors}
                timeout={330}
                classNames='liveValidateMessage'
                unmountOnExit
              >
                <div className='alert alert-danger small liveValidateMessage'>
                  {state.username.message}
                </div>
              </CSSTransition>
            </div>
            <div className='form-group'>
              <label htmlFor='email-register' className='text-muted mb-1'>
                <small>Email</small>
              </label>
              <input
                id='email-register'
                name='email'
                className='form-control'
                type='text'
                placeholder='you@example.com'
                autoComplete='off'
                onChange={(e) =>
                  dispatch({ type: 'emailImmediately', value: e.target.value })
                }
              />
              <CSSTransition
                in={state.email.hasErrors}
                timeout={330}
                classNames='liveValidateMessage'
                unmountOnExit
              >
                <div className='alert alert-danger small liveValidateMessage'>
                  {state.email.message}
                </div>
              </CSSTransition>
            </div>
            <div className='form-group'>
              <label htmlFor='password-register' className='text-muted mb-1'>
                <small>Password</small>
              </label>
              <input
                id='password-register'
                name='password'
                className='form-control'
                type='password'
                placeholder='Create a password'
                onChange={(e) =>
                  dispatch({
                    type: 'passwordImmediately',
                    value: e.target.value
                  })
                }
              />
              <CSSTransition
                in={state.password.hasErrors}
                timeout={330}
                classNames='liveValidateMessage'
                unmountOnExit
              >
                <div className='alert alert-danger small liveValidateMessage'>
                  {state.password.message}
                </div>
              </CSSTransition>
            </div>
            <button
              type='submit'
              className='py-3 mt-4 btn btn-lg btn-success btn-block'
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}
