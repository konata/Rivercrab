import { UIAbility } from '@kit.AbilityKit';
import { bark } from '../patch';
import window from '@ohos.window';

export default class DefaultAbility extends UIAbility {
  override async onWindowStageCreate(windowStage: window.WindowStage) {
    super.onWindowStageCreate(windowStage);
    bark("onWindowStageCreate")
    await windowStage.loadContent("view/Default")
  }
}