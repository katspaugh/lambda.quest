;; Random melodic beat

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

;; Make a volume control node
(define (osc-make-vca)
  (let ((vca (audio-call audio-ctx 'createGain)))
    (audio-set (audio-get vca 'gain) 'value 0)
    (audio-call! vca 'connect osc-destination)
    vca))

;; Make a voice with pitch and gain control
(define (osc-voice osc)
  (let ((vca (osc-make-vca)))
    (audio-call! osc 'connect vca)
    (cons (audio-get osc 'frequency) (audio-get vca 'gain))))

;; Mark the audio start time
(define (osc-now) (/ (string->number (jseval "Date.now()")) 1000))
(define osc-start-time (osc-now))

;; Get current audio time
(define (osc-get-time)
  (- (osc-now) osc-start-time))

(define (osc-envelope param val duration)
  (let ((time (osc-get-time)))
    (audio-call! param 'exponentialRampToValueAtTime val (+ time (/ duration 1000)))))

(define (osc-pluck param val duration)
  (audio-set param 'value val)
  (osc-envelope param 0.0000000001 duration))


;; Kick drum
(define voice1 (osc-voice (osc-make 'sine 110)))

;; Lead
(define voice2 (osc-voice (osc-make 'sawtooth 440)))

;; Percussion
(define voice3 (osc-voice (osc-make 'sine 880)))


;; 4 on the floor
(define (osc-loop1)
  (canvas-call 'clearRect 200 200 30 30)
  (canvas-sleep 0.1)
  (canvas-call 'fillRect 200 200 30 30)
  (osc-pluck (cdr voice1) 0.1 300) ;; volume envelope
  (osc-pluck (car voice1) 800 200) ;; frequency envelope
  (audio-timeout 400 osc-loop1))
(osc-loop1)

;; Melody
(define notes '("D" "C" "B" "A" "G" "F" "E"))
(canvas-set 'font "70px serif")

(define (osc-loop2)
  (let ((rand (+ 1 (random-integer 6))))
    (canvas-call 'clearRect 0 0 1000 200)
    (canvas-sleep 0.1)
    (canvas-call 'fillRect 100 65 30 30)
    (canvas-fillText (string-append (list-ref notes rand) " – " (number->string (/ 1320 rand)) "Hz") 200 100)
    (audio-set (car voice2) 'value (/ 1320 rand))
    (osc-envelope (cdr voice2) 0.1 200) ;; attack
    (osc-envelope (cdr voice2) 0.0000000001 (* 300 rand)) ;; decay
    (audio-timeout 1600 osc-loop2)))
(osc-loop2)

;; Off-beat percussion
(define (osc-loop3)
  (canvas-call 'clearRect 330 300 30 30)
  (canvas-sleep 0.1)
  (canvas-call 'fillRect 330 300 30 30)
  (audio-set (car voice3) 'value (* (random-integer 10) 110))
  (osc-pluck (cdr voice3) 0.05 300)
  (audio-timeout 800 osc-loop3))
(audio-timeout 300 osc-loop3)
