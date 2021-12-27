;; Three beating oscillators

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
    (audio-call osc 'start 0)
    osc))

;; Detune an oscillator (+- cents)
(define (osc-detune osc freq)
  (audio-set (audio-get osc 'detune) 'value freq)
  osc)

;; Set waveform type: sine, triangle, sawtooth, square
(define (osc-waveform osc type)
  (audio-set osc 'type (symbol->string type))
  osc)

;; Make a volume control node
(define (osc-make-vca)
  (let ((vca (audio-call audio-ctx 'createGain)))
    (audio-set (audio-get vca 'gain) 'value 0.1)
    (audio-call vca 'connect osc-destination)
    vca))

;; Make a voice
(define (osc-voice osc)
  (let ((vca (osc-make-vca)))
      (audio-call osc 'connect vca)
      (audio-get vca 'gain)))

;; Set volume
(define (osc-volume gain volume)
  (audio-set gain 'value volume)
  gain)

;; Square osc at 100 Hz
(define osc1 (osc-make 'square 100))
(osc-detune osc1 (- (random-integer 20) 10))
(define voice1 (osc-voice osc1))

(audio-sleep 2000)

;; Sawtooth osc at 300 Hz
(define osc2 (osc-make 'sawtooth 300))
(osc-detune osc2 (- (random-integer 20) 10))
(define voice2 (osc-voice osc2))

(audio-sleep 2000)

;; Square osc at 600 Hz
(define osc3 (osc-make 'square 600))
(osc-detune osc3 (- (random-integer 20) 10))
(define voice3 (osc-voice osc3))

;; Square LFO
(audio-loop 1) ;; Loop the calls after this one
(audio-sleep 100)
(osc-detune osc3 20)
(audio-sleep 100)
(osc-detune osc3 -200)

;; You can now live-program the oscillators from the REPL
;; E.g. type:
;;
;; (osc-detune osc1 9)
;; (osc-waveform osc2 'sine)
