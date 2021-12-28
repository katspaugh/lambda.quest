(define audio--id-count -1)

(define (audio--get-id)
  (set! audio--id-count (+ 1 audio--id-count))
  (string-append "id_" (number->string audio--id-count)))

(define audio-ctx (audio--get-id))

(define (audio--stringify val)
  (if (string? val) (string-append "\"" val "\"")
      (if (number? val) (number->string val)
          (symbol->string val))))

(define (audio--eval args)
  (jseval (string-append
           "postMessage([ 'audio', "
           (apply string-append
                  (map
                   (lambda (x) (string-append (audio--stringify x) ", "))
                   args))
           "])"))
  (void))

(define (audio--delay callback ms)
  (audio--eval (list "delay" callback ms)))

(define audio-callbacks '())

(define-macro audio-timeout
  (lambda (duration . calls)
    (if (and (eq? 1 (length calls)) (symbol? (car calls)))
        (let ((callback (symbol->string (car calls))))
          ;; Callback is a symbol, just pass it
          `(audio--delay ,callback ,duration))
        ;; Callback is a list of expressions, create a lambda
        `(let ((index (number->string (length audio-callbacks))))
           ((set! audio-callbacks (append audio-callbacks (list (lambda () ,@calls))))
            (audio--delay (string-append "(list-ref audio-callbacks " index ")") ,duration))))))

(define (audio-call id path . rest)
  (let ((new-id (audio--get-id)))
    (audio--eval (append (list "call" id new-id (symbol->string path)) rest))
    new-id))

(define (audio-call! id path . rest)
  (audio--eval (append (list "call" id "" (symbol->string path)) rest)))

(define (audio-get id path)
  (let ((new-id (audio--get-id)))
    (audio--eval (list "get" id new-id (symbol->string path)))
    new-id))

(define (audio-set id path val)
  (audio--eval (list "set" id "" (symbol->string path) val)))
