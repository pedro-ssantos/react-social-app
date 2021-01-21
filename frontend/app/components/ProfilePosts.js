import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Axios from 'axios'

import LoadingDotsIcon from './LoadingDotsIcon'
import Post from './Post'

export default function ProfilePosts(props) {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const { username } = useParams()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
          cancelToken: ourRequest.token
        })
        setIsLoading(false)
        setPosts(response.data)
      } catch (e) {
        console.log('There was a error fectching data from users posts')
      }
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className='list-group'>
      {posts.map((post) => (
        <Post post={post} key={post._id} noAuthor={true} />
      ))}
    </div>
  )
}
