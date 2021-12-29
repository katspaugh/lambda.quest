(define (require path)
  (jseval (string-append
           "postMessage([ 'fetch', '" path "' ])"))
  (void))

(define (stringify val)
  (if (string? val) (string-append "\"" val "\"")
      (if (number? val) (number->string val)
          (symbol->string val))))

(define (log msg . rest)
  (jseval (string-append
           "console.log('" msg "', "
           (apply string-append
                  (map
                   (lambda (x) (string-append (stringify x) ", "))
                   rest))
           ")"))
  (void))

