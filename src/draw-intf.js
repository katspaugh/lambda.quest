import { gambitWorker } from './terminal.js'
import { draw, drawSleep, drawStartLoop } from './canvas.js'

gambitWorker().addEventListener('message', (e) => {
  if (Array.isArray(e.data)) {
    //console.log(e.data)
    eval('"use strict";' + e.data[0])
  }
})
