;; Piano roll

;; Click anywhere on the page to start the audio

;; Main output
(define osc-destination (audio-get audio-ctx 'destination))

;; Make an oscillator
(define (osc-make type freq)
  (let ((osc (audio-call audio-ctx 'createOscillator)))
    ;; Set waveform type
    (audio-set osc 'type (symbol->string type))
    ;; Base frequency in Hz
    (audio-set (audio-get osc 'frequency) 'value freq)
    (audio-call! osc 'start 0)
    osc))

;; Detune an oscillator (+- cents)
(define (osc-detune osc cents)
  (audio-set (audio-get osc 'detune) 'value cents)
  osc)

;; Make a volume control node
(define (osc-make-vca)
  (let ((vca (audio-call audio-ctx 'createGain)))
    (audio-set (audio-get vca 'gain) 'value 0)
    (audio-call! vca 'connect osc-destination)
    vca))

;; Make a gain control
(define (osc-gain osc)
  (let ((vca (osc-make-vca)))
    (audio-call! osc 'connect vca)
    (audio-get vca 'gain)))

;; Mark the audio start time
(define (osc-now) (string->number (jseval "performance.now()")))
(define osc-start-time (osc-now))

;; Get current audio time
(define (osc-get-time)
  (- (osc-now) osc-start-time))

(define (osc-envelope param val duration)
  (let ((time (osc-get-time)))
    (audio-call! param 'linearRampToValueAtTime val (/ (+ time duration) 1000))))

(define (osc-pluck param val duration)
  (audio-set param 'value val)
  (osc-envelope param 0.0000000001 duration))


;; Piano voice
(define osc1 (osc-make 'sawtooth 220))
(define osc1-gain (osc-gain osc1))

(define osc-cents '(0 200 400 500 700 900 1100))
(define (osc-key-to-cents key)
  (let ((note (modulo (inexact->exact (floor key)) 7)) (octave (floor (/ key 7))))
    (log "Key %d, Note %d, Octave %d" key note octave)
    (+
     (* octave 1200)
     (list-ref osc-cents note)
     (if (eq? (round key) key) 0 100))))

(define (osc-play-key key)
  (let ((cents (osc-key-to-cents key)))
    (osc-detune osc1 cents)
    (osc-pluck osc1-gain 0.2 600)))

;; Handle clicks on the Canvas
(define osc-click-handlers '())

(set! canvas-click (lambda (x y)
                     (map (lambda (callback) (callback x y)) osc-click-handlers)))

(define (osc-intersects x y left top width height)
  (and (>= x left) (<= x (+ left width)) (>= y top) (<= y (+ top height))))

;; Render a piano roll on the canvas
(define (osc-white-key offset)
  (let ((left (* offset 50)) (top 350) (w 50) (h 250))
    (set! osc-click-handlers
          (append osc-click-handlers (list
                                      (lambda (x y)
                                        (if (osc-intersects x y left (+ 140 top) w h)
                                            (begin
                                              (osc-play-key offset)
                                              (canvas-set 'fillStyle "#ddd")
                                              (canvas-call 'fillRect (+ 10 left) (+ 150 top) (- w 20) 90)
                                              (canvas-sleep 0.3)
                                              (canvas-call 'clearRect (+ 10 left) (+ 150 top) (- w 20) 90)
                                              (canvas-call 'strokeRect left top w h)))))))
    (canvas-call 'strokeRect left top w h)))

(define (osc-black-key offset)
  (let ((left (+ (* offset 50) 5)) (top 350) (w 40) (h 140))
    (set! osc-click-handlers
          (append osc-click-handlers (list
                                      (lambda (x y)
                                        (if (osc-intersects x y left top w h)
                                            (begin
                                              (osc-play-key offset)
                                              (canvas-set 'fillStyle "#ddd")
                                              (canvas-call 'fillRect (+ 10 left) (+ 10 top) (- w 20) 120)
                                              (canvas-sleep 0.3)
                                              (canvas-set 'fillStyle "#000")
                                              (canvas-call 'fillRect left top w h)))))))
    (canvas-set 'fillStyle "#000")
    (canvas-call 'fillRect left top w h)))

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

(canvas-clear)
(osc-octave-keys 0)
(osc-octave-keys 7)
(osc-octave-keys 14)
