const say = line => console.log(`[crab] ${line}`);
const watch = new Set(['dlopen', 'dlopen_ns', 'napi_module_register', 'napi_new_instance']);
const hooks = [
  { name: 'napi_module_register', symbol: 'napi_module_register', enter(args) { say(`napi_module_register(${args[0]})`); } },
  {
    name: 'napi_new_instance',
    symbol: 'napi_new_instance',
    enter(args) {
      this.out = args[4];
      say(`napi_new_instance env=${args[0]} ctor=${args[1]} name=${ctor(args[0], args[1])} argc=${args[2].toUInt32()} argv=${args[3]} out=${args[4]}`);
      if (traces-- > 0) say(`napi_new_instance pc=${this.context.pc} lr=${this.context.lr} fp=${this.context.fp || this.context.x29}`);
    },
    leave(retval) {
      const value = this.out.isNull() ? ptr(0) : this.out.readPointer();
      say(`napi_new_instance => ${retval.toInt32()} result=${value}`);
    },
  },
];
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
  if (!target || seen.has(name)) return false;
  Interceptor.attach(target, body);
  seen.add(name); say(`hook ${name} ${target}`);
  return true;
};

const scan = reason => {
  let attached = 0;
  for (const item of hooks) {
    const target = item.module ? Process.getModuleByName(item.module).findExportByName(item.symbol) : sym(item.symbol);
    if (hook(item.name, target, {
      onEnter(args) { item.enter ? item.enter(args) : say(`${item.name}()`); },
      onLeave(retval) { if (item.leave) item.leave(retval); },
    })) attached++;
  }
  say(`scan ${reason} ${attached}/${hooks.length}`);
};

const load = name => hook(`loader:${name}`, sym(name), {
  onEnter(args) { this.path = read(args[0]); say(`${name} ${this.path}`); },
  onLeave(retval) { say(`${name} ${retval}`); scan(name); },
});

const boot = (stage = 'manual', params = {}) => {
  if (seen.has('boot')) return;
  seen.add('boot'); say(`boot ${stage} ${JSON.stringify(params)}`);
  ['dlopen', 'dlopen_ns', 'android_dlopen_ext'].forEach(load);

  hook('resolver:dlsym', sym('dlsym'), {
    onEnter(args) { this.symbol = read(args[1]) ?? '<null>'; },
    onLeave(retval) {
      if (!watch.has(this.symbol)) return;
      say(`dlsym("${this.symbol}") => ${retval}`);
      if (!retval.isNull()) scan(`dlsym:${this.symbol}`);
    },
  });

  scan(`boot:${stage}`);
  say(`loaded modules=${Process.enumerateModules().length}`);
};

setImmediate(() => boot('cli'));

rpc.exports = {
  init: boot,
  dispose() { say('dispose'); },
};
