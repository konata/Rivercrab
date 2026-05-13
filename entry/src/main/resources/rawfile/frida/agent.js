const say = line => send(`agent:${line}`);
const seen = new Set();
const read = pointer => pointer.isNull() ? null : pointer.readCString();
const sym = name => Module.findGlobalExportByName(name);
let traces = 5;

const named = new NativeFunction(sym('napi_get_named_property'), 'int', ['pointer', 'pointer', 'pointer', 'pointer']);
const size = new NativeFunction(sym('napi_get_value_string_utf8'), 'int', ['pointer', 'pointer', 'pointer', 'ulong', 'pointer']);

const text = (env, value) => {
  const length = Memory.alloc(Process.pointerSize);
  if (size(env, value, NULL, 0, length) !== 0) return '<error>';
  const bytes = length.readU64().toNumber() + 1;
  const data = Memory.alloc(bytes);
  if (size(env, value, data, bytes, length) !== 0) return '<error>';
  return data.readUtf8String(length.readU64().toNumber());
};

const ctor = (env, value) => {
  const out = Memory.alloc(Process.pointerSize);
  if (named(env, value, Memory.allocUtf8String('name'), out) !== 0) return '<error>';
  return text(env, out.readPointer());
};

const hook = (name, target, body) => {
  if (target === null || seen.has(name)) return;
  Interceptor.attach(target, body); seen.add(name); say(`hook ${name} ${target}`);
};

const load = name => hook(name, sym(name), {
  onEnter(args) { this.path = read(args[0]); },
  onLeave(retval) { say(`${name} ${retval} ${this.path}`); },
});

const instance = () => hook('napi_new_instance', sym('napi_new_instance'), {
  onEnter(args) {
    this.out = args[4];
    say(`napi_new_instance env=${args[0]} ctor=${args[1]} name=${ctor(args[0], args[1])} argc=${args[2].toUInt32()} argv=${args[3]} out=${args[4]}`);
    if (traces-- > 0) say(`napi_new_instance pc=${this.context.pc} lr=${this.context.lr} fp=${this.context.fp || this.context.x29}`);
  },
  onLeave(retval) {
    const value = this.out.isNull() ? ptr(0) : this.out.readPointer();
    say(`napi_new_instance => ${retval.toInt32()} result=${value}`);
  },
});

function boot(stage) {
  if (seen.has('boot')) return;
  seen.add('boot'); say(`boot ${stage}`);
  ['dlopen', 'dlopen_ns', 'android_dlopen_ext'].forEach(load);
  instance();

  hook('dlsym', sym('dlsym'), {
    onEnter(args) { this.symbol = read(args[1]); },
    onLeave(retval) {
      if (this.symbol === 'napi_module_register') say(`dlsym ${retval} ${this.symbol}`);
    },
  });
}

rpc.exports = {
  init(stage) { boot(stage); },
};
