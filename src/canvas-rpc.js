import { gambitWorker } from './terminal.js'
import { getCtx, addOnClick } from './canvas.js'

gambitWorker().addEventListener('message', (e) => {
  if (!Array.isArray(e.data) || e.data[0] !== 'canvas') return

  const command = e.data[1]
  const prop = e.data[2]
  const rest = e.data.slice(3)
  const ctx = getCtx()

  switch (command) {
      case 'call':
        ctx[prop](...rest)
        break
      case 'set':
        ctx[prop] = rest[0]
        break
      case 'onclick':
        addOnClick((x, y) => {
          gambitWorker().postMessage(`(${prop} ${x} ${y})`)
        })
        break
  }
})
