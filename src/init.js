import { gambitWorker, initTerminal } from './terminal.js'
import { initEditor, autocompleteLibs, sessionRestore, sessionSave, setContent, getContent } from './editor.js'
import { drawReset } from './canvas.js'
import { clearUrlGistId, getUrlGistId } from './url.js'
import { initGistSaving } from './init-user-menu.js'
import { readGist } from './gists.js'
import { restartAudio } from './webaudio-rpc.js'
import './canvas-rpc.js'

const gambitEval = (code) => {
  gambitWorker().postMessage(code)
}

const onSetContent = () => {
  drawReset()
  restartAudio()
  gambitEval(getContent())
}

const onEditorEval = (sexp) => {
  gambitEval(sexp)
}

const getSavedGist = async () => {
  const gistId = getUrlGistId()
  if (!gistId) {
    throw new Error('No gist id')
  }
  try {
    return await readGist(gistId)
  } catch (err) {
    console.log('Error reading gist:', err.message)
    clearUrlGistId()
    throw err
  }
}

const onFirstMessage = (e) => {
  if (!(typeof e.data === 'string' && e.data.startsWith('Gambit v4.9.4'))) return

  gambitWorker().removeEventListener('message', onFirstMessage)

  Promise.all(
    [
      './scheme/_helpers.scm',
      './scheme/canvas.scm',
      './scheme/web-audio.scm',
    ].map(url => fetch(url).then(resp => resp.text()))
  )
    .then(([ helpersCode, canvasCode, audioCode ]) => {
      const allLibs = helpersCode + canvasCode + audioCode
      autocompleteLibs(allLibs)
      gambitEval(allLibs)
    })

  // Load a gist, restore code after refresh, or load the default demo code
  if (getUrlGistId() || !sessionRestore()) {
    getSavedGist()
      .catch(() => fetch('./scheme/heaven.scm').then(resp => resp.text()))
      .then(setContent)
  }
}

gambitWorker().addEventListener('message', onFirstMessage)

window.addEventListener('unload', () => {
  if (!getUrlGistId()) {
    sessionSave()
  }
})

initTerminal()
initEditor(onEditorEval, onSetContent)
initGistSaving()




