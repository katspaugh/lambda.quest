(define (canvas-stringify val)
  (if (string? val) (string-append "'" val "'")
      (if (number? val) (number->string val)
          (symbol->string val))))

(define (canvas-call method . rest)
  (jseval (string-append
           "_draw(ctx => ctx."
           (symbol->string method)
           "("
           (apply string-append
                  (map
                   (lambda (x) (string-append (canvas-stringify x) ", "))
                   rest))
           "))")))

(define (canvas-get prop)
  (jseval (string-append "_ctx." (symbol->string prop))))

(define (canvas-set prop value)
  (jseval (string-append "_draw(ctx => ctx." (symbol->string prop) " = " (canvas-stringify value) ")")))

(define (canvas-sleep seconds)
  (jseval (string-append "_drawSleep(" (number->string seconds) ")")))

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

(define (canvas-setFillStyle value)
  (canvas-set 'fillStyle value))

(define (canvas-setFont font)
  (canvas-set 'font font))

(define (canvas-fillText text x y)
  (canvas-call 'fillText text x y))

(define (canvas-clear)
  (canvas-call 'clearRect 0 0
               (string->number (canvas-get 'canvas.width))
               (string->number (canvas-get 'canvas.height))))
