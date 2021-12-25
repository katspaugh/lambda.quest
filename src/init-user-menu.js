import { h, render } from 'https://unpkg.com/htm/preact/index.mjs?module'
import { useState, useEffect } from 'https://unpkg.com/preact/hooks/dist/hooks.mjs?module'
import htm from 'https://unpkg.com/htm?module'
import { createGist, updateGist, readGist, getUser, getAllGists } from './gists.js'
import { isAuthed, logout, tryLogin } from './github-auth.js'
import { getContent, setContent } from './editor.js'

// Initialize htm with Preact
const html = htm.bind(h)
let alert = console.log

const setUrlGistId = (id) => {
  const path = `${location.pathname}?gist=${id}`
  history.pushState({}, '', path)
}

const getUrlGistId = () => {
  return new URL(location.href).searchParams.get('gist')
}

export const getSavedGist = async () => {
  const gistId = getUrlGistId()
  if (!gistId) {
    throw new Error('No gist id')
  }
  try {
    return await readGist(gistId)
  } catch (err) {
    console.log('Error reading gist:', err.message)
    //history.pushState({}, '', location.pathname)
    throw err
  }
}

const onSaveClick = (onDone) => {
  const currentCode = getContent()

  createGist(currentCode)
    .then(data => {
      setUrlGistId(data.id)
      onDone(data.id)
      alert(`Gist created`)
    }).catch(err => {
      console.log('Error creating gist:', err.message)
      alert(err.info ? err.info.message : err.message)
    })
}

const onUpdateClick = () => {
  const currentCode = getContent()
  const savedId = getUrlGistId()

  updateGist(savedId, currentCode)
    .then(data => {
      alert(`Gist updated`)
    }).catch(err => {
      console.log('Error updating gist:', err.message)
      alert(err.info ? err.info.message : err.message)
    })
}

const onCreateClick = () => {
  if (!confirm('Leave the page without saving?')) return

  const currentCode = ';; New gist'

  createGist(currentCode)
    .then(data => {
      setUrlGistId(data.id)
      location.reload()
    }).catch(err => {
      console.log('Error creating gist:', err.message)
      alert(err.info ? err.info.message : err.message)
    })
}

const Link = (props) => {
  return html`
    <a onClick=${props.onClick}>${props.text}</a>
  `
}

const UserInfo = ({ name, avatar }) => {
  return !name ? null : html`
    <span class="user-info">
      <img src=${avatar} alt=${name} />
      ${name}
    </span>
  `
}

const UserGists = ({ gists }) => {
  const gistName = (gist, index) => {
    return `${index + 1}. ${Object.keys(gist.files)[0]}`
  }

  const onChange = (e) => {
    const index = e.target.value
    const gistItem = gists[index]

    if (gistItem) {
      if (!confirm('Load the gist without saving the code?')) return
      setUrlGistId(gistItem.id)
      location.reload()
    }
  }

  return !gists ? null : html`
    <span class="user-gists">
      <select onChange=${onChange}>
        <option value=${-1}>Load gist</option>
        <option disabled>─</option>
        ${gists.map((gist, index) => html`
          <option value=${index}>${gistName(gist, index)}</option>
        `)}
      </select>
    </span>
  `
}

const Alert = (props) => {
  return html`
    <div class="alert" onClick=${props.onClick}>${props.text}</div>
  `
}

const Menu = () => {
  const [userInfo, setUserInfo] = useState({})
  const [gists, setGists] = useState([])
  const [authed, setAuthed] = useState(false)
  const [gistId, setGistId] = useState(getUrlGistId() || '')
  const [alertText, setAlertText] = useState('')

  alert = setAlertText

  const doLogout = () => {
    logout()
    setUserInfo({})
    setAuthed(false)
  }

  const onClick = (callback) => ((e) => {
    e.preventDefault()
    callback(setGistId)
  })

  useEffect(() => {
    const onLogin = () => {
      getAllGists()
        .then(setGists)
        .catch((err) => {
          console.log('Error fetching user gists:', err.message)
        })

      getUser()
        .then(data => {
          setUserInfo(data)
          setAuthed(true)
        })
        .catch((err) => {
          console.log('Error fetching user data:', err.message)
          // Token probably expired
          if (err.code === 401) {
            doLogout()
          }
        })
    }

    if (isAuthed()) {
      onLogin()
    } else {
      tryLogin(() => {
        onLogin()
        // Login was initiated by onSaveClick
        onSaveClick(setGistId)
      })
    }
  }, [setUserInfo, setGists, setAuthed])

  const actionLinks = authed && gistId ? html`
    <${Link} text="Create new gist" onClick=${onClick(onCreateClick)} />
    <${Link} text="Update gist" onClick=${onClick(onUpdateClick)} />
  ` : html`
    <${Link} text="Save as gist" onClick=${onClick(onSaveClick)} />
  `

  const logoutLink = authed ? html`
    <${Link} text="Log out" onClick=${onClick(doLogout)} />
  ` : null

  const notification = alertText ? html`
    <${Alert} text=${alertText} onClick=${() => setAlertText('')} />
  ` : null

  return html`
    <div>
      <${UserInfo} name=${userInfo.login} avatar=${userInfo.avatar_url} />
      ${logoutLink}
    </div>

    <div>
      <${UserGists} gists=${gists} />
      ${actionLinks}
      ${notification}
    </div>
  `
}

export const initGistSaving = () => {
  render(
    html`<${Menu} />`,
    document.getElementById('menu')
  )
}
