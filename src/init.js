(() => {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  window.canvasCtx = ctx

  const textarea = document.getElementById('code')

  fetch('./scheme/canvas.scm').then(resp => resp.text()).then(code => {
    textarea.value = code
    gambitEval(code)
  })

  let debounce
  textarea.addEventListener('input', () => {
    if (debounce) clearTimeout(debounce)

    debounce = setTimeout(() => {
      const { value } = textarea
      const openParens = value.match(/[(]/g) || []
      const closeParens = value.match(/[)]/g) || []
      if (openParens.length === closeParens.length) {
        gambitEval(value)
      }
    }, 300)
  })
})()
