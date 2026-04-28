import { common } from '@kit.AbilityKit';
import { bark, catching, defer, defers } from '../patch';

@Entry
@Component
struct Last {
  private context = getContext(this) as common.UIAbilityContext;

  aboutToAppear(): void {
  }

  aboutToDisappear(): void {
  }

  build() {
    Column({ space: 12 }) {
      Text(`Last Page`).fontSize(22).fontWeight(FontWeight.Bold)
      Text(`playState: playstate`).fontSize(14)

      Button('Launch Immediately').width(240).onClick(async () => {
        catching(async () => {
          await this.context.startAbility({
            bundleName: "play.ground.distraction",
            abilityName: "SecondaryAbility"
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
            abilityName: "SecondaryAbility"
          }, {
            windowMode: 1,
          })
        })

      })
    }
    .width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
