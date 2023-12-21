import React, { useContext, useEffect } from 'react'
// import PropTypes from 'prop-types'
import useLocalStorage from './LocalStorage'

const AUTH_TOKEN = 'auth_token'
const TokenContext = React.createContext()
const TokenConsumer = TokenContext.Consumer
const TokenProvider = props => {
  const [token, setToken] = useLocalStorage(AUTH_TOKEN)
  console.log('TokenProvider', token)
  const values = { token, setToken }
  return (
    <TokenContext.Provider value={values}>
      {props.children}
    </TokenContext.Provider>
  )
}
const useToken = () => {
  const context = useContext(TokenContext)
  if (context === undefined) {
    throw new Error('useToken must be used within an TokenProvider')
  }
  return context
}
export { TokenProvider, TokenConsumer, useToken }
