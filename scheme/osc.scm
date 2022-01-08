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
    (audio-call! vca 'connect (audio-get audio-ctx 'destination))
    vca))

;; Make a gain control
(define (osc-gain osc)
  (let ((vca (osc-make-vca)))
    (audio-call! osc 'connect vca)
    (audio-get vca 'gain)))

;; Mark the audio start time
(define (osc-now) \performance.now())
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
