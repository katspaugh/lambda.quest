import { gambitWorker } from './terminal.js'
import { draw, drawSleep, drawStartLoop } from './canvas.js'

gambitWorker().addEventListener('message', (e) => {
  if (Array.isArray(e.data) && e.data[0] === 'canvas') {
    const command = e.data[1]
    const arg1 = e.data[2]
    const rest = e.data.slice(3)

    switch (command) {
        case 'ctx-call':
          draw(ctx => ctx[arg1](...rest))
          break
        case 'ctx-set':
          draw(ctx => ctx[arg1] = rest[0])
          break
        case 'sleep':
          drawSleep(arg1)
          break
        case 'loop':
          drawStartLoop()
          break
    }
  }
})
