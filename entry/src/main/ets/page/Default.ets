import { common, WantAgent, wantAgent } from '@kit.AbilityKit';
import notificationManager from '@ohos.notificationManager';
import reminderAgentManager from '@ohos.reminderAgentManager';
import { wantFor } from '../platform';
import { bark, catching, defers } from '../patch';

const REMINDER_NOTIFICATION_ID = 5005;

@Entry
@Component
struct Default {
  private context = getContext(this) as common.UIAbilityContext;

  private async requestNeededPermissions(): Promise<void> {
    await notificationManager.requestEnableNotification(this.context);
    await reminderAgentManager.addNotificationSlot({
      notificationType: notificationManager.SlotType.CONTENT_INFORMATION,
      // notificationLevel: notificationManager.SlotLevel.LEVEL_LOW,
      // desc: '🦀',
      // badgeFlag: true,
      // vibrationEnabled: false,
    });
  }

  private async publish(delay: number): Promise<void> {
    const reminder: reminderAgentManager.ReminderRequestTimer = {
      reminderType: reminderAgentManager.ReminderType.REMINDER_TYPE_TIMER,
      triggerTimeInSeconds: delay,
      title: 'Rivercrab 🦀',
      content: 'Rivercrab<content>',
      ringDuration: 0,
      expiredContent: 'Rivercrab<expired>',
      snoozeContent: 'Rivercrab<snooze>',
      notificationId: REMINDER_NOTIFICATION_ID,
      slotType: notificationManager.SlotType.OTHER_TYPES,
      tapDismissed: false,
      autoDeletedTime: new Date().getTime() + 2,
      wantAgent: wantFor("Secondary")
    }

    const reminderId = await reminderAgentManager.publishReminder(reminder)
    bark(`publishReminder: reminderId=${reminderId}, notificationId=${REMINDER_NOTIFICATION_ID}`)
  }

  private async trigger(agent: WantAgent): Promise<void> {
    const bundleName = await wantAgent.getBundleName(agent)
    const operationType = await wantAgent.getOperationType(agent)
    const uid = await wantAgent.getUid(agent)
    bark(`trigger: ${[bundleName, operationType, uid]}`)

    wantAgent.trigger(agent, { code: 100 }, (err, data) => {
      bark(`trigger: ${JSON.stringify([err, data])}`)
    })
  }

  build() {
    Column({ space: 12 }) {
      Text(`🦀`).fontSize(30).fontWeight(FontWeight.Bold)
      Text('Background Ability Launch').fontSize(22).fontWeight(FontWeight.Normal)

      Button('Assault').width(280).onClick(async () => {
        catching(async () => {
          await this.requestNeededPermissions()
          await this.publish(1)
          await defers(2) // now we should got the notification
          const notifications = await notificationManager.getActiveNotifications();
          const agent = notifications.filter(it => it.id == REMINDER_NOTIFICATION_ID)?.[0].wantAgent
          if (!agent) {
            bark("notification not found")
            return
          }
          await notificationManager.cancel(REMINDER_NOTIFICATION_ID, "REMINDER_AGENT")
          await defers(10)
          await this.trigger(agent)
        })
      })
    }
    .width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
