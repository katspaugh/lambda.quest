import { gambitWorker, initTerminal } from './terminal.js'
import { initEditor, sessionRestore, sessionSave, setContent } from './editor.js'
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
    fetch('./scheme/canvas.scm'),
    fetch('./scheme/web-audio.scm')
  ].map(x => x.then(resp => resp.text()))
)
  .then(([ canvasCode, audioCode ]) => {
    gambitEval(canvasCode + audioCode)
    initEditor(canvasCode + audioCode, onEditorChange)
  })

// Load a gist, restore code after refresh, or load the default demo code
if (getUrlGistId()) {
  getSavedGist()
    .catch(() => fetch('./scheme/heaven.scm').then(resp => resp.text()))
    .then(code => {
      setContent(code)
    })
} else {
  sessionRestore()
}

window.addEventListener('unload', () => {
  if (!getUrlGistId()) {
    sessionSave()
  }
})




