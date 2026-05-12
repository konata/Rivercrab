# Frida Gadget 接入记录

## 当前状态

Rivercrab 已经接入一条可运行的 Frida Gadget POC 链路：

- App 启动时先进入模块级 `AbilityStage`。
- `AbilityStage` 通过 `libcrab.so` 显式 `dlopen("libgadget.so")`。
- `libcrab.so` 通过环境变量 `FRIDA_GADGET_CONFIG` 把 script 配置传给 Gadget。
- `agent.js` 从 rawfile 写入 `filesDir/frida/agent.js`，Gadget 再按绝对路径加载。
- JS agent 已经能执行，并能通过 `send()` 进入 hilog。
- `dlopen` / `dlopen_ns` / `dlsym` 已经验证能 attach。
- 后续 framework/client 侧 so 加载能被打印出来。

当前 POC 不处理多进程、不处理 system/server 进程、不处理 ABC/ArkTS 函数级 hook。

## App 侧接入

新增模块级启动入口：

- `entry/src/main/ets/stage/AbilityStage.ts`
- `entry/src/main/module.json5` 里的 `module.srcEntry`

新增 native bridge：

- `entry/src/main/cpp/crab.cpp`
- so 名字是 `libcrab.so`
- 暴露 `bootstrap()` 和 `status()`
- `bootstrap()` 做两件事：设置 `FRIDA_GADGET_CONFIG`，然后 `dlopen("libgadget.so")`

新增 CMake 打包：

- `entry/src/main/cpp/CMakeLists.txt`
- 把 `entry/src/main/cpp/frida/libgadget.so` 带进 HAP 的 `libs/arm64-v8a/`

新增 agent：

- `entry/src/main/resources/rawfile/frida/agent.js`
- 当前只做 loader/resolver 观察
- 后面具体 framework hook 继续往这里加

## 试过的方案

官方 `linux-arm64-musl` Gadget：

- 能打进包。
- 运行时在 `libgadget.so` 初始化早期 `SIGSEGV`。
- 不适合当前 OHOS 6 emulator。

官方 `android-arm64` Gadget：

- 也能打进包。
- 崩溃栈和官方 musl 版很接近。
- 基本排除官方预编译 Gadget 可直接使用的可能。

自编 Frida Gadget：

- 一开始卡在 OHOS `bpf` 头文件和 Frida `libbpf` 依赖不匹配。
- 没有修 OHOS bpf 头，而是裁掉当前 POC 不需要的 Frida feature。
- 关闭了 `frida-core:local_backend`，从构建图里绕开 `libbpf`。
- 同时关闭了 `server` / `inject` / `portal` / `connectivity` / `droidy_backend` / `fruity_backend`。
- 成功产出 OHOS 用的 `frida-gadget.so`。

Gadget runtime 兼容处理：

- 加了 OHOS hilog 输出桥，方便看到 Gadget 内部日志。
- 临时关闭 `Gum.Exceptor`，绕开 OHOS 上早期 exceptor 初始化问题。
- 修过 `ExitMonitor` 对空 export attach 的问题。
- 修过 musl module registry 在 OHOS 上获取 module handle 的问题。
- 让 Gadget 在非 Android 宏路径下也能读取 OHOS 场景需要的配置。
- 最终改为通过 `FRIDA_GADGET_CONFIG` 直接传配置，避免伪 `.config.so` 被 hvigor 当 native library strip。

配置/打包路线尝试：

- 试过 `libgadget.config.so`。
- 试过把 `agent.js` 伪装成 `libagent.so`。
- 这两种都会被 hvigor 当 `.so` strip，虽然能成功打包，但日志很脏。
- 当前路线只把真正的 `libgadget.so` 放 native lib 目录，`agent.js` 作为 rawfile。

JS API 兼容：

- `Module.findExportByName(null, name)` 在当前 Frida JS runtime 里不可用。
- 已改成 `Module.findGlobalExportByName(name)`。

## 已验证

构建：

- `hvigorw clean --no-daemon` 成功。
- `hvigorw assembleApp --no-daemon` 成功。
- HAP 里 native lib 目录只保留真正的 `libgadget.so`。
- rawfile 里只保留 `agent.js` 和说明文件。

安装启动：

- 安装前先 `hdc uninstall rivercr.a.b`。
- 再 `hdc install entry-default-unsigned.hap`。
- 再 `hdc shell aa start -a DefaultAbility -b rivercr.a.b`。

运行结果：

- `AbilityStage` 能加载 `libcrab.so`。
- `crab.bootstrap()` 能加载 `libgadget.so`。
- Gadget 能读取 script 配置。
- Gadget 能加载 `filesDir/frida/agent.js`。
- agent 能执行 `rpc.exports.init()`。
- hilog 能看到 `agent:boot early`。
- hilog 能看到 `agent:hook dlopen ...`。
- hilog 能看到 `agent:hook dlopen_ns ...`。
- hilog 能看到 `agent:hook dlsym ...`。
- 后续 `dlopen` 能打印 framework/client 侧 so 加载。

观察到的 so 包括：

- `libgamecontroller_event.z.so`
- `libark_connect_inspector.z.so`
- `libframe_ui_intf.z.so`
- `libace_compatible.z.so`
- `libha_ace_engine.z.so`
- `libressched_client.z.so`

## 还剩的问题

Frida 源码 patch 还没有整理成正式补丁：

- 现在 app 工程只保存了编好的 `libgadget.so`。
- Frida 源码树里的 OHOS 兼容修改还需要单独收敛。
- 后面应该把这些改动整理成小 patch，避免只剩一个二进制结果。

agent 还只是 POC：

- 当前只 hook loader/resolver。
- 还没补具体 framework client API hook。
- 还没有 hook spec DSL。
- 还没有统一参数打印、返回值打印和过滤规则。

日志还比较粗：

- `dlopen` 数量会很多。
- 后面需要按 so 名、符号名、调用阶段过滤。

ArkTS 还有 warning：

- `libcrab.so` 的类型声明已有初稿，但当前 SDK 仍提示 NAPI module 未验证。
- `AbilityStage.ts` 文件操作会被提示可能 throw。
- 当前为了启动链路简单，暂时没有加大段 try/catch。

热启动/重复启动：

- 之前遇到过 `filesDir/frida` 已存在导致 `File exists`。
- 当前代码已经改成先 `fs.accessSync(home)`，不存在时再 `fs.mkdirSync(home)`。
- 本次 `clean -> assemble -> uninstall -> install -> start` 验证没有复现。
- 后面继续观察更多热启动场景。

## 常用验证命令

```sh
/Users/natsuki/Harmony/command-line-tools/bin/hvigorw clean --no-daemon
/Users/natsuki/Harmony/command-line-tools/bin/hvigorw assembleApp --no-daemon

hdc uninstall rivercr.a.b
hdc install entry/build/default/outputs/default/entry-default-unsigned.hap
hdc shell "hilog -r"
hdc shell aa start -a DefaultAbility -b rivercr.a.b
hdc shell "hilog -x -e 'crab:|agent:|AbilityStage|bootstrap|dlopen|dlsym'"
```
