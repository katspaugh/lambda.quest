export const initTerminal = () => {
  const terminal = new Terminal({
    cols: 120,
    rows: 10
  })
  const worker = gambitWorker()

  terminal.open(document.getElementById('terminal'))

  terminal.onKey((e) => {
    worker.postMessage(e.key)
  })

  worker.addEventListener('message', (e) => {
    if (!Array.isArray(e.data)) {
      terminal.write(e.data)

      if (e.data === '\r\n') {
        terminal.scrollToBottom()
      }
    }
  })

  terminal.write('# Loading the Scheme interpreter...')

  return terminal
}

let worker
export const gambitWorker = () => {
  if (!worker) {
    worker = new Worker('./lib/gsi.js')
  }
  return worker
}
