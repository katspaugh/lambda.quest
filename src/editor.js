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

export const initEditor = (canvasCode, demoCode, onChange) => {
  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.32.0-dev.20211218/min/vs' } });

	require(['vs/editor/editor.main'], () => {
    preloadedKeywords = extractKeywords(canvasCode)
    userKeywords = extractKeywords(demoCode)

    initAutocomplete(monaco)

    let theme = 'vs'
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'vs-dark'
    }

	  const editor = monaco.editor.create(document.getElementById('container'), {
		  value: demoCode,
		  language: 'scheme',
      autoClosingBrackets: false,
      minimap: {
        enabled: false
      },
      theme
	  });

    let debounce
    const model = editor.getModel()
    model.onDidChangeContent((e) => {
      // @TODO: eval only the changed expressions
      //console.log(e.changes)

      if (debounce) clearTimeout(debounce)

      debounce = setTimeout(() => {
        const value = model.getValue()
        const openParens = value.match(/[(]/g) || []
        const closeParens = value.match(/[)]/g) || []
        if (openParens.length === closeParens.length) {
          onChange(value)
          userKeywords = extractKeywords(value)
        }
      }, 300)
    })
  })
}
