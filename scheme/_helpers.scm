(define (log . args)
  (apply \console.log args))

(define (jseval-msg command args)
  (\postMessage (append (list command) args))
  (void))

(define (timeout ms) \sleep(`ms))

(define (load* path)
  (load (string-append \location.protocol "//" \location.host path)))

(module-whitelist-add! "gist.githubusercontent.com")
(module-whitelist-add! "localhost:8000")
(module-whitelist-add! "lambda.quest")
(module-search-order-add! "http://localhost:8000/scheme")
(module-search-order-add! "https://lambda.quest/scheme")
