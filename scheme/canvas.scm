(define (canvas--eval command . rest)
  (jseval-msg "canvas" (append (list command) rest)))

(define (canvas-click x y)
  '(x y))

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
  (canvas-call 'clearRect -10000 -10000 20000 20000))
