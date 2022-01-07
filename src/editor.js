import { updateOrCreate } from './init-user-menu.js'

let userKeywords = []
let preloadedKeywords = []
let editor = null

const SESSION_KEY = 'LQ_editorContent'

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

export const getContent = () => {
  return editor ? editor.getModel().getValue() : ''
}

export const setContent = (newContent) => {
  if (!editor) {
    setTimeout(() => setContent(newContent), 10)
  } else {
    editor.getModel().setValue(newContent)
  }
}

export const sessionSave = () => {
  sessionStorage.setItem(SESSION_KEY, getContent())
}

export const sessionRestore = () => {
  const content = sessionStorage.getItem(SESSION_KEY)
  if (content != null) {
    setContent(content)
    return true
  }
  return false
}

const getSexpAtPoint = (code, position) => {
  let openIndex = null
  let openCount = 0
  let closeCount = 0
  let inString = false
  let inComment = false

  for (let i = 0, len = code.length; i < len; i++) {
    const char = code[i]

    if (char === ';') {
      inComment = true
    }

    if (inComment) {
      if (char === '\n') {
        inComment = false
      } else {
        continue
      }
    }

    if (char === '"') {
      inString = !inString
    }

    if (inString) continue

    const isOpen = char === '('
    const isClose = char === ')'

    if (isOpen) openCount += 1
    if (isClose) closeCount += 1

    if (isOpen && openIndex == null) {
      openIndex = i
    }

    if (openCount > 0 && openCount === closeCount) {
      if (position >= openIndex && position <= i) {
        const closeIndex = i + 1
        return {
          text: code.slice(openIndex, closeIndex),
          start: openIndex,
          end: closeIndex
        }
      }

      openIndex = null
      openCount = 0
      closeCount = 0
    }
  }

  return null
}

const highlightCode = (range) => {
  const decorations = editor.deltaDecorations(
	  [],
	  [
		  {
			  range,
			  options: {
				  inlineClassName: 'eval-decoration'
			  }
		  }
	  ]
  )

  setTimeout(() => {
    editor.deltaDecorations(decorations, [])
  }, 200)
}

const initEvalAction = (monaco, onEval) => {
  editor.addAction({
	  // An unique identifier of the contributed action.
	  id: 'eval-sexp-at-point',

	  // A label of the action that will be presented to the user.
	  label: 'Eval s-exp',

	  // An optional array of keybindings for the action.
	  keybindings: [
			monaco.KeyMod.Shift | monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX
	  ],

	  // A precondition for this action.
	  precondition: null,

	  // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
	  keybindingContext: null,

	  contextMenuGroupId: 'navigation',

	  contextMenuOrder: 1.5,

	  run: (ed) => {
      // Eval selected text
      const model = ed.getModel()
      const selectionRange = ed.getSelection()
      const selection = model.getValueInRange(selectionRange)
      if (selection) {
        const form = getSexpAtPoint(selection, 0)
        if (form) {
          onEval(form.text)
        } else {
          onEval(selection)
        }
        highlightCode(selectionRange)
        return
      }

      // Eval s-exp at point
      const offset = model.getOffsetAt(ed.getPosition())
      const value = ed.getModel().getValue()
      const form = getSexpAtPoint(value, offset)
      if (form) {
        onEval(form.text)
        const starPos = model.getPositionAt(form.start)
        const endPos = model.getPositionAt(form.end)
        const range = {
          startLineNumber: starPos.lineNumber,
          endLineNumber: endPos.lineNumber,
          startColumn: starPos.column,
          endColumn: endPos.column
        }
        highlightCode(range)
        return
      }
	  }
  })
}

const initSaveAction = (monaco, onSave) => {
  editor.addAction({
	  // An unique identifier of the contributed action.
	  id: 'save-as-gist',

	  // A label of the action that will be presented to the user.
	  label: 'Save code in a gist',

	  // An optional array of keybindings for the action.
	  keybindings: [
			monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
	  ],

	  // A precondition for this action.
	  precondition: null,

	  // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
	  keybindingContext: null,

	  contextMenuGroupId: 'navigation',

	  contextMenuOrder: 1.5,

	  run: onSave
  })
}

const isMatchingParens = (content) => {
  return (content.match(/[(]/g) || []).length === (content.match(/[)]/g) || []).length
}

export const autocompleteLibs = (code) => {
  preloadedKeywords = extractKeywords(code)
}

export const initEditor = (onEval, onSetContent) => {
  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.32.0-dev.20211218/min/vs' } });

	require(['vs/editor/editor.main'], () => {
    let theme = 'vs'
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'vs-dark'
    }

	  const monacoEditor = monaco.editor.create(document.getElementById('container'), {
		  language: 'scheme',
      autoClosingBrackets: false,
      minimap: { enabled: false },
      theme
	  });

    let debounce
    const model = monacoEditor.getModel()
    model.onDidChangeContent((e) => {
      if (debounce) clearTimeout(debounce)

      debounce = setTimeout(() => {
        const value = model.getValue()
        userKeywords = extractKeywords(value)

        if (e.changes[0].text === value && isMatchingParens(value)) {
          onSetContent()
        }
      }, 300)
    })

    // Export
    editor = monacoEditor

    initEvalAction(monaco, onEval)
    initSaveAction(monaco, updateOrCreate)
    initAutocomplete(monaco)
  })
}
