### App 创建 reminderRequest

ReminderRequest 里面的参数全部都是 WantAgentInfo, 而不是 Want 或者 WantAgent, WantAgentInfo 里面的 want 本身是可以带 uri
和 flag 的

### Reminder Service

只是用对应的数据创建 NotificationRequest
NotificationRequest {
UpdateNotificationWantAgent() {
.wantAgent = 这里 create 的时候根本没用 WantAgentInfo 里面的 element, 而是仅仅设置了action 为
`REMINDER_EVENT_CLICK_ALERT` 的 CommonEvent, 注册了可以回调的广播, 从里面拿到对应的 reminderId 和相关数据
}
}

之后从 reminderId 找出了 ReminderRequest, 取出 WantAgentInfo, 做简单的判断后, 设置了 element, uri, param, 但是并没有读取
want 里面的 flag, 之后直接用 `StartAbilityOnlyUIAbility` 来启动对应的 UIAbility

