import { gambitWorker } from './terminal.js'

let objects = {}
const queue = []
const timeouts = []
let requestId
let looping = false

const runQueue = () => {
  return queue.reduce((prev, next) => prev.then(next), Promise.resolve())
}

const addToQueue = (callback) => {
  return queue.push(() => callback().then(() => !looping && queue.shift()))
}

const scheduleCall = (callback) => {
  addToQueue(() => new Promise(resolve => {
    callback()
    resolve()
  }))
}

const scheduleSleep = (seconds) => {
  addToQueue(() => new Promise(resolve => {
    timeouts.push(setTimeout(resolve, seconds * 1000))
  }))
}

const frameLoop = () => {
  requestId = window.requestAnimationFrame(() => {
    runQueue().then(frameLoop)
  })
}

const isBreakout = (obj) => {
  return obj === window
    || obj === document
    || obj instanceof HTMLElement
}

export const restartAudio = async () => {
  // Kill the previous audio
  if (objects.id_0) {
    await objects.id_0.close()
    objects = {}
  }

  cancelAnimationFrame(requestId)
  timeouts.forEach(id => clearTimeout(id))
  timeouts.length = 0
  queue.length = 0
  looping = false
  frameLoop()
}

const OPS = {
  call: 'call',
  get: 'get',
  set: 'set',
  sleep: 'sleep',
  loop: 'loop'
}

gambitWorker().addEventListener('message', (e) => {
  if (!Array.isArray(e.data) || e.data[0] !== 'audio') {
    return
  }

  if (!objects.id_0) {
    objects = { id_0: new (window.AudioContext || window.webkitAudioContext)() }
  }

  const op = e.data[1]

  if (op === OPS.sleep) {
    scheduleSleep(e.data[2])
    return
  }

  if (op === OPS.loop) {
    scheduleCall(() => looping = !!e.data[2])
    return
  }

  scheduleCall(() => {
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
})

// Activate WebAudio on click
document.addEventListener('click', () => {
  const ctx = objects.id_0
  if (ctx && ctx.state === 'suspended') {
    ctx.resume()
  }
}, { once: true })
