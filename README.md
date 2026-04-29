# Rivercrab

HarmonyOS background-launch 探测工程。脚手架在 `main`,每条探测线开一个 `try/*` 分支独立保存代码与结论。

## 目标

寻找无用户交互即可从后台或被杀状态拉起 UIAbility 的系统路径。

判定一条路径是否「构成 bg-launch 漏洞」:

- 触发不依赖用户交互(排除通知点击、reminder 弹窗点击等)
- caller uid 是 system 或服务端不强制校验 caller 身份
- 实际能拉起 `SecondaryAbility` 或等价的 UI 入口

## 脚手架内容

- 三个 UIAbility:`DefaultAbility` / `SecondaryAbility` / `LastAbility`
- bundle name `rivercr.a.b`(满足 ≥3 段)
- `bark()` 日志辅助函数(走 hilog)

## 分支约定

| 分支 | 路径 | 状态 |
|---|---|---|
| `main` | 脚手架,无 probe 代码 | 基线 |
| `try/geolocation` | `geoLocationManager.gnssFenceStatusChange` + `geolocation.fenceStatusChange` | 模拟器不响应 mock 注入,真机才能验证 |
| `try/system-timer` | `@ohos.systemTimer` 通过 `requireNapi` 绕 SDK 白名单 | 服务端 11 处入口校验 system app,普通 hap `code=202` |
| `try/reminder` | `reminderAgentManager` | TBD |

每个 `try/*` 分支自带一份 README,记录:接口分析、绕过方法、服务端实现、实测日志、结论。

## 探测方法论

1. 读 `@ohos.<api>.d.ts`,看 `@systemapi` 标注与所需权限
2. SDK 隐藏的接口 → 用 `globalThis.requireNapi('<module>')` 绕开 ArkTS 白名单
3. 服务端实现读 `frameworks/<subsystem>/services/`,grep `CheckSystemUidCallingPermission` / `IsSystemAppByFullTokenID` / `VerifyAccessToken` / `IPCSkeleton::GetCallingTokenID` 等模式找校验入口
4. 写 demo 跑实际错误码与服务端代码路径对照
5. 结论写回该分支 README

## 待探测

- `commonEventManager` 静态订阅 + ExtensionAbility(SCREEN_ON / CONNECTIVITY_CHANGE 等)
- `WorkScheduler` + WorkSchedulerExtensionAbility 周期性拉起
- Push Kit 推送透传
- `continuationManager` 跨设备流转
