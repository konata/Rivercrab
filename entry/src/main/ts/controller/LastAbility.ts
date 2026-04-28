import { AbilityConstant, ConfigurationConstant, UIAbility, Want } from "@kit.AbilityKit";
import { bark } from "../patch";
import window from "@ohos.window";

export default class LastAbility extends UIAbility {
  override onWindowStageCreate(windowStage: window.WindowStage): void {
    super.onWindowStageCreate(windowStage);
    bark("onWindowStageCreate")
    windowStage.loadContent("Last", err => {
      bark(`loadContent, ${err.message ?? "message"} ${err.name ?? 'name?'} ${err.stack ?? 'stack?'}}`)
    })
  }
}