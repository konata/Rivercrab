import { common } from '@kit.AbilityKit';
import { MediaSession, PlayState } from '../avsession/MediaSession';

@Entry
@Component
struct Index {
  @State status: string = 'idle';
  @State playState: PlayState = 'stopped';

  aboutToAppear(): void {
  }

  aboutToDisappear(): void {
  }

  build() {
    Column({ space: 12 }) {
      Text(`AVSession Sample`).fontSize(22).fontWeight(FontWeight.Bold)
      Text(`status: status`).fontSize(14)
      Text(`playState: playstate`).fontSize(14)


      Button('Launch Immediately').width(240).onClick(async () => {


      })

      Button('Launch After 10s').width(240).onClick(async () => {


      })

      Text('激活后,下拉控制中心应出现媒体卡片,点击卡片会通过\nsetLaunchAbility 登记的 WantAgent 拉回本页。')
        .fontSize(12)
        .margin({ top: 20 })
    }
    .width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
