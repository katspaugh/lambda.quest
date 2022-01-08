;; Piano roll

(load "https://lambda.quest/scheme/osc.scm")

;; Piano voice
(define piano-osc (osc-make 'sawtooth 220))
(define piano-osc-gain (osc-gain piano-osc))

;; Diatonic scale
(define piano-cents '(0 200 400 500 700 900 1100))

;; Convert a position in the piano roll to a note value in cents
(define (piano-key-to-cents key)
  (let ((note (modulo (inexact->exact (floor key)) 7)) (octave (floor (/ key 7))))
    (log "Key %d, Note %d, Octave %d" key note octave)
    (+
     (* octave 1200)
     (list-ref piano-cents note)
     (if (eq? (round key) key) 0 100))))

;; PLay the note at a given position
(define (piano-play-key key)
  (let ((cents (piano-key-to-cents key)))
    (osc-detune piano-osc cents)
    (osc-pluck piano-osc-gain 0.2 600)))

;; List of callbacks
(define piano-click-handlers '())

;; Handle clicks on the canvas
(define (piano-onclick x y)
  (map (lambda (callback) (callback x y)) piano-click-handlers))

;; Check if a point X, Y intersects a rectangle
(define (piano-intersects x y left top width height)
  (and (>= x left) (<= x (+ left width)) (>= y top) (<= y (+ top height))))

;; Give visual feedback on key click
(define (piano-key-feedback left top w h fill)
  (canvas-set 'fillStyle "#ddd")
  (canvas-call 'fillRect (+ 10 left) (- (+ top h) 140) (- w 20) 130)
  (timeout 300)
  (canvas-set 'fillStyle fill)
  (canvas-call 'fillRect (+ 10 left) (- (+ top h) 140) (- w 20) 130)
  (canvas-call 'strokeRect left top w h))

;; Render a piano key and listen to clicks on it
(define (piano-draw-key offset fill step w h click-offset)
  (let ((left (+ (* offset step) (/ (- step w) 2))) (top 350))
    ;; Draw the key
    (canvas-set 'fillStyle fill)
    (canvas-call 'fillRect left top w h)
    (canvas-call 'strokeRect left top w h)

    ;; Assign a click handler
    (let ((onclick (lambda (x y)
                     (if (piano-intersects x y left (+ click-offset top) w h)
                         (begin
                           (piano-play-key offset) ;; play the note
                           (piano-key-feedback left top w h fill)))))) ;; visual feedback
      (set! piano-click-handlers (append piano-click-handlers (list onclick))))))

;; Draw a white key
(define (piano-white-key offset)
  (piano-draw-key offset "#fff" 72 72 300 140))

;; Draw a black key
(define (piano-black-key offset)
  (piano-draw-key offset "#000" 72 62 150 0))

;; Draw a piano octave
(define (piano-octave-keys offset)
  (piano-white-key (+ offset 0))
  (piano-white-key (+ offset 1))
  (piano-white-key (+ offset 2))
  (piano-white-key (+ offset 3))
  (piano-white-key (+ offset 4))
  (piano-white-key (+ offset 5))
  (piano-white-key (+ offset 6))
  (piano-black-key (+ offset 0.5))
  (piano-black-key (+ offset 1.5))
  (piano-black-key (+ offset 3.5))
  (piano-black-key (+ offset 4.5))
  (piano-black-key (+ offset 5.5)))

;; Draw the whole piano roll
(define (piano-init)
  (canvas-clear)
  (set! piano-click-handlers '())
  (piano-octave-keys 0)
  (piano-octave-keys 7)
  (canvas-onclick 'piano-onclick))

(piano-init)
