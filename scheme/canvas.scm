(define (canvas-call method . rest)
  (jseval (string-append
           "_draw(ctx => ctx."
           (symbol->string method)
           "("
           (apply string-append (map
                                 (lambda (x)
                                   (string-append
                                    (if (number? x) (number->string x) (symbol->string x))
                                    ", "))
                                 rest))
           "))")))

(define (canvas-beginPath)
  (canvas-call 'beginPath))

(define (canvas-closePath)
  (canvas-call 'closePath))

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
               (string->number (jseval "_ctx.canvas.width"))
               (string->number (jseval "_ctx.canvas.height"))))

(define (canvas-sleep seconds)
  (jseval (string-append "_drawSleep(" (number->string seconds) ")")))
