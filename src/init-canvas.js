(() => {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')

  const stack = []
  const timeouts = []
  let looping = false
  let requestId

  const drawStack = () => {
    return stack.reduce((prev, next) => prev.then(next), Promise.resolve())
  }

  const drawLoop = () => {
    requestId = window.requestAnimationFrame(() => {
      drawStack().then(() => {
        if (looping) drawLoop()
      })
    })
  }

  const drawStartLoop = () => {
    looping = true
    drawLoop()
  }

  window._draw = (callback) => {
    stack.push(() => Promise.resolve(callback(ctx)))
  }

  window._drawSleep = (seconds) => {
    stack.push(() => new Promise(resolve => {
      timeouts.push(setTimeout(resolve, seconds * 1000))
    }))
  }

  window._drawCleanup = () => {
    cancelAnimationFrame(requestId)
    timeouts.forEach(id => clearTimeout(id))
    timeouts.length = 0
    stack.length = 0
    looping = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  window._ctx = ctx
  window._drawLoop = drawLoop
  window._drawStartLoop = drawStartLoop
})()
