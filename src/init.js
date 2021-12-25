import { gambitWorker, initTerminal } from './terminal.js'
import { initEditor } from './editor.js'
import { drawReset } from './canvas.js'
import { initGistSaving, getSavedGist } from './init-gists.js'
import './canvas-rpc.js'

let editState = { value: '' }

const gambitEval = (code) => {
  gambitWorker().postMessage(code + '\r\n')
}

const evalAndDraw = (code) => {
  drawReset()
  gambitEval(code)
}

const onEditorChange = (content) => {
  evalAndDraw(content)
  editState.value = content
}

initTerminal()
initGistSaving(editState)

Promise.all([
  fetch('./scheme/canvas.scm').then(resp => resp.text()),
  getSavedGist().catch(() => fetch('./scheme/heaven.scm').then(resp => resp.text()))
]).then(([ canvasCode, demoCode ]) => {
  evalAndDraw(canvasCode + demoCode)
  editState.value = demoCode
  initEditor(canvasCode, demoCode, onEditorChange)
})
