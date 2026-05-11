import { UIAbility } from "@kit.AbilityKit";
import { bark } from "../patch";
import { window } from "@kit.ArkUI";

export class DefaultAbility extends UIAbility {
  override async onWindowStageCreate(windowStage: window.WindowStage) {
    bark(`DefaultAbility:onWindowStageCreate`)
    super.onWindowStageCreate(windowStage);
    bark("onWindowStageCreate")
    await windowStage.loadContent("view/Default")
  }
}