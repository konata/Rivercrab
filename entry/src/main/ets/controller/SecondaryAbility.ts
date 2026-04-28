import { UIAbility } from "@kit.AbilityKit";
import window from "@ohos.window";
import { bark } from "../patch";


export default class SecondaryAbility extends UIAbility {
  override onWindowStageCreate(windowStage: window.WindowStage): void {
    super.onWindowStageCreate(windowStage)
    bark("onWindowStageCreate@SecondaryAbility")
    windowStage.loadContent("page/Secondary", err => {
      bark(`loadContent,code:${err.code}, message:${err.message}, name:${err.name} stack:${err.stack}`)
    })
  }
}
