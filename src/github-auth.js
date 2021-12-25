/**
 * Code by Gregor Martynus
 * @see https://workers.cloudflare.com/built-with/projects/github-oauth-login
 */

import { getContent, setContent } from './editor.js'

const AUTH_URL = 'https://worker.lambda.quest/'
const TOKEN_KEY = 'LQ_githubToken'
const EDITOR_KEY = 'LQ_editorContent'

let token = localStorage.getItem(TOKEN_KEY)

export const isAuthed = () => {
  return !!token
}

export const auth = () => {
  if (!token) {
    // Save the editor state before redirecting
    sessionStorage.setItem(EDITOR_KEY, getContent())

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
  const code = new URL(location.href).searchParams.get('code')
  if (code) {
    const path = location.pathname + location.search.replace(/\bcode=\w+/, '').replace(/\?$/, '')
    history.pushState({}, '', path)
    login(code, onLogin)

    // Restore the editor state
    const state = sessionStorage.getItem(EDITOR_KEY)
    if (state != null) setContent(state)
    sessionStorage.removeItem(EDITOR_KEY)
  }
}
