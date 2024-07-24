import SwiftUI

struct PermissionsView: View {
    @State var isAuthorized: Bool = false
    @State var errText: String = ""
    @State var isRequesting: Bool = false
    
    var body: some View {
        VStack {
            if (isAuthorized) {
                Text("This app is already authorized. You’re good!")
                Button("Quit") {
                    NSApp.terminate(nil)
                }
                Button("Show Test Notification Plz") {
                    PopNotification(title: "Teller Proudly Presents:", message: "Your content!", delay: 2.0, soundName: TellerValidSounds.Glass.rawValue)
                }
            }
            else {
                Text("This app is not authorized. Quel dommage!")
                Button(action: {
                    isRequesting = true
                    Task {
                        do {
                            isAuthorized = try await RequestNotificationPermissions()
                        }
                        catch {
                            errText = "We aren’t authorized to show notifications for some reason. You’ll probably need to open the Settings app and do it manually OR just reset and run this again.\n\nError Received: \(error.localizedDescription)"
                        }
                        isRequesting = false
                    }
                }, label: {
                    Text("Request Notification Permissions")
                })
                Text(errText)
            }
        }
        .task {
            isAuthorized = await AreNotificationsAuthorized()
        }
    }
}

#Preview {
    PermissionsView()
}
