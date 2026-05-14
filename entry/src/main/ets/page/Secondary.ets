@Entry
@Component
struct Secondary {
  build() {
    Column({ space: 12 }) {
      Text(`🦀`).fontSize(30).fontWeight(FontWeight.Bold)
      Text(`Showcasing...`).fontSize(22).fontWeight(FontWeight.Normal)
    }.width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
