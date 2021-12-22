const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const queue = []
const timeouts = []
let requestId

const drawQueue = () => {
  console.log('Drawing the queue of %d calls', queue.length)
  return queue.reduce((prev, next) => prev.then(next), Promise.resolve())
}

export const drawLoop = () => {
  requestId = window.requestAnimationFrame(() => {
    drawQueue().then(drawLoop)
  })
}

export const drawReset = () => {
  console.log('Clearing the draw queue')
  cancelAnimationFrame(requestId)
  timeouts.forEach(id => clearTimeout(id))
  timeouts.length = 0
  queue.length = 0
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawLoop()
}

// Functions callable from Scheme
window._ctx = ctx

window._draw = (callback) => {
  queue.push(() => Promise.resolve(callback(ctx)))
}

window._drawSleep = (seconds) => {
  queue.push(() => new Promise(resolve => {
    timeouts.push(setTimeout(resolve, seconds * 1000))
  }))
}

window._drawReset = drawReset
