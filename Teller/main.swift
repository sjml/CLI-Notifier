import Foundation
import AppKit
import ArgumentParser


if ProcessInfo.processInfo.environment["TERM_PROGRAM"] != nil {
//    print("Running in terminal...")
    let authed = await AreNotificationsAuthorized()
    if !authed {
        print("Trying to request notification authorization...")
        var granted = false
        var errText: String? = nil
        do {
            granted = try await RequestNotificationPermissions()
        }
        catch {
            errText = error.localizedDescription
        }
        if !granted {
            print("Whoops! You don’t have notification permission with this app.\nCheck the Settings app to turn them on!\n\nFor the record, the error received was: \(errText ?? "[none]")")
            exit(EXIT_FAILURE)
        }
    }
    NotificationPopper.main()
}
else {
//    print("Running normally...")
    DispatchQueue.main.async {
        let app = NSApplication.shared
        app.setActivationPolicy(.regular)
        app.activate(ignoringOtherApps: true)
    }

    TellerApp.main()
}


struct NotificationPopper : ParsableCommand {
    static var configuration = CommandConfiguration(
        commandName: ProcessInfo.processInfo.processName,
        abstract: "pops notifications from the command line"
    )

    @Option(help: "main body of the notification")
    var message: String

    @Option(help: "bold string at the top of the notification")
    var title: String = "Teller Notification"

    @Option(help: "delay between calling this program and the notification appearing")
    var delay: Double = 0.1

    @Option(help: "the name of the sound to play; must be one of (\(TellerValidSounds.allValueStrings.joined(separator: ", "))), a.k.a. the ones in </System/Library/Sounds>.")
    var sound: String?

    mutating func validate() throws {
        guard delay > 0.0 else {
            throw ValidationError("`--delay` value must be greater than 0.0")
        }
    }

    mutating func run() throws {
        PopNotification(title: title, message: message, delay: delay, soundName: sound)
    }
}
