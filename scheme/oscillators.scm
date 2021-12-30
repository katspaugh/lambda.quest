;; Three beating oscillators

;; Click anywhere on the page to start the audio

;; Main output
(define osc-destination (audio-get audio-ctx 'destination))

;; Make an oscillator
(define (osc-make type freq)
  (let ((osc (audio-call audio-ctx 'createOscillator))
        (vca (audio-call audio-ctx 'createGain)))
    ;; Set waveform type
    (audio-set osc 'type (symbol->string type))
    ;; Base frequency in Hz
    (audio-set (audio-get osc 'frequency) 'value freq)
    (audio-call! osc 'connect vca)
    (audio-set (audio-get vca 'gain) 'value 0.1)
    (audio-call! vca 'connect osc-destination)
    osc))

;; Detune an oscillator (+- cents)
(define (osc-detune osc freq)
  (audio-set (audio-get osc 'detune) 'value freq)
  osc)

;; Set waveform type: sine, triangle, sawtooth, square
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

;; Start the oscs
(audio-call! osc1 'start 0)

(timeout
 1000
 (audio-call! osc2 'start 0))

(timeout
 2000
 (audio-call! osc3 'start 0))

;; You can now live-program the oscillators from the REPL
;; E.g. type:
;;
;; (osc-detune osc1 9)
;; (osc-waveform osc2 'sine)
