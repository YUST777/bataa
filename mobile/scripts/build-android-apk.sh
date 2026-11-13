#!/usr/bin/env bash
# Builds the Bataa Android APK: the mobile web app inside a WebView (android/manual), plus native Google sign-in
# (Credential Manager), with Gradle (android/gradle-app). Signed with the local debug key.
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
android_sdk="${ANDROID_HOME:-/home/yousefmsm1/Android/Sdk}"
gradle_dir="$project_dir/android/gradle-app"
web_dir="$project_dir"
output_apk="${BATAA_APK:-$project_dir/BataaMobile.apk}"

if [[ ! -d "$android_sdk/platforms" ]]; then
  echo "Missing Android SDK at $android_sdk (set ANDROID_HOME)" >&2
  exit 1
fi
printf 'sdk.dir=%s\n' "$android_sdk" > "$gradle_dir/local.properties"

(cd "$web_dir" && npm run build)

# Launcher icons, from the app logo.
icons_dir="$gradle_dir/build/generated/icons"
rm -rf "$icons_dir"
for spec in mdpi:48:108 hdpi:72:162 xhdpi:96:216 xxhdpi:144:324 xxxhdpi:192:432; do
  density="${spec%%:*}"
  rest="${spec#*:}"
  legacy="${rest%%:*}"
  foreground="${rest##*:}"
  target="$icons_dir/mipmap-$density"
  mkdir -p "$target"
  convert "$project_dir/android/icon.png" -filter Lanczos -resize "${legacy}x${legacy}" -strip "$target/ic_launcher.png"
  convert "$project_dir/android/icon.png" -filter Lanczos -resize "${legacy}x${legacy}" -strip "$target/ic_launcher_round.png"
  convert "$project_dir/android/icon.png" -filter Lanczos -resize "${foreground}x${foreground}" -strip "$target/ic_launcher_foreground.png"
done

(cd "$gradle_dir" && BATAA_WEB_DIST="$web_dir/dist" ./gradlew --quiet assembleDebug)
cp "$gradle_dir/build/outputs/apk/debug/bataa-debug.apk" "$output_apk"
echo "APK created at $output_apk"
