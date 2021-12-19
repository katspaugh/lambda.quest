(() => {
  const initAutocomplete = (monaco, editor, keywords) => {
    const { languages } = monaco

    languages.setLanguageConfiguration('scheme', {
      wordPattern: /[\w\-\.:<>\*][\w\d\.\\/\-\?<>\*!]+/,
      indentationRules: {
        decreaseIndentPattern: undefined,
        increaseIndentPattern: /^\s*\(.*[^)]\s*$/
      }
    })

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

        const matching = keywords.filter(item => item.startsWith(word))

        const suggestions = matching.map(item => ({
          label: item,
          kind: languages.CompletionItemKind.Snippet,
          insertText: item,
          range: range,
        }))

        return {
          suggestions
        }
      }
    })
  }

  const initEditor = (code) => {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.32.0-dev.20211218/min/vs' } });

	  require(['vs/editor/editor.main'], () => {
	    const editor = monaco.editor.create(document.getElementById('container'), {
		    value: code,
		    language: 'scheme'
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
            _drawCleanup()
            gambitEval(value)
          }
        }, 300)
      })

      fetch('./src/keywords.json').then(resp => resp.json()).then(keywords => {
        initAutocomplete(monaco, editor, keywords)
      })
    })
  }

  Promise.all([
    fetch('./scheme/canvas.scm').then(resp => resp.text()),
    fetch('./scheme/demo.scm').then(resp => resp.text())
  ]).then(([ canvasCode, demoCode ]) => {
    gambitEval(canvasCode + demoCode)
    initEditor(demoCode)
  })
})()
