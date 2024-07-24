import SwiftUI
import UserNotifications

struct TellerApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            PermissionsView()
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate {
    func applicationDidFinishLaunching(_ note: Notification) {
        // eventually might want to have some kind of response when the user clicks the notification,
        //   but right now just shut down immediately, because there's no point in showing the stub app
        let resp = note.userInfo?[NSApplication.launchUserNotificationUserInfoKey] as? UNNotificationResponse
        if resp != nil {
            NSApp.terminate(self)
        }

        // this might be important at some point? doesn't seem necessary with what we're doing...
        // UNUserNotificationCenter.current().delegate = self
    }
}
