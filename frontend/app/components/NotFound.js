import React from 'react'
import { Link } from 'react-router-dom'

import Page from './Page'

export default function NotFound() {
  return (
    <Page title='Not Found'>
      <div className='text-center'>
        <h2>Whooop, não encontramos essa pagina.</h2>
        <p className='lead text-muted'>
          Você pode visitar <Link to='/'>homepage</Link> para novos posts.
        </p>
      </div>
    </Page>
  )
}
