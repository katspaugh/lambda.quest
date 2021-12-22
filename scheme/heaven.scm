;; Inspired by Paradise from Hundred Rabbits
;; https://100r.co/site/paradise.html

(define (heaven-make name) (cons name (make-table)))

(define heaven (cons (heaven-make 'heaven) '()))

(define heaven-me 'ghost)

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
  (set! heaven-me name)
  (if (not (heaven-find name))
      (heaven-create name)))


;; Display code
(canvas-setFont "70px serif")

(define (heaven-log text line-offset)
  (canvas-fillText text 30 (* 150 line-offset))
  (canvas-sleep 1))

(define (heaven-log-all)
  (canvas-clear)
  (canvas-sleep 0.5)
  (heaven-log
   (string-append
    "You are a "
    (symbol->string heaven-me)
    " in a "
    (symbol->string (car (car heaven)))
    ".")
   1)

  (if (eq? '() (heaven-contents))
      (heaven-log "You see nothing." 2)
      (let ((count 0))
        (heaven-log "You see:" 2)
        (map
         (lambda (x)
           (set! count (+ 1 count))
           (heaven-log
            (string-append " · " (symbol->string x))
            (+ 2 (* count 0.7))))
         (heaven-contents))))
  (canvas-sleep 2))


;; Let's begin

;; 1. Intro
(heaven-log "Hello." 1)
(canvas-sleep 2)
(heaven-log-all)

;; 2. Create a ship
(heaven-create 'ship)
(heaven-log-all)

;; 3. Enter the ship and create things therein
(heaven-enter 'ship)
(heaven-create 'table)
(heaven-create 'computer)
(heaven-log-all)

;; 4. Become a program and enter the computer
(heaven-become 'program)
(heaven-enter 'computer)
(heaven-log-all)

;; 5. Leave the computer
(heaven-leave)
(heaven-log-all)
(heaven-log "You are now free." 5)
(canvas-sleep 10)
(canvas-clear)

