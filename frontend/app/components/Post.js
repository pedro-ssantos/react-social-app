import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Post(props) {
  const { post, onClick } = props
  const date = new Date(post.createdDate)
  const dateFormattes = `${
    date.getMonth() + 1
  }/ ${date.getDay()}/${date.getFullYear()}`
  return (
    <Link
      to={`/post/${post._id}`}
      className='list-group-item list-group-item-action'
      onClick={onClick}
    >
      <img className='avatar-tiny' src={post.author.avatar} />{' '}
      <strong>{post.title}</strong>{' '}
      <span className='text-muted small'>
        {!props.noAuthor && (
          <>
            por {post.author.username} em {dateFormattes}{' '}
          </>
        )}
      </span>
    </Link>
  )
}
