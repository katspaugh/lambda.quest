import { gambitWorker, initTerminal } from './terminal.js'
import { initEditor, setContent } from './editor.js'
import { drawReset } from './canvas.js'
import { initGistSaving, getSavedGist } from './init-user-menu.js'
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

// Load a gist or the default demo code
getSavedGist()
  .catch(() => fetch('./scheme/heaven.scm').then(resp => resp.text()))
  .then(code => {
    setContent(code)
  })


