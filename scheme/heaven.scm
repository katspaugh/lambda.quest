;; Inspired by Paradise from Hundred Rabbits
;; https://100r.co/site/paradise.html

;; Helpers

(define (heaven-make name) (cons name (make-table)))

(define heaven (cons (heaven-make 'heaven) '()))

(define heaven-me 'ghost)

(define (heaven-current) (cdr (car heaven)))

(define (heaven-contents) (map car (table->list (heaven-current))))

(define (heaven-find name)
  (table-ref (heaven-current) name))


;; Commands

;; Create a vessel
(define (heaven-create name)
  (table-set! (heaven-current) name (heaven-make name)))

;; Enter a vessel
(define (heaven-enter name)
  (set! heaven (cons (heaven-find name) heaven)))

;; Leave a vessel
(define (heaven-leave)
  (set! heaven (cdr heaven)))

;; Become a vessel
(define (heaven-become name)
  (set! heaven-me name)
  (if (not (heaven-find name))
      (heaven-create name)))


;; Rendering

(define (heaven-log line-offset . rest)
  (canvas-setFont "70px serif")
  (canvas-fillText (apply string-append rest) 30 (* 150 line-offset))
  (canvas-sleep 1))

(define (heaven-log-all)
  (canvas-clear)
  (canvas-sleep 0.5)

  (let ((who (symbol->string heaven-me))
        (where (symbol->string (car (car heaven)))))
    (heaven-log 1 "You are a " who " in a " where ".")

    (if (eq? '() (heaven-contents))
        (heaven-log 2 "You see nothing.")
        (let ((count 0))
          (heaven-log 2 "You see:")
          (map
           (lambda (x)
             (set! count (+ 1 count))
             (heaven-log
              (+ 2 (* count 0.7))
              " · " (symbol->string x)))
           (heaven-contents))))
    (canvas-sleep 2)))


;; Let's begin

;; 1. Intro
(heaven-log 1 "Hello.")
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
(heaven-log 5 "You're now free.")


;; You can now interact with the REPL
;; E.g. type:
;; (heaven-become 'human)
;; (heaven-log-all)
