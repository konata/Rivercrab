import { UIAbility } from '@kit.AbilityKit';
import { bark } from '../patch';
import window from '@ohos.window';
import { LastWant } from '../platform';

export default class DefaultAbility extends UIAbility {
  override onWindowStageCreate(windowStage: window.WindowStage): void {
    super.onWindowStageCreate(windowStage);
    bark("onWindowStageCreate")
    windowStage.loadContent("page/Default", err => {
      bark(`loadContent, ${err.message ?? "message"} ${err.name ?? 'name?'} ${err.stack ?? 'stack?'}}`)
    })
  }

  override async onWillBackground(): Promise<void> {
    bark(`Default: onWillBackground`)
    super.onWillBackground();
    await this.context.startAbility(LastWant)
  }
}