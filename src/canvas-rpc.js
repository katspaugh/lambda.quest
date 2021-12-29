import { gambitWorker } from './terminal.js'
import { draw, drawSleep, drawStartLoop, drawOnClick } from './canvas.js'

gambitWorker().addEventListener('message', (e) => {
  if (!Array.isArray(e.data) || e.data[0] !== 'canvas') {
    return
  }

  const command = e.data[1]
  const arg1 = e.data[2]
  const rest = e.data.slice(3)

  switch (command) {
      case 'call':
        draw(ctx => ctx[arg1](...rest))
        break
      case 'set':
        draw(ctx => ctx[arg1] = rest[0])
        break
      case 'sleep':
        drawSleep(arg1)
        break
      case 'loop':
        drawStartLoop()
        break
  }
})

drawOnClick((mouseX, mouseY) => {
  const scale = 2 // canvas is downscaled 2x
  const x = mouseX * scale
  const y = mouseY * scale
  gambitWorker().postMessage(`(canvas-click ${x} ${y})` + '\r\n')
})
