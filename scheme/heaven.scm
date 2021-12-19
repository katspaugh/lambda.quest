;; Inspired by Paradise from Hundred Rabbits
;; https://100r.co/site/paradise.html

(define (heaven-make name) (cons name (make-table)))

(define heaven (cons (heaven-make 'heaven) '()))

(define heaven-my-name 'ghost)

(define (heaven-current) (cdr (car heaven)))

(define (heaven-contents) (map car (table->list (heaven-current))))

(define (heaven-create name)
  (table-set! (heaven-current) name (heaven-make name)))

(define (heaven-find name)
  (table-ref (heaven-current) name))

(define (heaven-enter name)
  (set! heaven (cons (heaven-find name) heaven)))

(define (heaven-leave)
  (set! heaven (cdr heaven)))

(define (heaven-become name)
  (set! heaven-my-name name)
  (if (not (heaven-find name))
      (heaven-create name)))


;; You are a ghost in heaven
(heaven-create 'ship)
(heaven-enter 'ship)
(heaven-create 'table)
(heaven-create 'computer)
(heaven-enter 'computer)
(heaven-become 'program)
(heaven-leave)


;; Display code
(canvas-clear)
(canvas-setFont "70px serif")

(canvas-fillText
 (string-append
  "You are a "
  (symbol->string heaven-my-name)
  " in a "
  (symbol->string (car (car heaven)))
  ".")
 30 100)

(if (eq? '() (heaven-contents))
    (canvas-fillText "You see nothing." 30 250)
    (let ((count 0))
      (canvas-fillText "You see:" 30 250)
      (map
       (lambda (x)
         (set! count (+ 1 count))
         (canvas-fillText
          (string-append " · " (symbol->string x))
          30 (+ 280 (* 80 count))))
       (heaven-contents))))
