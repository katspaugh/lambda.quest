;; Random melodic beat

;; Click anywhere on the page to start the audio

(load "https://lambda.quest/scheme/osc.scm")

;; Kick drum
(define osc1 (osc-make 'sine 110))
(define osc1-gain (osc-gain osc1))

;; Lead
(define osc2 (osc-make 'sawtooth 440))
(define osc2-gain (osc-gain osc2))

;; Percussion
(define osc3 (osc-make 'sine 880))
(define osc3-gain (osc-gain osc3))

;; 4 on the floor
(define (osc-loop1)
  (canvas-call 'clearRect 200 200 30 30)
  (canvas-sleep 0.1)
  (canvas-call 'fillRect 200 200 30 30)
  (osc-pluck osc1-gain 0.1 300) ;; volume envelope
  (osc-pluck (audio-get osc1 'frequency) 800 200) ;; frequency envelope
  (timeout 400 osc-loop1))
(osc-loop1)

;; Melody
(define (osc-loop2)
  (let ((rand (+ 1 (random-integer 6))))
    (canvas-call 'clearRect 0 0 1000 200)
    (canvas-sleep 0.1)
    (canvas-call 'fillRect 100 65 30 30)
    (canvas-set 'font "70px serif")
    (canvas-fillText (string-append (number->string (/ 1320 rand)) "Hz") 200 100)
    (audio-set (audio-get osc2 'frequency) 'value (/ 1320 rand))
    (osc-envelope osc2-gain 0.1 200) ;; attack
    (osc-envelope osc2-gain 0.000001 (* 300 rand)) ;; decay
    (timeout 1600 osc-loop2)))
(osc-loop2)

;; Off-beat percussion
(define (osc-loop3)
  (canvas-call 'clearRect 330 300 30 30)
  (canvas-sleep 0.1)
  (canvas-call 'fillRect 330 300 30 30)
  (audio-set (audio-get osc3 'frequency) 'value (* (random-integer 10) 110))
  (osc-pluck osc3-gain 0.05 300)
  (timeout 800 osc-loop3))
(timeout 300 osc-loop3)
