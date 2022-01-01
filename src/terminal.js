let worker

export const initTerminal = () => {
  //const terminalDiv = document.querySelector('#terminal')

  worker.addEventListener('message', (e) => {
    console.info(e.data)

    // const div = document.createElement('div')
    // div.textContent = e.data
    // terminalDiv.appendChild(div)
  })
}

export const gambitWorker = () => {
  if (!worker) {
    worker = new Worker('./src/worker.js')
  }
  return worker
}
