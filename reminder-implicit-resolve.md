# reminderAgent implicit resolve 结论

## 目标场景

`wantAgent.pkgName` 为 `null` 或无法解析为字符串，但 `wantAgent.abilityName` 非空。

在 NAPI 路径中，`pkgName: null` 会导致 `GetStringUtf8()` 返回 `false`，但 `GenWantAgent()` 不返回错误，因此 native 侧结果等价于：

```cpp
wantAgentInfo->pkgName == "";
wantAgentInfo->abilityName == "<caller supplied abilityName>";
```

ANI/ArkTS 强类型路径中，`pkgName` 是 `string`，`null` 理论上不应进入正常 native 逻辑。

## reminder service 启动身份

点击 reminder 后，reminder service 使用自己的 token 发起启动：

```cpp
AppExecFwk::ElementName element("", wantInfo->pkgName, wantInfo->abilityName);
abilityWant.SetElement(element);
uint32_t specifyTokenId = static_cast<uint32_t>(IPCSkeleton::GetSelfTokenID());
client->StartAbilityOnlyUIAbility(abilityWant, nullptr, specifyTokenId);
```

来源：

`notification_distributed_notification_service/services/reminder/src/reminder_data_manager.cpp`

`StartAbilityOnlyUIAbility()` 在 AAMS 侧要求 IPC caller 是 `FOUNDATION_UID`：

```cpp
if (IPCSkeleton::GetCallingUid() != FOUNDATION_UID) {
    return CHECK_PERMISSION_FAILED;
}
```

来源：

`ability_ability_runtime/services/abilitymgr/src/ability_manager_service.cpp`

因此该启动链路不是应用自身直接调用 AAMS，而是 reminder service/foundation 路径调用 AAMS，并传入 reminder service 的 `specifyTokenId`。

## AAMS 到 BMS 的 resolve 链路

主要链路：

```text
ReminderDataManager::ClickReminder
  -> AbilityManagerClient::StartAbilityOnlyUIAbility
  -> AbilityManagerService::StartAbilityOnlyUIAbility
  -> StartAbilityWrap
  -> StartAbilityInner
  -> GenerateAbilityRequest
  -> StartAbilityInfo::CreateStartAbilityInfo
  -> BundleMgrHelper::QueryAbilityInfo
  -> BundleDataMgr::QueryAbilityInfo
```

`BundleDataMgr::QueryAbilityInfo()` 的分支条件是：

```cpp
if (!bundleName.empty() && !abilityName.empty()) {
    ExplicitQueryAbilityInfo(...);
} else {
    ImplicitQueryAbilityInfos(...);
}
```

来源：

`bundlemanager_bundle_framework/services/bundlemgr/src/bundle_data_mgr.cpp`

因此 `bundleName/pkgName` 为空、`abilityName` 非空时，不会走 explicit query，而是进入 implicit query。

## 是否会按 abilityName 跨 bundle resolve

不会。

`ImplicitQueryAbilityInfos()` 的参数有效性检查只看：

```cpp
want.GetAction()
want.GetEntities()
want.GetUriString()
want.GetType()
want.GetStringParam(LINK_FEATURE)
```

不看 `abilityName`。

如果 `action/entities/uri/type/linkFeature` 全部为空，即使 `abilityName` 非空，也会直接返回失败：

```cpp
return false;
```

因此只有 `abilityName` 时，最终应表现为 resolve 失败，AAMS 返回 `RESOLVE_ABILITY_ERR` 一类错误。

## 何时可能 resolve 到其他 bundle

如果 `pkgName` 为空，同时 Want 中带了可用于 implicit resolve 的条件，例如：

```text
action
entities
uri
type
LINK_FEATURE
```

则 BMS 会进入全局 implicit query：

```cpp
if (!bundleName.empty()) {
    ImplicitQueryCurAbilityInfos(...);
} else {
    ImplicitQueryAllAbilityInfos(...);
}
```

这种情况下可能 resolve 到其他 bundle。

但匹配依据是 implicit skill 条件，不是 `abilityName`。`abilityName` 不构成跨 bundle 按名查找条件。

## reminder WantAgent 可控字段

当前 reminder SDK 的 `WantAgent` 定义只包含：

```ts
interface WantAgent {
  pkgName: string;
  abilityName: string;
  uri?: string;
  parameters?: Record<string, Object>;
}
```

native 解析也只读取：

```cpp
pkgName
abilityName
uri
parameters
```

点击时构造最终 `Want` 的逻辑是：

```cpp
abilityWant.SetElement(element);
abilityWant.SetUri(wantInfo->uri);
abilityWant.SetParams(wantInfo->parameters);
```

因此，当前接口可以直接控制：

```text
pkgName
abilityName
uri
parameters
```

不能通过 reminder `WantAgent` 直接控制：

```text
action
entities
type
```

`uri` 可以被带入最终 `Want`，因此 `pkgName == ""` 且 `uri` 非空时，会满足 BMS implicit query 的有效性条件之一，有机会进入全局 implicit resolve。

`LINK_FEATURE` 需要单独确认：BMS 检查的是 `want.GetStringParam(LINK_FEATURE)`。由于 reminder 会执行 `abilityWant.SetParams(wantInfo->parameters)`，如果 `parameters` 中能写入与源码 `LINK_FEATURE` 常量相同的 key，并且 `GetStringParam()` 能读取到该值，则理论上可能触发该条件。但这部分尚未从源码继续确认常量字符串和参数类型转换细节。

## 最终结论

1. `pkgName == null/""` 且仅 `abilityName` 非空：不会按 `abilityName` 跨 bundle 搜索，预期 resolve 失败。
2. `pkgName == null/""` 且带有 implicit 条件：会走全局 implicit resolve，可能匹配到其他 bundle。
3. 该启动链路由 reminder service/foundation 调用 AAMS，并传入 reminder service 的 token；不是应用自身直接启动。
4. reminder service 不会把空 `pkgName` 自动补成调用方 bundle。调用方 bundle 只用于 reminder 归属和 uid 初始化，不用于修正 `wantAgentInfo->pkgName`。
5. 当前 reminder `WantAgent` 能直接带入 implicit resolve 条件的字段主要是 `uri`；`action/entities/type` 不能直接从该接口填入。
