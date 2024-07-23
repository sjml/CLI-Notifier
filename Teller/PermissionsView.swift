import SwiftUI
import UserNotifications
import UniformTypeIdentifiers

func urlForAsset(name: String) -> URL? {
    let fm = FileManager.default
    guard let cacheDirectory = fm.urls(for: .cachesDirectory, in: .userDomainMask).first else { return nil }
    let url = cacheDirectory.appendingPathComponent("\(name).png")
    let path = url.path
    if !fm.fileExists(atPath: path) {
        guard let raw = NSDataAsset(name: name) else { return nil }
        fm.createFile(atPath: path, contents: raw.data)
    }
    return url
}

struct PermissionsView: View {
    @State var isAuthorized: Bool = false
    @State var errText: String = ""
    
    var body: some View {
        VStack {
            if (isAuthorized) {
                Text("This app is already authorized. You’re good!")
                Button("Quit") {
                    NSApp.terminate(nil)
                }
                Button("Show Notification Plz") {
                    let content = UNMutableNotificationContent()
                    content.title = "Success"
                    content.subtitle = "Something longer here?"
                    content.sound = UNNotificationSound.default
                    
//                    if let successUrl = urlForAsset(name: "SuccessIcon") {
//                        do {
//                          let attach = try UNNotificationAttachment(identifier: "NotificationIcon", url: successUrl, options: [UNNotificationAttachmentOptionsTypeHintKey: UTType.png])
//                           content.attachments = [attach]
//                        }
//                        catch let error {
//                            // just don't bother, but log what happened
//                            print("ERROR trying to load icon: \(error.localizedDescription)")
//                        }
//                    }
                    
                    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 2, repeats: false)
                    let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
                    UNUserNotificationCenter.current().add(request)
                }
            }
            else {
                Text("This app is not authorized. Quel dommage!")
                Button("Request Notification Permissions") {
                    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { success, error in
                        if success {
                            isAuthorized = true
                        } else if let error {
                            errText = "We aren’t authorized to show notifications for some reason. You’ll probably need to open the Settings app and do it manually OR just reset and run this again.\n\nError Received: \(error.localizedDescription)"
                        }
                    }
                }
                Text(errText)
            }
        }
        .onAppear {
            UNUserNotificationCenter.current().getNotificationSettings { (settings) in
                isAuthorized = settings.authorizationStatus == .authorized
            }
        }
    }
}

#Preview {
    PermissionsView()
}
