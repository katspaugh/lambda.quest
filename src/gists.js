import { auth } from './github-auth.js'

const BASE_API_URL = 'https://api.github.com'
const GISTS_API_URL = `${BASE_API_URL}/gists`
const USER_API_URL = `${BASE_API_URL}/user`
const FILE_NAME = 'lambda-quest.scm'

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
        [FILE_NAME]: { content }
      }
    })
  })
}

export const updateGist = (id, content) => {
  const token = auth()

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
        [FILE_NAME]: { content }
      }
    })
  })
}

export const readGist = (id) => {
  return fetchJson(`${GISTS_API_URL}/${id}`, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache'
  })
    .then(data => data.files[FILE_NAME].content)
}
