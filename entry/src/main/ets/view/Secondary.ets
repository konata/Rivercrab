import { common } from '@kit.AbilityKit';

@Entry
@Component
struct Secondary {
  private context = getContext(this) as common.UIAbilityContext;

  build() {
    Column({ space: 12 }) {
      Text(`🦀(Secondary)`).fontSize(28).fontWeight(FontWeight.Lighter)
    }.width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
