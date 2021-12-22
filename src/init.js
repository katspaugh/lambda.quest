import { initEditor } from './editor.js'
import { drawReset } from './canvas.js'

const evalAndDraw = (code) => {
  drawReset()
  _gambitEval(code)
}

Promise.all([
  fetch('./scheme/canvas.scm').then(resp => resp.text()),
  fetch('./scheme/heaven.scm').then(resp => resp.text())
]).then(([ canvasCode, demoCode ]) => {
  evalAndDraw(canvasCode + demoCode)
  initEditor(canvasCode, demoCode, evalAndDraw)
})
