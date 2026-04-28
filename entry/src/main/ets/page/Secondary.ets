import { common } from '@kit.AbilityKit';
import { bark, catching, defers } from '../patch';

@Entry
@Component
struct Secondary {
  private context = getContext(this) as common.UIAbilityContext;

  build() {
    Column({ space: 12 }) {
      Text(`Secondary Page`).fontSize(22).fontWeight(FontWeight.Bold)
      Button('Launch Immediately').width(240).onClick(async () => {
        catching(async () => {
          await this.context.startAbility({
            bundleName: "play.ground.distraction",
            abilityName: "LastAbility"
          }, {
            windowMode: 1,
          })
        })
      })

      Button('Launch After 10s').width(240).onClick(async () => {
        catching(async () => {
          await defers(10_000)
          bark(`start ability`)
          await this.context.startAbility({
            bundleName: "play.ground.distraction",
            abilityName: "LastAbility"
          }, {
            windowMode: 1,
          })
        })

      })
    }
    .width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
