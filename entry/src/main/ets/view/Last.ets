import { common } from '@kit.AbilityKit';
import { SecondaryWant } from '../consts';
import { bark, catching, defer, defers } from '../patch';

@Entry
@Component
struct Last {
  private context = getContext(this) as common.UIAbilityContext;

  build() {
    Column({ space: 12 }) {
      Text(`🦀(Last)`).fontSize(28).fontWeight(FontWeight.Lighter)
    }.width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
