import { gambitWorker } from './terminal.js'

let nodes = {}

const isBreakout = (obj) => {
  return obj === window
    || obj === document
    || obj instanceof HTMLElement
    || obj instanceof Node
}

export const restartAudio = () => {
  // Kill the previous audio
  if (nodes.id_0) {
    nodes.id_0.close()
    nodes = {}
  }
}

const OPS = {
  call: 'call',
  get: 'get',
  set: 'set'
}

gambitWorker().addEventListener('message', (e) => {
  if (!Array.isArray(e.data) || e.data[0] !== 'audio') return

  if (!nodes.id_0) {
    try {
      nodes.id_0 = new AudioContext()
    } catch (err) {
      console.log('Error creating a Web Audio context', err)
      return
    }
  }

  const op = e.data[1]
  const callId = e.data[2]
  const returnId = e.data[3]
  const path = e.data[4]
  const rest = e.data.slice(5).map(arg => {
    if (typeof arg === 'string' && arg.startsWith('id_')) {
      return nodes[arg]
    }
    return arg
  })

  const obj = nodes[callId]
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
    nodes[returnId] = result
  }
})

// Activate WebAudio on click
document.addEventListener('click', () => {
  const ctx = nodes.id_0
  if (ctx && ctx.state === 'suspended') {
    try {
      ctx.resume()
    } catch (err) {
      console.log('Error resuming Web Audio', err)
    }
  }
}, { once: true })
