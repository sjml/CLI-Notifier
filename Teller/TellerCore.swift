import Foundation
import UserNotifications

func PopNotification(title: String?, message: String?, delay: Double?, soundName: String?) {
    
    let content = UNMutableNotificationContent()
    content.title = title ?? ProcessInfo.processInfo.environment["PRODUCT_NAME"] ?? "Notification"
    content.body = message ?? ""
    if let soundId = soundName {
        let unSoundName = UNNotificationSoundName(soundId)
        let sound = UNNotificationSound(named: unSoundName)
        content.sound = sound
    }
    
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay ?? 5.0, repeats: false)
    let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
    UNUserNotificationCenter.current().add(request)
}

func AreNotificationsAuthorized() async -> Bool {
    let settings = await UNUserNotificationCenter.current().notificationSettings()
    return settings.authorizationStatus == .authorized
}

func RequestNotificationPermissions() async throws -> Bool {
    do {
        let granted = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound])
        return granted
    }
    catch {
        throw error
    }
}
