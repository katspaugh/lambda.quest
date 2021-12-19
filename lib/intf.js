//=============================================================================

// File: "intf.js"

// Copyright (c) 2013 by Marc Feeley, All Rights Reserved.

//=============================================================================

var Module = {};

Module.stdin_buffer = [];

Module.stdin_add = function (str) {
  var bytes = intArrayFromString(str);
  bytes.pop(); // remove NUL at end
  if (bytes.length === 1 && bytes[0] === 3) { // ctrl-C ?
    Module.terminal.write('^C');
    _user_interrupt();
  } else {
    Module.stdin_buffer = Module.stdin_buffer.concat(bytes);
  }
};

Module.stdin = function () {

  if (Module.stdin_buffer.length === 0) {
    return undefined;
  } else {
    return Module.stdin_buffer.shift();
  }
};

Module.stdout = function (val) {
  if (val !== null) {

    var str;

    if (val === 10) {
      str = '\r\n';
    } else {
      str = String.fromCharCode(val);
    }

    Module.terminal.write(str);
    Module.terminal.scrollToBottom();
  }
};

Module.stderr = Module.stdout;

Module.setupTTYIO = function () {

  // redirect TTY I/O to stdin and stdout

  var ops = {
    get_char: function (tty) {
      return Module.stdin();
    },
    put_char: function (tty, val) {
      return Module.stdout(val);
    }
  };

  TTY.register(FS.makedev(5, 0), ops); // redirect /dev/tty
  TTY.register(FS.makedev(6, 0), ops); // redirect /dev/tty1
};

Module.preRun = [Module.setupTTYIO];

Module.setupTerminal = function () {
  var terminal = new Terminal({
    cols: 120,
    rows: 10
  });

  terminal.open(document.getElementById('terminal'));

  terminal.onKey((e) => {
    Module.stdin_add(e.key);
  });

  return terminal;
};

// Scheme code execution driver

Module.schemeDriver = function () {
  function step_scheme() {
    _heartbeat_interrupt();
    var wait = _idle();
    if (wait < 0) {
      _cleanup();
    } else {
      setTimeout(step_scheme, Math.max(1, Math.round(1000 * wait)));
    }
  };

  _setup();
  step_scheme();
};

Module.schemeStart = function () {
  Module.terminal = Module.setupTerminal();
  Module.schemeDriver(); // run the Scheme code
};

window.gambitEval = (str) => {
  _drawCleanup()
  Module.stdin_add(`${str}\n`);
};

// Start the Scheme program when the page is ready

window.onload = () => {
  Module.schemeStart();
}

//=============================================================================
