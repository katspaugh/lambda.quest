(define audio-id-count -1)

(define (audio-get-id)
  (set! audio-id-count (+ 1 audio-id-count))
  (string-append "id_" (number->string audio-id-count)))

(define audio-ctx (audio-get-id))

(define (audio-stringify val)
  (if (string? val) (string-append "\"" val "\"")
      (if (number? val) (number->string val)
          (symbol->string val))))

(define (audio-eval args)
  (jseval (string-append
           "postMessage([ 'audio', "
           (apply string-append
                  (map
                   (lambda (x) (string-append (canvas-stringify x) ", "))
                   args))
           "])"))
  (void))

(define (audio-sleep ms)
  (audio-eval (list "sleep" ms)))

(define (audio-loop toggle)
  (audio-eval (list "loop" toggle)))

(define (audio-call id path . rest)
  (let ((new-id (audio-get-id)))
    (audio-eval (append (list "call" id new-id (symbol->string path)) rest))
    new-id))

(define (audio-get id path)
  (let ((new-id (audio-get-id)))
    (audio-eval (list "get" id new-id (symbol->string path)))
    new-id))

(define (audio-set id path val)
  (audio-eval (list "set" id "" (symbol->string path) val)))
