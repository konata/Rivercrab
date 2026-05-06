import { common } from '@kit.AbilityKit';
import {
  cancelAllReminders,
  getValidReminders,
  legacyPublishReminderMaxScreenWantAgent,
  legacyPublishReminderWantAgent,
  publishReminderActionButtonCustomWantAgent,
  publishReminderRRuleWantAgent,
  publishReminderWantAgent,
  publishReminderWantAndMax,
  requestEnableNotification,
} from '../controller/DefaultAbility';

@Entry
@Component
struct Default {
  private context = getContext(this) as common.UIAbilityContext;
  @State private lastResult: string = 'idle';

  build() {
    Scroll() {
      Column({ space: 12 }) {
        Text(`reminderAgent probe`).fontSize(16).fontWeight(FontWeight.Bold)
        Text(this.lastResult).fontSize(12).width(280).maxLines(4)

        Button('Request Notification').width(240).onClick(async () => {
          await this.runProbe(requestEnableNotification)
        })

        Button('legacy wantAgent').width(240).onClick(async () => {
          await this.runProbe(legacyPublishReminderWantAgent)
        })

        Button('legacy maxScreen').width(240).onClick(async () => {
          await this.runProbe(legacyPublishReminderMaxScreenWantAgent)
        })

        Button('manager wantAgent').width(240).onClick(async () => {
          await this.runProbe(publishReminderWantAgent)
        })

        Button('manager want+max').width(240).onClick(async () => {
          await this.runProbe(publishReminderWantAndMax)
        })

        Button('manager custom agent').width(240).onClick(async () => {
          await this.runProbe(publishReminderActionButtonCustomWantAgent)
        })

        Button('manager rrule agent').width(240).onClick(async () => {
          await this.runProbe(publishReminderRRuleWantAgent)
        })

        Button('Valid Count').width(240).onClick(async () => {
          await this.runProbe(getValidReminders)
        })

        Button('Cancel All').width(240).onClick(async () => {
          await this.runProbe(cancelAllReminders)
        })
      }
      .width('100%')
      .padding(24)
      .justifyContent(FlexAlign.Center)
    }
    .width('100%').height('100%')
  }

  private async runProbe(fn: () => Promise<string>): Promise<void> {
    this.lastResult = await fn();
  }
}
