# CLI Notifier

Trying to make a simple app that does nothing but notify success or failure from the command line. 

Along the lines of [`terminal-notifier`](https://github.com/julienXX/terminal-notifier/), but I wanted to see if there was some way I could get specific images to show up. `terminal-notifier` used to have functionality to pass an image path that would appear as the app icon, but that was using some private framework and [stopped working with Big Sur (macOS 11)](https://github.com/julienXX/terminal-notifier/issues/283).

Not running from the command line yet, but just wanted to make a little GUI that did push-button notifications. Not that from clicking the button there is a two-second delay before the notification to give you time to alt-tab to another program. (macOS prevents the notification from popping if its app is already the frontmost, which makes sense!)

It's able to load images and attach them, but seems to align them in some weird fashion? 

![bad alignment](./bad_alignment?.png)

More investigation needed. Or not? There is maddeningly little documentation on this kind of thing.

