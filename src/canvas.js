import { gambitWorker } from './terminal.js'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

ctx.save()

const queue = []
const timeouts = []
let looping = false
let requestId

const drawQueue = () => {
  return queue.reduce((prev, next) => prev.then(next), Promise.resolve())
}

const drawQueueAdd = (callback) => {
  return queue.push(() => callback().then(() => !looping && queue.shift()))
}

export const draw = (callback) => {
  drawQueueAdd(() => new Promise(resolve => {
    callback(ctx)
    resolve()
  }))
}

export const drawSleep = (seconds) => {
  drawQueueAdd(() => new Promise(resolve => {
    timeouts.push(setTimeout(resolve, seconds * 1000))
  }))
}

export const drawStartLoop = () => {
  draw(() => looping = true)
}

const drawLoop = () => {
  requestId = window.requestAnimationFrame(() => {
    drawQueue().then(drawLoop)
  })
}

export const drawReset = () => {
  ctx.restore()
  cancelAnimationFrame(requestId)
  timeouts.forEach(id => clearTimeout(id))
  timeouts.length = 0
  queue.length = 0
  looping = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  gambitWorker().postMessage('(set! canvas-click (lambda (x y) (void)))\r\n')
  drawLoop()
}

export const drawOnClick = (callback) => {
  canvas.addEventListener('click', (e) => {
    callback(e.offsetX, e.offsetY)
  })
}
