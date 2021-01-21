import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link, withRouter } from 'react-router-dom'
import Axios from 'axios'
import ReactMarkdown from 'react-markdown'
import ReactTooltip from 'react-tooltip'

import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import NotFound from './NotFound'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'

function ViewSinglePost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()
  const { id } = useParams()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: ourRequest.token
        })
        setPost(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log(e)
        console.log('There was a error fectching data from users posts')
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
  }, [id])

  if (!isLoading && !post) {
    return <NotFound />
  }

  if (isLoading)
    return (
      <Page title='Loading...'>
        <LoadingDotsIcon />
      </Page>
    )

  const date = new Date(post.createdDate)
  const dateFormatted = `${
    date.getMonth() + 1
  }/ ${date.getDay()}/${date.getFullYear()}`

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username
    }
    return false
  }

  async function deleteHandler() {
    const areYouSure = window.confirm('Realmente deseja deletar esse post?')
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token }
        })
        if (response.data == 'Success') {
          // 1/. Display a flash message
          appDispatch({
            type: 'flashMessage',
            value: 'Post foi deletado'
          })
          // 2. redirect back to post
          props.history.push(`/profile/${appState.user.username}`)
        }
      } catch (e) {
        console.log('There was a problem,')
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className='d-flex justify-content-between'>
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className='pt-2'>
            <Link
              to={`/post/${post._id}/edit`}
              data-tip='Edit'
              data-for='edit'
              className='text-primary mr-2'
            >
              <i className='fas fa-edit'></i>
            </Link>
            <ReactTooltip id='edit' className='custon-tooltip' />
            <a
              className='delete-post-button text-danger'
              data-tip='Delete'
              data-for='delete'
              onClick={deleteHandler}
            >
              <i className='fas fa-trash'></i>
            </a>
            <ReactTooltip id='delete' className='custon-tooltip' />{' '}
          </span>
        )}
      </div>

      <p className='text-muted small mb-4'>
        <Link to={`/profile/${post.author.username}`}>
          <img className='avatar-tiny' src={post.author.avatar} />
        </Link>
        Posted por{' '}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{' '}
        {dateFormatted}
      </p>

      <div className='body-content'>
        <ReactMarkdown
          source={post.body}
          allowedTypes={[
            'paragraph',
            'strong',
            'emphasis',
            'text',
            'heading',
            'list',
            'listItem'
          ]}
        />
      </div>
    </Page>
  )
}

export default withRouter(ViewSinglePost)
