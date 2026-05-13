import { UIAbility } from "@kit.AbilityKit"
import { window } from "@kit.ArkUI"
import { bark } from "../patch"

export class SecondaryAbility extends UIAbility {
  override async onWindowStageCreate(windowStage: window.WindowStage) {
    super.onWindowStageCreate(windowStage)
    bark("onWindowStageCreate@SecondaryAbility")
    windowStage.loadContent("view/Secondary")
  }
}

