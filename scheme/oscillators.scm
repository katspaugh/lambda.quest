;; Three beating oscillators

;; Click anywhere on the page to start the audio

;; Make an oscillator
(define (osc-make type freq)
  (let ((osc (audio-call audio-ctx 'createOscillator)))
    ;; Type: sine, triangle, sawtooth, square
    (audio-set osc 'type (symbol->string type))
    ;; Base frequency in Hz
    (audio-set (audio-get osc 'frequency) 'value freq)
    ;; Listen to it
    (audio-call osc 'connect (audio-get audio-ctx 'destination))
    (audio-call osc 'start 0)
    osc))

;; Detune an oscillator (+- in Hz)
(define (osc-detune osc freq)
  (audio-set (audio-get osc 'detune) 'value freq)
  osc)

;; Set type
(define (osc-waveform osc type)
  (audio-set osc 'type (symbol->string type))
  osc)

;; Square osc at 100 Hz
(define osc1 (osc-make 'square 100))
(osc-detune osc1 (- (random-integer 20) 10))

;; Sawtooth osc at 300 Hz
(define osc2 (osc-make 'sawtooth 300))
(osc-detune osc2 (- (random-integer 20) 10))

;; Square osc at 600 Hz
(define osc3 (osc-make 'square 600))
(osc-detune osc3 (- (random-integer 20) 10))

;; Square LFO
(audio-loop 1) ;; Loop the calls after this one
(audio-sleep 0.1)
(osc-detune osc3 20)
(audio-sleep 0.1)
(osc-detune osc3 -120)


;; You can now live-program the oscillators from the REPL
;; E.g. type:
;;
;; (osc-detune osc1 9)
;; (osc-waveform osc2 'sine)
