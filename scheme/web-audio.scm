(define audio--id-count -1)

(define (audio--get-id)
  (set! audio--id-count (+ 1 audio--id-count))
  (string-append "id_" (number->string audio--id-count)))

(define audio-ctx (audio--get-id))

(define (audio--eval args)
  (jseval-msg "audio" args))

(define (audio-call id path . rest)
  (let ((new-id (audio--get-id)))
    (audio--eval (append (list "call" id new-id path) rest))
    new-id))

(define (audio-call! id path . rest)
  (audio--eval (append (list "call" id "" path) rest)))

(define (audio-get id path)
  (let ((new-id (audio--get-id)))
    (audio--eval (list "get" id new-id path))
    new-id))

(define (audio-set id path val)
  (audio--eval (list "set" id "" path val)))
