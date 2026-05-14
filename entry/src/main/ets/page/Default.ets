import { common, wantAgent } from '@kit.AbilityKit';
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
      notificationType: notificationManager.SlotType.SERVICE_INFORMATION,
      notificationLevel: notificationManager.SlotLevel.LEVEL_HIGH,
      desc: '🦀',
      badgeFlag: true,
      vibrationEnabled: true,
    });
  }

  private async publish(delay: number): Promise<void> {
    const reminder: reminderAgentManager.ReminderRequestTimer = {
      reminderType: reminderAgentManager.ReminderType.REMINDER_TYPE_TIMER,
      triggerTimeInSeconds: delay,
      title: 'Rivercrab 🦀',
      content: 'Rivercrab<content>',
      expiredContent: 'Rivercrab<expired>',
      snoozeContent: 'Rivercrab<snooze>',
      notificationId: REMINDER_NOTIFICATION_ID,
      slotType: notificationManager.SlotType.SERVICE_INFORMATION,
      tapDismissed: false,
      autoDeletedTime: new Date().getTime() + 2,
      wantAgent: wantFor("Secondary")
    }

    const reminderId = await reminderAgentManager.publishReminder(reminder)
    bark(`publishReminder: reminderId=${reminderId}, notificationId=${REMINDER_NOTIFICATION_ID}`)
  }

  private async trigger(): Promise<void> {
    const notifications = await notificationManager.getActiveNotifications();
    const agent = notifications.filter(it => it.id == REMINDER_NOTIFICATION_ID)?.[0].wantAgent
    if (agent) {
      const bundleName = await wantAgent.getBundleName(agent)
      const operationType = await wantAgent.getOperationType(agent)
      const uid = await wantAgent.getUid(agent)
      bark(`trigger: ${[bundleName, operationType, uid]}`)


      wantAgent.trigger(agent, { code: 100 }, (err, data) => {
        bark(`trigger: ${JSON.stringify([err, data])}`)
      })
    } else {
      bark("trigger: notification -> agent -> not found")
    }
  }

  build() {
    Column({ space: 12 }) {
      Text(`🦀`).fontSize(30).fontWeight(FontWeight.Bold)
      Text('Background Ability Launch').fontSize(22).fontWeight(FontWeight.Normal)

      Button('Assault').width(280).onClick(async () => {
        catching(async () => {
          await this.requestNeededPermissions()
          await this.publish(1)
          await defers(20)
          await this.trigger()
        })
      })
    }
    .width('100%').height('100%').padding(24).justifyContent(FlexAlign.Center)
  }
}
