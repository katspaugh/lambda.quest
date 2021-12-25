import { gambitWorker, initTerminal } from './terminal.js'
import { initEditor, setContent } from './editor.js'
import { drawReset } from './canvas.js'
import { initGistSaving, getSavedGist } from './init-user-menu.js'
import './canvas-rpc.js'

const gambitEval = (code) => {
  gambitWorker().postMessage(code + '\r\n')
}

const onEditorChange = (content) => {
  drawReset()
  gambitEval(content)
}

initTerminal()
initGistSaving()

// Preload the Canvas lib
fetch('./scheme/canvas.scm')
  .then(resp => resp.text())
  .then(canvasCode => {
    gambitEval(canvasCode)
    initEditor(canvasCode, onEditorChange)
  })

// Load a gist or the default demo code
getSavedGist()
  .catch(() => fetch('./scheme/heaven.scm').then(resp => resp.text()))
  .then(code => {
    setContent(code)
  })


