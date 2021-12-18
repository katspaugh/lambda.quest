(define PI (string->number (jseval "Math.PI")))

(define (canvas-call method . rest)
  (jseval (string-append
           "canvasCtx."
           (symbol->string method)
           "("
           (apply string-append (map
                                 (lambda (x)
                                   (string-append
                                    (if (number? x) (number->string x) (symbol->string x))
                                    ", "))
                                 rest))
           ")")))

(define (canvas-beginPath)
  (canvas-call 'beginPath))

(define (canvas-moveTo x y)
  (canvas-call 'moveTo x y))

(define (canvas-lineTo x y)
  (canvas-call 'lineTo x y))

(define (canvas-arc x y radius start-angle end-angle ccw?)
  (canvas-call 'arc x y radius start-angle end-angle ccw?))

(define (canvas-fill)
  (canvas-call 'fill))

(define (canvas-stroke)
  (canvas-call 'stroke))

(define (canvas-clear)
  (canvas-call 'clearRect 0 0
               (string->number (jseval "canvasCtx.canvas.width"))
               (string->number (jseval "canvasCtx.canvas.height"))))


;; Example drawing
(canvas-clear)
(canvas-beginPath)
(canvas-arc 75 75 50 0 (* PI 2) 'true) ; Outer circle
(canvas-moveTo 110 75)
(canvas-arc 75 75 35 0 PI 'false) ; Mouth (clockwise)
(canvas-moveTo 65 65)
(canvas-arc 60 65 5 0 (* PI 2) 'true) ; Left eye
(canvas-moveTo 95 65)
(canvas-arc 90 65 5 0 (* PI 2) 'true) ; Right eye
(canvas-stroke)
