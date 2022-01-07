;; Piano roll

(load "https://lambda.quest/scheme/osc.scm")

;; Piano voice
(define piano-osc (osc-make 'sawtooth 220))
(define piano-osc-gain (osc-gain piano-osc))

;; Diatonic scale
(define osc-cents '(0 200 400 500 700 900 1100))

;; Convert a position in the piano roll to a note value in cents
(define (osc-key-to-cents key)
  (let ((note (modulo (inexact->exact (floor key)) 7)) (octave (floor (/ key 7))))
    (log "Key %d, Note %d, Octave %d" key note octave)
    (+
     (* octave 1200)
     (list-ref osc-cents note)
     (if (eq? (round key) key) 0 100))))

;; PLay the note at a given position
(define (osc-play-key key)
  (let ((cents (osc-key-to-cents key)))
    (osc-detune piano-osc cents)
    (osc-pluck piano-osc-gain 0.2 600)))

;; Handle clicks on the Canvas
(define osc-click-handlers '()) ;; List of callbacks
(set! canvas-click
      (lambda (x y)
        (map (lambda (callback) (callback x y)) osc-click-handlers) ;; call all the callbacks on each click
        (void)))

;; Check if a point X, Y intersects a rectangle
(define (osc-intersects x y left top width height)
  (and (>= x left) (<= x (+ left width)) (>= y top) (<= y (+ top height))))

;; Give visual feedback on key click
(define (osc-key-feedback left top w h fill)
  (canvas-set 'fillStyle "#ddd")
  (canvas-call 'fillRect (+ 10 left) (- (+ top h) 140) (- w 20) 130)
  (canvas-sleep 0.3)
  (canvas-set 'fillStyle fill)
  (canvas-call 'fillRect (+ 10 left) (- (+ top h) 140) (- w 20) 130)
  (canvas-call 'strokeRect left top w h))

;; Render a piano key and listen to clicks on it
(define (osc-draw-key offset fill step w h click-offset)
  (let ((left (+ (* offset step) (/ (- step w) 2))) (top 350))
    ;; Draw the key
    (canvas-set 'fillStyle fill)
    (canvas-call 'fillRect left top w h)
    (canvas-call 'strokeRect left top w h)

    ;; Assign a click handler
    (let ((onclick (lambda (x y)
                     (if (osc-intersects x y left (+ click-offset top) w h)
                         (begin
                           (osc-play-key offset) ;; play the note
                           (osc-key-feedback left top w h fill)))))) ;; visual feedback
      (set! osc-click-handlers (append osc-click-handlers (list onclick))))))

;; Draw a white key
(define (osc-white-key offset)
  (osc-draw-key offset "#fff" 72 72 300 140))

;; Draw a black key
(define (osc-black-key offset)
  (osc-draw-key offset "#000" 72 62 150 0))

;; Draw a piano octave
(define (osc-octave-keys offset)
  (osc-white-key (+ offset 0))
  (osc-white-key (+ offset 1))
  (osc-white-key (+ offset 2))
  (osc-white-key (+ offset 3))
  (osc-white-key (+ offset 4))
  (osc-white-key (+ offset 5))
  (osc-white-key (+ offset 6))
  (osc-black-key (+ offset 0.5))
  (osc-black-key (+ offset 1.5))
  (osc-black-key (+ offset 3.5))
  (osc-black-key (+ offset 4.5))
  (osc-black-key (+ offset 5.5)))

;; Draw the whole piano roll
(canvas-clear)
(osc-octave-keys 0)
(osc-octave-keys 7)
