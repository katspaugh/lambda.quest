(define (canvas-eval code)
  (jseval (string-append "postMessage([`" code "`])")))

(define (canvas-stringify val)
  (if (string? val) (string-append "\"" val "\"") ;; @FIXME: escape double quotes
      (if (number? val) (number->string val)
          (symbol->string val))))

(define (canvas-call method . rest)
  (canvas-eval (string-append
           "draw(ctx => ctx."
           (symbol->string method)
           "("
           (apply string-append
                  (map
                   (lambda (x) (string-append (canvas-stringify x) ", "))
                   rest))
           "))")))

(define (canvas-set prop value)
  (canvas-eval (string-append "draw(ctx => ctx." (symbol->string prop) " = " (canvas-stringify value) ")")))

(define (canvas-sleep seconds)
  (canvas-eval (string-append "drawSleep(" (number->string seconds) ")")))

(define (canvas-loop)
  (canvas-eval "drawStartLoop()"))

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
  (canvas-call 'clearRect 0 0 1000000 1000000))
