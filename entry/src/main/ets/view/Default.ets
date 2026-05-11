import { common } from '@kit.AbilityKit';
import { SecondaryWant } from '../consts';
import { bark, catching, defer, defers } from '../patch';

@Entry
@Component
struct Default {
  private context = getContext(this) as common.UIAbilityContext;

  build() {
    Column({ space: 12 }) {
      Text(`🦀(Primary)`).fontSize(28).fontWeight(FontWeight.Lighter)
      Button('Launch Secondary').width(240).onClick(async () => {
        catching(async () => {
          await this.context.startAbility(SecondaryWant, { windowMode: 1, })
        })
      })
    }
    .width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
