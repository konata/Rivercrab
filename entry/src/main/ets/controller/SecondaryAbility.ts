import { UIAbility } from "@kit.AbilityKit";
import window from "@ohos.window";
import { bark } from "../patch";


export default class SecondaryAbility extends UIAbility {
  override async onWindowStageCreate(windowStage: window.WindowStage) {
    super.onWindowStageCreate(windowStage)
    bark("onWindowStageCreate@SecondaryAbility")
    windowStage.loadContent("view/Secondary")
  }
}
