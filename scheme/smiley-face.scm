(define π 3.141592653589793)

(define (canvas-circle x y radius)
  (canvas-arc x y radius 0 (* π 2) 'true))

(define (draw-smiley-face)
  (canvas-beginPath)
  (canvas-moveTo 65 65)
  (canvas-circle 60 65 5) ; Left eye
  (canvas-fill)
  (canvas-sleep 0.3)
  (canvas-moveTo 95 65)
  (canvas-circle 90 65 5) ; Right eye
  (canvas-fill)
  (canvas-sleep 0.3)
  (canvas-moveTo 125 75)
  (canvas-circle 75 75 50) ; Outer circle
  (canvas-stroke)
  (canvas-sleep 0.3)
  (canvas-moveTo 110 75)
  (canvas-arc 75 75 35 0 π 'false) ; Mouth (clockwise)
  (canvas-closePath)
  (canvas-stroke))

(canvas-loop) ; start an animation loop
(canvas-clear)
(draw-smiley-face)
(canvas-sleep 1)
