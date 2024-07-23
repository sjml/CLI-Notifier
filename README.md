# CLI Notifier

Trying to make a simple app that does nothing but notify success or failure from the command line. 

Along the lines of [`terminal-notifier`](https://github.com/julienXX/terminal-notifier/), but I wanted to see if there was some way I could get specific images to show up. `terminal-notifier` used to have functionality to pass an image path that would appear as the app icon, but that was using some private framework and [stopped working with Big Sur (macOS 11)](https://github.com/julienXX/terminal-notifier/issues/283).

Not running from the command line yet, but just wanted to make a little GUI that did push-button notifications. Not that from clicking the button there is a two-second delay before the notification to give you time to alt-tab to another program. (macOS prevents the notification from popping if its app is already the frontmost, which makes sense!)

No pre-built artifacts because of codesigning and notarization. Short version: notifications require per-identifier permissions, but that means each identifier has to be registered with a developer account if it wants to do anything more than run on the machine that built it. So you gotta built these yourself. Sorry. Take it up with Apple. 
