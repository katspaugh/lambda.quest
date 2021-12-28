/**
 * Code by Gregor Martynus
 * @see https://workers.cloudflare.com/built-with/projects/github-oauth-login
 */

import { sessionSave, sessionRestore } from './editor.js'
import { clearQueryParam, getQueryParam } from './url.js'

const AUTH_URL = 'https://worker.lambda.quest/'
const TOKEN_KEY = 'LQ_githubToken'
const CODE_PARAM = 'code'

let token = localStorage.getItem(TOKEN_KEY)

export const isAuthed = () => {
  return !!token
}

export const auth = () => {
  if (!token) {
    // Save the editor state before redirecting
    sessionSave()

    // Redirect to the auth worker
    location.href = AUTH_URL
  }
  return token
}

export const logout = () => {
  token = ''
  localStorage.removeItem(TOKEN_KEY)
}

const login = async (code, onLogin) => {
  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ code })
    })

    const result = await response.json()

    if (result.error) {
      alert(JSON.stringify(result, null, 2))
      return
    }

    token = result.token

    // save the token
    localStorage.setItem(TOKEN_KEY, token)

    onLogin()
  } catch (error) {
    alert(error.message)
    location.reload()
  }
}

export const tryLogin = (onLogin) => {
  const code = getQueryParam(CODE_PARAM)
  if (code) {
    clearQueryParam(CODE_PARAM)
    login(code, onLogin)

    // Restore the editor state
    sessionRestore()
  }
}
