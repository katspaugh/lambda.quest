(define (stringify val)
  (if (string? val) (string-append "\"" val "\"")
      (if (number? val) (number->string val)
          (symbol->string val))))

(define (log msg . rest)
  (scm->js (string-append
           "console.log('" msg "', "
           (apply string-append
                  (map
                   (lambda (x) (string-append (stringify x) ", "))
                   rest))
           ")"))
  (void))

(define (jseval-msg command args)
  (scm->js (string-append
           "postMessage([ '" command "', "
           (apply string-append
                  (map
                   (lambda (x) (string-append (stringify x) ", "))
                   args))
           "])"))
  (void))

(define timeout--callbacks '())

(define-macro timeout
  (lambda (duration . calls)
    (if (and (eq? 1 (length calls)) (symbol? (car calls)))
        (let ((callback (symbol->string (car calls))))
          ;; Callback is a symbol, just pass it
          `(jseval-msg "setTimeout" (list ,callback ,duration)))
        ;; Callback is a list of expressions, create a lambda
        `(let ((index (number->string (length timeout--callbacks))))
           (set! timeout--callbacks (append timeout--callbacks (list (lambda () (begin ,@calls)))))
           (jseval-msg "setTimeout" (list (string-append "(list-ref timeout--callbacks " index ")") ,duration))))))

(module-whitelist-add! "gist.githubusercontent.com")
(module-whitelist-add! "localhost:8000")
(module-whitelist-add! "lambda.quest")
(module-search-order-add! "http://localhost:8000/scheme")
(module-search-order-add! "https://lambda.quest/scheme")
