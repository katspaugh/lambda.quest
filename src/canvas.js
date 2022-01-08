const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
ctx.save()

const clickCallbacks = []

export const getCtx = () => ctx

export const drawReset = () => {
  ctx.restore()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  clickCallbacks.length = 0
}

export const addOnClick = (callback) => clickCallbacks.push(callback)

canvas.onclick = (e) => {
  const scale = canvas.width / canvas.clientWidth
  const x = Math.round(e.offsetX * scale)
  const y = Math.round(e.offsetY * scale)

  clickCallbacks.forEach(cb => cb(x, y))
}
