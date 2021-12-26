import { auth } from './github-auth.js'

const BASE_API_URL = 'https://api.github.com'
const GISTS_API_URL = `${BASE_API_URL}/gists`
const USER_API_URL = `${BASE_API_URL}/user`

const fetchJson = (url, params) => {
  let ok, status

  return fetch(url, params)
    .then(resp => {
      ok = resp.ok
      status = resp.status
      return resp.json().catch(() => resp.text())
    })
    .then(data => {
      if (!ok) {
        const err = new Error(`${status}: ${JSON.stringify(data)}`)
        err.code = status
        err.info = data
        throw err
      }
      return data
    })
}

const getFileName = (content) => {
  const name = content
        .split('\n')[0].trim()
        .replace(/[^\w ]+/g, '')
        .slice(0, 30) || 'lambda-quest'
  return `${name}.scm`
}

export const getUser = async () => {
  const token = auth()

  const user = await fetchJson(USER_API_URL, {
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${token}`
    }
  })

  console.log('User data', user)

  return user
}

export const createGist = (content) => {
  const token = auth()
  const fileName = getFileName(content)

  return fetchJson(GISTS_API_URL, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${token}`
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      description: 'Lambda Quest snippet – https://lambda.quest',
      public: true,
      files: {
        [fileName]: { content }
      }
    })
  })
}

export const updateGist = (id, content) => {
  const token = auth()
  const fileName = getFileName(content)

  return fetchJson(`${GISTS_API_URL}/${id}`, {
    method: 'PATCH',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${token}`
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      description: `Lambda Quest snippet – https://lambda.quest?gist=${id}`,
      files: {
        [fileName]: { content }
      }
    })
  })
}

export const getAllGists = () => {
  const token = auth()

  return fetchJson(`${GISTS_API_URL}?per_page=100`, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${token}`
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  })
    .then(data => data.filter(d => Object.keys(d.files).some(key => key.endsWith('.scm'))))
}

export const readGist = (id) => {
  return fetchJson(`${GISTS_API_URL}/${id}`)
    .then(data => Object.values(data.files)[0].content)
}
