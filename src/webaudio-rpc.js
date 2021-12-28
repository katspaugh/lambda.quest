import { gambitWorker } from './terminal.js'

let objects = {}
let timeouts = []

const isBreakout = (obj) => {
  return obj === window
    || obj === document
    || obj instanceof HTMLElement
    || obj instanceof Node
}

export const restartAudio = async () => {
  // Reset setTimeout callbacks
  gambitWorker().postMessage(`(set! audio-callbacks '())\r\n`)

  // Clear timeoutes
  timeouts.forEach(id => clearTimeout(id))
  timeouts = []

  // Kill the previous audio
  if (objects.id_0) {
    await objects.id_0.close()
    objects = {}
  }
}

const OPS = {
  call: 'call',
  get: 'get',
  set: 'set',
  delay: 'delay'
}

gambitWorker().addEventListener('message', (e) => {
  if (!Array.isArray(e.data) || e.data[0] !== 'audio') {
    return
  }

  if (!objects.id_0) {
    try {
      objects = { id_0: new (window.AudioContext || window.webkitAudioContext)() }
    } catch (err) {
      console.log('Error creating a Web Audio context', err)
      return
    }
  }

  const op = e.data[1]

  if (op === OPS.delay) {
    const schemeExpr = e.data[2]
    const delayMs = e.data[3]

    timeouts.push(
      setTimeout(() => {
        gambitWorker().postMessage(`(${schemeExpr})` + '\r\n')
      }, delayMs)
    )

    return
  }

  const callId = e.data[2]
  const returnId = e.data[3]
  const path = e.data[4]
  const rest = e.data.slice(5).map(arg => {
    if (typeof arg === 'string' && arg.startsWith('id_')) {
      return objects[arg]
    }
    return arg
  })

  const obj = objects[callId]
  if (!obj) return

  let result

  if (op === OPS.get) {
    result = path != null ? obj[path] : obj
  } else if (op === OPS.call) {
    if (isBreakout(obj[path])) return
    result = obj[path](...rest)
  } else if (op === OPS.set) {
    obj[path] = rest[0]
  }

  if (result !== undefined && !isBreakout(result)) {
    objects[returnId] = result
  }
})

// Activate WebAudio on click
document.addEventListener('click', () => {
  const ctx = objects.id_0
  if (ctx && ctx.state === 'suspended') {
    try {
      ctx.resume()
    } catch (err) {
      console.log('Error resuming Web Audio', err)
    }
  }
}, { once: true })
