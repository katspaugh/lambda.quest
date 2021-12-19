(() => {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')

  const stack = []

  const drawLoop = () => {
    stack.reduce((prev, next) => prev.then(next), Promise.resolve())
      .then(() => window.requestAnimationFrame(drawLoop))
  }

  window._draw = (callback) => {
    stack.push(() => Promise.resolve(callback(ctx)))
  }

  window._drawSleep = (seconds) => {
    stack.push(() => new Promise(resolve => {
      setTimeout(resolve, seconds * 1000)
    }))
  }

  window._drawCleanup = () => {
    stack.length = 0
  }

  window._ctx = ctx

  drawLoop()
})()
