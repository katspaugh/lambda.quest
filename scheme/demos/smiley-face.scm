;; Draw a smiley face on click

(define (canvas-circle x y radius)
  (canvas-arc x y radius 0 (* \Math.PI 2) #t))

(define (draw-smiley-face x y)
  (canvas-call 'restore)
  (canvas-call 'save)
  (canvas-clear)
  (canvas-call 'translate (- x 30) (- y 30))
  (canvas-beginPath)
  (canvas-moveTo 65 65)
  (canvas-circle 60 65 5) ; Left eye
  (canvas-fill)
  (canvas-moveTo 95 65)
  (canvas-circle 90 65 5) ; Right eye
  (canvas-fill)
  (canvas-moveTo 125 75)
  (canvas-circle 75 75 50) ; Outer circle
  (canvas-stroke)
  (canvas-moveTo 110 75)
  (canvas-arc 75 75 35 0 \Math.PI #f) ; Mouth (clockwise)
  (canvas-closePath)
  (canvas-stroke))

(draw-smiley-face 400 400)

(canvas-onclick 'draw-smiley-face)
