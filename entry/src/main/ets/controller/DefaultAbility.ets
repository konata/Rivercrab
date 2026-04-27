import { UIAbility } from '@kit.AbilityKit';
import window from '@ohos.window';


export default class DefaultAbility extends UIAbility {
  override onWindowStageCreate(windowStage: window.WindowStage): void {
    super.onWindowStageCreate(windowStage);
    windowStage.loadContent("pages/Index", () => {
    })
  }
}