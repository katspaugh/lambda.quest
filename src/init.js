import { gambitWorker, initTerminal } from './terminal.js'
import { initEditor, autocompleteLibs, sessionRestore, sessionSave, setContent } from './editor.js'
import { drawReset } from './canvas.js'
import { clearUrlGistId, getUrlGistId } from './url.js'
import { initGistSaving } from './init-user-menu.js'
import { readGist } from './gists.js'
import { restartAudio } from './webaudio-rpc.js'
import './canvas-rpc.js'

const gambitEval = (code) => {
  gambitWorker().postMessage(code + '\r\n')
}

const onEditorChange = (content) => {
  drawReset()
  restartAudio()
  gambitEval(content)
}

const getSavedGist = async () => {
  const gistId = getUrlGistId()
  if (!gistId) {
    throw Error('No gist id')
  }
  try {
    return await readGist(gistId)
  } catch (err) {
    console.log('Error reading gist:', err.message)
    clearUrlGistId()
    throw err
  }
}

initTerminal()
initGistSaving()

// Preload Scheme libs
Promise.all(
  [
    fetch('./scheme/_helpers.scm'),
    fetch('./scheme/canvas.scm'),
    fetch('./scheme/web-audio.scm'),
  ].map(x => x.then(resp => resp.text()))
)
  .then(([ helpersCode, canvasCode, audioCode ]) => {
    const allCode = helpersCode + canvasCode + audioCode
    initEditor(onEditorChange)
    gambitEval(allCode)
    autocompleteLibs(allCode)
  })

// Load a gist, restore code after refresh, or load the default demo code
if (getUrlGistId() || !sessionRestore()) {
  getSavedGist()
    .catch(() => fetch('./scheme/heaven.scm').then(resp => resp.text()))
    .then(code => {
      setContent(code)
    })
}

window.addEventListener('unload', () => {
  if (!getUrlGistId()) {
    sessionSave()
  }
})




