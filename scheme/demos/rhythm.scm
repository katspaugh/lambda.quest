;; Random melodic beat

;; Click anywhere on the page to start the audio

(load* "/scheme/osc.scm")

;; Kick drum
(define osc1 (osc-make 'sine 110))
(define osc1-gain (osc-gain osc1))
(define osc1-freq (audio-get osc1 'frequency))

;; Lead
(define osc2 (osc-make 'sawtooth 440))
(define osc2-gain (osc-gain osc2))
(define osc2-freq (audio-get osc2 'frequency))

;; Percussion
(define osc3 (osc-make 'sine 880))
(define osc3-gain (osc-gain osc3))
(define osc3-freq (audio-get osc3 'frequency))

;; 4 on the floor
(define (osc-loop1 step)
  (canvas-call 'clearRect 200 200 30 30)
  (canvas-call 'fillRect 200 200 30 30)
  (osc-pluck osc1-gain 0.1 300) ;; volume envelope
  (osc-pluck osc1-freq 300 100)) ;; frequency envelope

;; Melody
(define (osc-loop2 step)
  (canvas-call 'clearRect 100 65 30 30)
  (if (= 0 (modulo step 4))
      (let ((rand (+ 1 (random-integer 6))))
        (canvas-call 'clearRect 100 0 500 200)
        (canvas-call 'fillRect 100 65 30 30)
        (canvas-set 'font "70px serif")
        (canvas-fillText (string-append (number->string (/ 1320 rand)) "Hz") 200 100)
        (audio-set osc2-freq 'value (/ 1320 rand))
        (osc-envelope osc2-gain 0.1 200) ;; attack
        (osc-envelope osc2-gain 0.000001 (* 300 rand))))) ;; decay

;; Off-beat percussion
(define (osc-loop3 step)
  (canvas-call 'clearRect 330 300 30 30)
  (if (= 0 (modulo step 3))
      (begin
        (canvas-call 'fillRect 330 300 30 30)
        (audio-set osc3-freq 'value (* (random-integer 10) 110))
        (osc-pluck osc3-gain 0.05 300))))

(define (osc-main-loop count)
  (let ((step (modulo (+ 1 count) 4)))
    (osc-loop1 step)
    (osc-loop2 step)
    (osc-loop3 step)
    (timeout 400)
    (osc-main-loop step)))

(osc-main-loop 0)
