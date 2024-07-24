import Foundation
import UserNotifications
import ArgumentParser

enum TellerValidSounds: String, CaseIterable, ExpressibleByArgument {
    case Basso
    case Blow
    case Bottle
    case Frog
    case Funk
    case Glass
    case Hero
    case Morse
    case Ping
    case Pop
    case Purr
    case Sosumi
    case Submarine
    case Tink
}

func PopNotification(title: String?, message: String?, delay: Double?, soundName: String?) {
    let content = UNMutableNotificationContent()
    content.title = title ?? "Teller"
    content.body = message ?? ""
    if let soundId = soundName {
        if FileManager().fileExists(atPath: "/System/Library/Sounds/\(soundId).aiff") {
            let unSoundName = UNNotificationSoundName(soundId)
            let sound = UNNotificationSound(named: unSoundName)
            content.sound = sound
        }
        else {
            fputs("Invalid sound: \(soundId)\nMust be one of (\(TellerValidSounds.allValueStrings.joined(separator: ", ")))\n", stderr)
        }
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
