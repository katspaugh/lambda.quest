import { createGist, updateGist, readGist, getUser } from './gists.js'
import { isAuthed, logout, tryLogin } from './github-auth.js'

const addGistQuery = (id) => {
  const path = `${location.pathname}?gist=${id}`
  history.pushState({}, '', path)
}

const getUrlGistId = () => {
  return new URL(location.href).searchParams.get('gist')
}

const onLogin = () => {
  const userInfo = document.getElementById('user-info')
  return getUser().then(data => {
    userInfo.textContent = data.login
    const img = document.createElement('img')
    img.src = data.avatar_url
    userInfo.prepend(img)
  }).catch(err => {
    console.log('Error fetching user info:', err.message)

    if (err.code === 401) {
      console.log(err.info)
      logout(false)
      throw err
    }
  })
}

export const getSavedGist = async () => {
  const gistId = getUrlGistId()
  if (!gistId) {
    throw Error('No gist id')
  }
  try {
    return await readGist(gistId)
  } catch (err) {
    console.log('Error reading gist, redirecting to /')
    history.pushState({}, '', location.pathname)
    throw err
  }
}

export const initGistSaving = (editState) => {
  const saveButton = document.getElementById('save-gist')
  const updateButton = document.getElementById('update-gist')
  const createButton = document.getElementById('create-gist')

  saveButton.addEventListener('click', (e) => {
    e.preventDefault()

    const currentCode = editState.value

    createGist(currentCode)
      .then(data => {
        addGistQuery(data.id)
        alert(`Gist saved at ${data.html_url}`)
      }).catch(err => {
        console.log('Error creating gist:', err.message)
        alert(err.info ? err.info.message : err.message)
      })
  })

  updateButton.addEventListener('click', (e) => {
    e.preventDefault()

    const currentCode = editState.value
    const savedId = getUrlGistId()

    updateGist(savedId, currentCode)
      .then(data => {
        addGistQuery(data.id)
        alert(`Gist created at ${data.html_url}`)
      }).catch(err => {
        console.log('Error updating gist:', err.message)
        alert(err.info ? err.info.message : err.message)
      })
  })

  createButton.addEventListener('click', (e) => {
    e.preventDefault()

    const currentCode = ';; New gist'

    createGist(currentCode)
      .then(data => {
        addGistQuery(data.id)
        location.reload()
      }).catch(err => {
        console.log('Error creating gist:', err.message)
        alert(err.info ? err.info.message : err.message)
      })
  })

  if (isAuthed() && getUrlGistId()) {
    saveButton.style.display = 'none'
  } else {
    createButton.style.display = 'none'
    updateButton.style.display = 'none'
  }
  saveButton.parentElement.style.display = 'block'

  // Display user name and avatar
  if (isAuthed()) {
    onLogin().catch(() => tryLogin(onLogin))
  } else {
    tryLogin(onLogin)
  }
}
