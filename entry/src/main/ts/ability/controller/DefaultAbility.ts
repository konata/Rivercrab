import { AbilityConstant, ConfigurationConstant, UIAbility, Want } from "@kit.AbilityKit";
import { bark } from "../../patch";
import window from "@ohos.window";

export default class DefaultAbility extends UIAbility {
  override onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    bark("onCreate")
    this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET)
  }

  override onDestroy(): void | Promise<void> {
    bark(`onDestroy`)
  }

  override onWindowStageCreate(windowStage: window.WindowStage): void {
    super.onWindowStageCreate(windowStage);
    bark("onWindowStageCreate")
    windowStage.loadContent("pages/Index", err => {
      bark(`loadContent, ${err.message ?? "message"} ${err.name ?? 'name?'} ${err.stack ?? 'stack?'}}`)
    })
  }

  override onForeground(): void {
    bark("onForeground")
  }

  override onBackground(): void {
    bark("onBackground")
  }
}