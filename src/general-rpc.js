import { gambitWorker } from './terminal.js'

let timeouts = []

export const reset = () => {
  // Reset setTimeout callbacks
  gambitWorker().postMessage(`(set! timeout--callbacks '())\r\n`)

  // Clear timeoutes
  timeouts.forEach(id => clearTimeout(id))
  timeouts = []
}

gambitWorker().addEventListener('message', (e) => {
  if (!Array.isArray(e.data) || e.data[0] !== 'setTimeout') return

  const schemeExpr = e.data[1]
  const delayMs = e.data[2]

  timeouts.push(
    setTimeout(() => {
      gambitWorker().postMessage(`(${schemeExpr})\r\n`)
    }, delayMs)
  )
})
