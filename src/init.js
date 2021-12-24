import { gambitWorker, initTerminal } from './terminal.js'
import { initEditor } from './editor.js'
import { drawReset } from './canvas.js'
import './draw-intf.js'

const gambitEval = (code) => {
  gambitWorker().postMessage(code + '\r\n')
}

const evalAndDraw = (code) => {
  drawReset()
  gambitEval(code)
}

initTerminal()

Promise.all([
  fetch('./scheme/canvas.scm').then(resp => resp.text()),
  fetch('./scheme/heaven.scm').then(resp => resp.text())
]).then(([ canvasCode, demoCode ]) => {
  evalAndDraw(canvasCode + demoCode)
  initEditor(canvasCode, demoCode, evalAndDraw)
})
