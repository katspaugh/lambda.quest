self.confirm = () => true

const decoder = new TextDecoder()

self.g_scm2host = (obj) => {
  const arr = new Uint8Array(obj.a)
  const msg = decoder.decode(arr)
  const result = eval(msg)
  return typeof result === 'number' ? result : void 0
}

self.g_host2scm = (obj) => obj


self.importScripts('/lib/VM.min.js')

//=============================================================================

// File: "UI.js"

// Copyright (c) 2020-2021 by Marc Feeley, All Rights Reserved.

//=============================================================================

function UI(vm) {

  var ui = this;

  // Create console multiplexer

  var cons_mux = new Multiplexer(true);

  cons_mux.get_more_menu_items = function () {
    return ui.get_more_menu_items_console();
  }

  // Create editor multiplexer

  var editor_mux = new Multiplexer(true);

  editor_mux.get_more_menu_items = function () {
    return ui.get_more_menu_items_editor();
  }

  ui.vm = vm;
  ui.cons_mux = cons_mux;
  ui.editor_mux = editor_mux;
  ui.demo_commands = [];
  ui.demo_index = 0;
  ui.demo_timeoutId = null;
  ui.debug = false;
  ui.fs = _os_fs;
  ui.root_dir = '';
}

UI.prototype.new_repl = function () {

  var ui = this;

  if (ui.debug)
    console.log('UI().new_repl()');

  ui.vm.new_repl(ui);
};

UI.prototype.add_console = function (dev) {

  var ui = this;

  if (ui.debug)
    console.log('UI().add_console(...)');

  ui.cons_mux.add_channel(dev);
};

UI.prototype.remove_console = function (dev) {

  var ui = this;

  if (ui.debug)
    console.log('UI().remove_console(...)');

  ui.cons_mux.remove_channel(dev);
};

UI.prototype.activate_console = function (dev) {

  var ui = this;

  if (ui.debug)
    console.log('UI().activate_console(...)');

  ui.cons_mux.activate_channel(dev);
};

UI.prototype.send_to_active_console = function (text, focus) {

  var ui = this;

  if (ui.debug)
    console.log('UI().send_to_active_console(\''+text+','+focus+'\')');

  var cons_mux = ui.cons_mux;
  var tab_index = cons_mux.tg.active_tab_index();

  if (tab_index >= 0) {
    var dev = cons_mux.tabs[tab_index];
    if (focus) {
      dev.focus();
    }
    dev.cons.send(text);
  }
};

UI.prototype.demo = function (commands) {
};

UI.prototype.demo_cancel = function () {
};

UI.prototype.get_more_menu_items_console = function () {
  return [];
};

UI.prototype.get_more_menu_items_editor = function () {
  return [];
};

UI.prototype.get_unique_file_path = function (base) {

  var ui = this;
  var existing_files = ui.all_files(ui.root_dir);
  var path;
  var i = 0;

  do {
    path = base;
    if (i>0) path += i;
    path += '.scm';
    i++;
  } while (existing_files.indexOf(path) >= 0);

  return path;
};

UI.prototype.edit_new_file = function () {

  var ui = this;

  var path = ui.get_unique_file_path('untitled');
  var content = '';

  ui.write_file(path, content);

  ui.edit_file(path);
};

UI.prototype.edit_file = function (path) {
};

UI.prototype.file_exists = function (path) {

  var ui = this;

  try {
    return ui.fs.existsSync(path);
  } catch (exn) {
    return false;
  }
};

UI.prototype.read_file = function (path, content) {

  var ui = this;

  try {
    content = ui.fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
  } catch (exn) {
    // ignore error
  }

  return content;
};

UI.prototype.write_file_possibly_editor = function (path, content) {

  var ui = this;

  ui.write_file(path, content);
};

UI.prototype.write_file = function (path, content) {

  var ui = this;

  var dir_sep = 0;

  for (;;) {

    var dir_sep = path.indexOf('/', dir_sep);

    if (dir_sep < 0) break;

    try {
      ui.fs.mkdirSync(path.slice(0, dir_sep));
    } catch (exn) {
      // ignore existing directory
    }

    dir_sep++;
  }

  try {
    ui.fs.writeFileSync(path, content, { encoding: 'utf8', flag: 'w' });
    return true;
  } catch (exn) {
    return false;
  }
};

UI.prototype.delete_file_possibly_editor = function (path) {

  var ui = this;

  var index = ui.editor_mux.index_of_channel_by_title(path);

  if (index >= 0) {

    // file is open in an editor tab (the editor must be deleted)

    var editor = ui.editor_mux.channels[index];

    ui.editor_mux.remove_channel(editor);
  }

  ui.delete_file(path);
};

UI.prototype.delete_file = function (path) {

  var ui = this;

  try {
    ui.fs.unlinkSync(path);
    return true;
  } catch (exn) {
    return false;
  }
};

UI.prototype.close_editor = function (path) {

  var ui = this;

  console.log('close_editor '+path);
};

UI.prototype.rename_file = function (path) {

  var ui = this;

  var new_path = prompt('New path for file ' + path);

  if (new_path !== null && new_path !== '') {
    ui.rename_file_possibly_editor(path, new_path);
  }
};

UI.prototype.rename_file_possibly_editor = function (src_path, dest_path) {
};

UI.prototype.all_files = function (root_dir) {

  var ui = this;
  var files = [];

  function is_dir(path) {
    try {
      return ui.fs.statSync(path).isDirectory();
    } catch (exn) {
      return false;
    }
  }

  function walk_dir(relative_path) {
    var files_in_dir = [];
    try {
      files_in_dir = ui.fs.readdirSync(root_dir + relative_path);
    } catch (exn) {
      // ignore this dir
    }
    for (var i=0; i<files_in_dir.length; i++) {
      var name = files_in_dir[i];
      walk((relative_path==='' ? '' : relative_path+'/') + name);
    }
  }

  function walk(relative_path) {
    if (is_dir(root_dir + relative_path)) {
      walk_dir(relative_path);
    } else {
      files.push(relative_path);
    }
  }

  if (root_dir.slice(-1) !== '/') {
    root_dir += '/';
  }

  walk_dir('');

  return files;
};

function Multiplexer(has_more_tab) {

  var mux = this;

  mux.has_more_tab = has_more_tab;
  mux.init();
}

Multiplexer.prototype.init = function () {

  var mux = this;

  mux.channels = [];  // array of channels
  mux.tabs = [];      // array of channels (in tab order)
  mux.mra = [];       // most recently active tabs
  mux.max_nb_tabs = 999999;
  mux.debug = false;

  mux.get_more_menu_items = function () { return []; };
};

Multiplexer.prototype.max_nb_tabs_set = function (max_nb_tabs) {

  var mux = this;

  mux.max_nb_tabs = max_nb_tabs;
};

Multiplexer.prototype.focus = function () {

  var mux = this;

  if (mux.debug)
    console.log('Multiplexer().focus()');

  var tab_index = mux.tg.active_tab_index();

  if (tab_index >= 0) {
    mux.tabs[tab_index].focus();
  }
};

Multiplexer.prototype.clicked_tab = function (tab_index, event) {
};

Multiplexer.prototype.shrink_nb_tabs = function (n) {

  var mux = this;

  while (mux.tabs.length > n) {
    mux.remove_channel(mux.tabs[mux.mra[mux.tabs.length-1]]);
  }
};

Multiplexer.prototype.set_channel_title = function (channel, title) {
};

Multiplexer.prototype.add_channel = function (channel, become_active) {
};

Multiplexer.prototype.remove_channel = function (channel) {
};

Multiplexer.prototype.activate_channel = function (channel) {
};

Multiplexer.prototype.index_of_channel = function (channel) {

  var mux = this;
  var channels = mux.channels;
  var index = 0;

  while (index < channels.length) {
    if (channel === channels[index]) return index;
    index++;
  }

  return -1;
};

Multiplexer.prototype.tab_index_of_channel = function (channel) {

  var mux = this;
  var tabs = mux.tabs;
  var tab_index = 0;

  while (tab_index < tabs.length) {
    if (channel === tabs[tab_index]) return tab_index;
    tab_index++;
  }

  return -1;
};

Multiplexer.prototype.index_of_channel_by_title = function (title) {

  var mux = this;
  var channels = mux.channels;
  var index = 0;

  while (index < channels.length) {
    if (title === channels[index].get_title()) return index;
    index++;
  }

  return -1;
};

function Device_console(vm, title, flags, ui, thread_scm) {

  var dev = this;

  if (!ui) ui = vm.ui;

  dev.vm = vm;
  dev.ui = ui;
  dev.title = title;
  dev.flags = flags;
  dev.wbuf = new Uint8Array(0);
  dev.rbuf = new Uint8Array(1);
  dev.rlo = 1;
  dev.encoder = new TextEncoder();
  dev.decoder = new TextDecoder();
  dev.echo = true;
  dev.read_condvar_scm = null;
  dev.delayed_output = '';

  dev.focused = false;
  dev.dirty = false;

  dev.thread_scm = thread_scm;
  dev.cons = new Console();

  dev.debug = false;

  dev.cons.connect(dev);

  ui.add_console(dev);
}

Device_console.prototype.console_writable = function (cons) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').console_writable(...)');

  dev.cons = cons;
  cons.write(dev.delayed_output);
  dev.delayed_output = '';
};

Device_console.prototype.console_readable = function (cons) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').console_readable(...)');

  dev.cons = cons;
  var input = cons.read();
  var condvar_scm = dev.read_condvar_scm;
  if (condvar_scm !== null) {
    if (input === null) {
      dev.rbuf = new Uint8Array(0);
    } else {
      dev.rbuf = dev.encoder.encode(input);
    }
    dev.rlo = 0;
    dev.read_condvar_scm = null;
    dev.vm.os_condvar_ready_set(condvar_scm, true);
  }
};

Device_console.prototype.console_user_interrupt_thread = function (cons) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').console_user_interrupt_thread(...)');

  dev.cons = cons;

  dev.vm.user_interrupt_thread(dev.thread_scm);
};

Device_console.prototype.console_terminate_thread = function (cons) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').console_terminate_thread(...)');

  dev.cons = cons;

  dev.vm.terminate_thread(dev.thread_scm);
};

Device_console.prototype.activate = function () {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').activate()');

  if (dev.ui !== null) dev.ui.activate_console(dev);
};

Device_console.prototype.input_add = function (input) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').input_add(\''+input+'\')');

  var len = dev.rbuf.length-dev.rlo;
  var inp = dev.encoder.encode(input);
  if (dev.echo) dev.output_add_buffer(inp); // echo the input
  var newbuf = new Uint8Array(len + inp.length);
  newbuf.set(newbuf.subarray(dev.rlo, dev.rlo+len));
  newbuf.set(inp, len);
  dev.rbuf = newbuf;
  dev.rlo = 0;
};

Device_console.prototype.output_add = function (output) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').output_add(\''+output+'\')');

  dev.output_add_buffer(dev.encoder.encode(output));
};

Device_console.prototype.output_add_buffer = function (buffer) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').output_add_buffer(...)');

  var len = dev.wbuf.length;
  var newbuf = new Uint8Array(len + buffer.length);
  newbuf.set(dev.wbuf);
  newbuf.set(buffer, len);
  dev.wbuf = newbuf;

  var output = dev.decoder.decode(dev.wbuf);
  if (dev.cons === null) {
    dev.delayed_output += output;
  } else {
    dev.cons.write(dev.delayed_output + output);
    dev.delayed_output = '';
  }
  dev.wbuf = new Uint8Array(0);
};

Device_console.prototype.read = function (dev_condvar_scm, buffer, lo, hi) {

  var dev = this;
  var n = hi-lo;
  var have = dev.rbuf.length-dev.rlo;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').read(...,['+buffer.slice(0,10)+'...],'+lo+','+hi+')');

  dev.vm.os_condvar_ready_set(dev_condvar_scm, false);

  if (have === 0) {

    if (dev.rlo === 0) {
      dev.rbuf = new Uint8Array(1); // prevent repeated EOF
      dev.rlo = 1;
      return 0; // signal EOF

    } else {

      // Input will be received asynchronously

      if (dev.read_condvar_scm === null) {
        dev.read_condvar_scm = dev_condvar_scm;
      }

      return -35; // return EAGAIN to suspend Scheme thread on condvar
    }
  }

  if (n > have) n = have;

  buffer.set(dev.rbuf.subarray(dev.rlo, dev.rlo+n), lo);

  dev.rlo += n;

  return n; // number of bytes transferred
};

Device_console.prototype.write = function (dev_condvar_scm, buffer, lo, hi) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').write(...,['+buffer.slice(0,10)+'...],'+lo+','+hi+')');

  dev.output_add_buffer(buffer.subarray(lo, hi));

  return hi-lo;
};

Device_console.prototype.force_output = function (dev_condvar_scm, level) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').force_output(...,'+level+')');

  return 0; // no error
};

Device_console.prototype.seek = function (dev_condvar_scm, pos, whence) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').seek(...,'+pos+','+whence+')');

  return -1; // EPERM (operation not permitted)
};

Device_console.prototype.width = function (dev_condvar_scm) {
  return 0;
};

Device_console.prototype.close = function (direction) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').close('+direction+')');

  return 0; // no error
};

Device_console.prototype.get_title = function () {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').get_title()');

  return dev.title;
};

Device_console.prototype.set_title = function (title) {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').set_title('+title+')');

  return false; // can't set title
};

Device_console.prototype.needs_attention = function () {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').needs_attention()');

  return !dev.focused && dev.dirty;
};

Device_console.prototype.focus = function () {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').focus()');

  dev.focused = true;
};

Device_console.prototype.blur = function () {
  dev.focused = false;
};

Device_console.prototype.get_menu_items = function () {
  return [];
};

Device_console.prototype.get_elem = function () {
  return null;
};

Device_console.prototype.preserve_elem = function () {

  var dev = this;

  if (dev.debug)
    console.log('Device_console(\''+dev.title+'\').preserve_elem()');

  return true;
};

//-----------------------------------------------------------------------------

function Console(elem) {

  var cons = this;

  cons.id = 'DefaultConsole';
  cons.transcript_marker = null;
  cons.input_buffer = [];
  cons.eof = false;
  cons.peer = null;
  cons.history_max_length = 1000;
  cons.restore_history();


  onmessage = (e) => {
    cons.add_input(e.data)
  }
}

Console.prototype.line0ch0 = { line: 0, ch: 0 };
Console.prototype.line0ch1 = { line: 0, ch: 1 };

Console.prototype.end_of_doc = function () {
  var cons = this;
  return -1;
};

Console.prototype.read = function () {
  var cons = this;
  if (cons.input_buffer.length > 0) {
    return cons.input_buffer.shift();
  } else {
    return null;
  }
};

Console.prototype.write = function (text) {
  postMessage(text)
};

Console.prototype.accept_input = function () {

  var cons = this;

  cons.write('\n');

  return ''
};

Console.prototype.clear_transcript = function () {
};

Console.prototype.delete_forward = function () {
};

Console.prototype.enter = function () {
};

Console.prototype.tab = function () {
};

Console.prototype.add_input = function (text) {
  var cons = this;
  cons.input_buffer.push(text);
  cons.readable();
};

Console.prototype.connect = function (peer) {
  var cons = this;
  cons.peer = peer;
  cons.writable();
  if (cons.input_buffer.length > 0) cons.readable();
};

Console.prototype.writable = function () {
  var cons = this;
  if (cons.peer) cons.peer.console_writable(cons);
};

Console.prototype.readable = function () {
  var cons = this;
  if (cons.peer) cons.peer.console_readable(cons);
};

Console.prototype.user_interrupt = function () {
  var cons = this;
  if (cons.peer) cons.peer.console_user_interrupt_thread(cons);
};

Console.prototype.terminate_thread = function () {
  var cons = this;
  if (cons.peer) cons.peer.console_terminate_thread(cons);
};

Console.prototype.restore_history = function () {
};

Console.prototype.save_history = function () {
};

Console.prototype.move_history = function (prev) {
};

Console.prototype.change_input = function (text) {
};

Console.prototype.send = function (text) {

  var cons = this;
  var start = 0;

  if (text === null) {
    cons.clear_transcript();
  } else {
    while (start < text.length) {
      var end = text.indexOf('\n');
      if (end < 0) break;
      cons.change_input(text.slice(start, end));
      cons.enter();
      start = end+1;
    }
    cons.change_input(text.slice(start, text.length));
  }
};

Console.prototype.focus = function () {
};

main_vm.init('#ui');

//-----------------------------------------------------------------------------

// Local Variables:
// js-indent-level: 2
// indent-tabs-mode: nil
// End:
