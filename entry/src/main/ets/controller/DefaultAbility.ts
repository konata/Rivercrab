import { UIAbility } from '@kit.AbilityKit';
import { bark } from '../patch';
import window from '@ohos.window';
import { LastWant, SecondaryWant } from '../consts';
import { reminderAgent, reminderAgentManager } from '@kit.BackgroundTasksKit';
import notificationManager from '@ohos.notificationManager';

const CUSTOM_ACTION_BUTTON = 2;
const agent = (want: typeof SecondaryWant): any => ({
  pkgName: want.bundleName,
  abilityName: want.abilityName,
});

async function runProbe(name: string, fn: () => Promise<string>): Promise<string> {
  try {
    const result = await fn();
    bark(`[reminder] ${name}: ${result}`);
    return `${name}: ${result}`;
  } catch (e) {
    const result = `${name}: ${String(e)}`;
    bark(`[reminder] ${result}`);
    return result;
  }
}

const legacy = {
  async publishReminder(request: reminderAgent.ReminderRequest) {
    return await reminderAgent.publishReminder(request)
  },
  async cancelReminder(reminderId: number) {
    return await reminderAgent.cancelReminder(reminderId)
  },
  async getValidReminders() {
    return await reminderAgent.getValidReminders()
  },
  async cancelAllReminders() {
    return await reminderAgent.cancelAllReminders()
  },
  async addNotificationSlot(slot: NotificationSlot) {
    return await reminderAgent.addNotificationSlot(slot)
  }
}


export async function requestEnableNotification(): Promise<string> {
  return runProbe('requestEnableNotification', async () => {
    await notificationManager.requestEnableNotification();
    return 'ok';
  });
}

export async function legacyPublishReminderWantAgent(): Promise<string> {
  return runProbe('reminderAgent.publishReminder wantAgent', async () => {
    const id = await reminderAgent.publishReminder({
      reminderType: reminderAgent.ReminderType.REMINDER_TYPE_TIMER,
      triggerTimeInSeconds: 10,
      title: 'legacy wantAgent',
      content: 'trigger in 10s',
      notificationId: 41001,
      wantAgent: agent(SecondaryWant),
    } as any);
    return `reminderId=${id}`;
  });
}

export async function legacyPublishReminderMaxScreenWantAgent(): Promise<string> {
  return runProbe('reminderAgent.publishReminder maxScreenWantAgent', async () => {
    const id = await reminderAgent.publishReminder({
      reminderType: reminderAgent.ReminderType.REMINDER_TYPE_TIMER,
      triggerTimeInSeconds: 10,
      title: 'legacy maxScreenWantAgent',
      content: 'trigger in 10s',
      notificationId: 41002,
      maxScreenWantAgent: agent(SecondaryWant),
    } as any);
    return `reminderId=${id}`;
  });
}

export async function publishReminderWantAgent(): Promise<string> {
  return runProbe('reminderAgentManager.publishReminder wantAgent', async () => {
    const id = await reminderAgentManager.publishReminder({
      reminderType: reminderAgentManager.ReminderType.REMINDER_TYPE_TIMER,
      triggerTimeInSeconds: 10,
      title: 'manager wantAgent',
      content: 'trigger in 10s',
      notificationId: 42001,
      wantAgent: agent(SecondaryWant),
    } as any);
    return `reminderId=${id}`;
  });
}

export async function publishReminderWantAndMax(): Promise<string> {
  return runProbe('reminderAgentManager.publishReminder wantAgent+maxScreenWantAgent', async () => {
    const now = new Date(Date.now() + 60_000);
    const id = await reminderAgentManager.publishReminder({
      reminderType: reminderAgentManager.ReminderType.REMINDER_TYPE_ALARM,
      hour: now.getHours(),
      minute: now.getMinutes(),
      title: 'manager want+max',
      content: 'alarm trigger',
      notificationId: 42002,
      wantAgent: agent(SecondaryWant),
      maxScreenWantAgent: agent(LastWant),
    } as any);
    return `reminderId=${id}`;
  });
}

export async function publishReminderActionButtonCustomWantAgent(): Promise<string> {
  return runProbe('reminderAgentManager.publishReminder actionButton.custom.wantAgent', async () => {
    const req: any = {
      reminderType: reminderAgentManager.ReminderType.REMINDER_TYPE_TIMER,
      triggerTimeInSeconds: 10,
      title: 'manager actionButton.custom.wantAgent',
      content: 'trigger in 10s',
      notificationId: 42004,
      wantAgent: agent(SecondaryWant),
      actionButton: [{ title: 'Open Last', type: CUSTOM_ACTION_BUTTON, wantAgent: agent(LastWant) }],
    };
    const id = await reminderAgentManager.publishReminder(req);
    return `reminderId=${id}`;
  });
}

export async function publishReminderRRuleWantAgent(): Promise<string> {
  return runProbe('reminderAgentManager.publishReminder rruleWantAgent', async () => {
    const now = new Date(Date.now() + 60_000);
    const req: any = {
      reminderType: reminderAgentManager.ReminderType.REMINDER_TYPE_CALENDAR,
      dateTime: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
      },
      title: 'manager rruleWantAgent',
      content: 'calendar trigger',
      notificationId: 42005,
      wantAgent: agent(SecondaryWant),
      rruleWantAgent: agent(LastWant),
    };
    const id = await reminderAgentManager.publishReminder(req);
    return `reminderId=${id}`;
  });
}

export async function getValidReminders(): Promise<string> {
  return runProbe('getValidReminders', async () => {
    const legacy = await reminderAgent.getValidReminders();
    const manager = await reminderAgentManager.getValidReminders();
    return `reminderAgent: ${legacy.length} | reminderAgentManager: ${manager.length}`;
  });
}

export async function cancelAllReminders(): Promise<string> {
  return runProbe('cancelAllReminders', async () => {
    await reminderAgent.cancelAllReminders();
    await reminderAgentManager.cancelAllReminders();
    return 'canceled';
  });
}

export default class DefaultAbility extends UIAbility {
  override onWindowStageCreate(windowStage: window.WindowStage): void {
    super.onWindowStageCreate(windowStage);
    bark("onWindowStageCreate")
    windowStage.loadContent("page/Default", err => {
      bark(`loadContent, ${err.message ?? "message"} ${err.name ?? 'name?'} ${err.stack ?? 'stack?'}}`)
    })
  }

  override async onWillBackground(): Promise<void> {
    bark(`Default: onWillBackground`)
    super.onWillBackground();
    await this.context.startAbility(LastWant)
  }
}
