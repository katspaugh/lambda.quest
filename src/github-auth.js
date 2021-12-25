/**
 * Code by Gregor Martynus
 * @see https://workers.cloudflare.com/built-with/projects/github-oauth-login
 */

const AUTH_URL = 'https://lambda-quest.katspaugh.workers.dev/' // 'https://worker.lambda.quest/'
const STORAGE_KEY = 'LQ_githubToken'

let token = localStorage.getItem(STORAGE_KEY)

export const isAuthed = () => {
  return !!token
}

export const auth = () => {
  if (!token) {
    location.href = AUTH_URL
    if (!token) throw Error('User not authenticated')
  }
  return token
}

export const logout = (reload = true) => {
  token = ''
  localStorage.removeItem(STORAGE_KEY)
  if (reload) location.reload()
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
    localStorage.setItem(STORAGE_KEY, token)

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
  }
}
