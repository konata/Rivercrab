# Frida Scaffold

关键文件：

- `entry/src/main/ets/stage/AbilityStage.ts`
- `entry/src/main/cpp/crab.cpp`
- `entry/src/main/cpp/frida/libgadget.so`
- `entry/src/main/resources/rawfile/frida/agent.js`

加载链：

1. `AbilityStage.ts` 顶层 `import 'libcrab.so'`
2. `AbilityStage` 把 `rawfile/frida/agent.js` 写到 `filesDir/frida/agent.js`
3. `crab.bootstrap("libgadget.so", config)` 把配置塞进环境变量
4. `libgadget.so` constructor 读取配置并启动 script

当前 agent 先盯 `dlopen` / `dlopen_ns` / `android_dlopen_ext` / `dlsym`。
