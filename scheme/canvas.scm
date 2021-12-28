(define (canvas--stringify val)
  (if (string? val) (string-append "\"" val "\"")
      (if (number? val) (number->string val)
          (symbol->string val))))

(define (canvas--eval command . rest)
  (jseval (string-append
           "postMessage([ 'canvas', '" command "', "
           (apply string-append
                  (map
                   (lambda (x) (string-append (canvas--stringify x) ", "))
                   rest))
           "])"))
  (void))

(define (canvas-call method . rest)
  (apply canvas--eval (append (list "call" (symbol->string method)) rest)))

(define (canvas-set prop value)
  (canvas--eval "set" (symbol->string prop) value))

(define (canvas-sleep seconds)
  (canvas--eval "sleep" seconds))

(define (canvas-loop)
  (canvas--eval "loop"))

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
