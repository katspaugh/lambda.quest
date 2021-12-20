(() => {
  let userKeywords = []
  let preloadedKeywords = []

  const updateSuggestions = (monaco, builtInKeywords) => {
    const { languages } = monaco

    languages.registerCompletionItemProvider('scheme', {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })

        const wordMatch = textUntilPosition.match(/[a-z0-9?!><=*+-]+?$/i)
        const word = wordMatch ? wordMatch[0] : ''

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - word.length,
          endColumn: position.column
        }

        const matching = userKeywords
              .concat(preloadedKeywords)
              .concat(builtInKeywords)
              .filter(item => item.startsWith(word))

        const suggestions = matching.map(item => ({
          label: item,
          kind: userKeywords.includes(item) ?
            languages.CompletionItemKind.Function :
            languages.CompletionItemKind.Keyword,
          insertText: item,
          range: range,
        }))

        return {
          suggestions
        }
      }
    })
  }

  const initAutocomplete = (monaco) => {
    monaco.languages.setLanguageConfiguration('scheme', {
      wordPattern: /[\w\-\.:<>\*][\w\d\.\\/\-\?<>\*!]+/,
      indentationRules: {
        decreaseIndentPattern: undefined,
        increaseIndentPattern: /^\s*\(.*[^)]\s*$/
      }
    })

    // Load built-in definitions
    fetch('./src/keywords.json').then(resp => resp.json()).then(keywords => {
      updateSuggestions(monaco, keywords)
    })
  }

  const extractKeywords = (code) => {
    return (code.match(/\(define \(?([^ )]+)/ig) || []).map((s) => s.split(/ \(?/)[1])
  }

  const evalAndDraw = (code) => {
    _drawCleanup()
    _gambitEval(code)
    setTimeout(_drawLoop, 100)
  }

  const initEditor = (code) => {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.32.0-dev.20211218/min/vs' } });

	  require(['vs/editor/editor.main'], () => {
      initAutocomplete(monaco)

	    const editor = monaco.editor.create(document.getElementById('container'), {
		    value: code,
		    language: 'scheme',
        autoClosingBrackets: false
	    });

      let debounce
      const model = editor.getModel()
      model.onDidChangeContent(() => {
        if (debounce) clearTimeout(debounce)

        debounce = setTimeout(() => {
          const value = model.getValue()
          const openParens = value.match(/[(]/g) || []
          const closeParens = value.match(/[)]/g) || []
          if (openParens.length === closeParens.length) {
            evalAndDraw(value)
            userKeywords = extractKeywords(value)
          }
        }, 300)
      })
    })
  }

  Promise.all([
    fetch('./scheme/canvas.scm').then(resp => resp.text()),
    fetch('./scheme/heaven.scm').then(resp => resp.text())
  ]).then(([ canvasCode, demoCode ]) => {
    evalAndDraw(canvasCode + demoCode)
    preloadedKeywords = extractKeywords(canvasCode)
    userKeywords = extractKeywords(demoCode)
    initEditor(demoCode)
  })
})()
