#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
android_sdk="${ANDROID_HOME:-/home/yousefmsm1/Android/Sdk}"
build_tools="${ANDROID_BUILD_TOOLS:-35.0.0}"
platform="${ANDROID_PLATFORM:-android-36}"
tools_dir="$android_sdk/build-tools/$build_tools"
android_jar="$android_sdk/platforms/$platform/android.jar"
build_dir="$project_dir/android/manual/build"
res_dir="$build_dir/res"
classes_dir="$build_dir/classes"
dex_dir="$build_dir/dex"
output_apk="$project_dir/Bataa.apk"

for required in "$tools_dir/aapt2" "$tools_dir/d8" "$tools_dir/zipalign" "$tools_dir/apksigner" "$android_jar"; do
  if [[ ! -e "$required" ]]; then
    echo "Missing Android build dependency: $required" >&2
    exit 1
  fi
done

rm -rf "$build_dir"
mkdir -p "$res_dir" "$classes_dir" "$dex_dir"
cp -R "$project_dir/android/manual/res/." "$res_dir/"

for spec in mdpi:48:108 hdpi:72:162 xhdpi:96:216 xxhdpi:144:324 xxxhdpi:192:432; do
  density="${spec%%:*}"
  rest="${spec#*:}"
  legacy="${rest%%:*}"
  foreground="${rest##*:}"
  target="$res_dir/mipmap-$density"
  mkdir -p "$target"
  convert "$project_dir/public/applogo.png" -filter Lanczos -resize "${legacy}x${legacy}" -strip "$target/ic_launcher.png"
  convert "$project_dir/public/applogo.png" -filter Lanczos -resize "${legacy}x${legacy}" -strip "$target/ic_launcher_round.png"
  convert "$project_dir/public/applogo.png" -filter Lanczos -resize "${foreground}x${foreground}" -strip "$target/ic_launcher_foreground.png"
done

cd "$project_dir"
npm run build

"$tools_dir/aapt2" compile --dir "$res_dir" -o "$build_dir/resources.zip"
"$tools_dir/aapt2" link \
  -o "$build_dir/unsigned.apk" \
  -I "$android_jar" \
  --manifest "$project_dir/android/manual/AndroidManifest.xml" \
  --min-sdk-version 24 \
  --target-sdk-version 36 \
  --version-code 1 \
  --version-name 1.0 \
  --auto-add-overlay \
  -A "$project_dir/dist" \
  "$build_dir/resources.zip"

javac \
  -encoding UTF-8 \
  -source 11 \
  -target 11 \
  -classpath "$android_jar" \
  -d "$classes_dir" \
  "$project_dir/android/manual/src/com/bataa/app/MainActivity.java"

jar --create --file "$build_dir/classes.jar" -C "$classes_dir" .

"$tools_dir/d8" \
  --release \
  --min-api 24 \
  --lib "$android_jar" \
  --output "$dex_dir" \
  "$build_dir/classes.jar"

(cd "$dex_dir" && zip -q -j "$build_dir/unsigned.apk" classes.dex)
"$tools_dir/zipalign" -f -p 4 "$build_dir/unsigned.apk" "$build_dir/aligned.apk"

debug_keystore="${ANDROID_DEBUG_KEYSTORE:-/home/yousefmsm1/.android/debug.keystore}"
"$tools_dir/apksigner" sign \
  --ks "$debug_keystore" \
  --ks-key-alias androiddebugkey \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$output_apk" \
  "$build_dir/aligned.apk"

"$tools_dir/apksigner" verify --verbose "$output_apk"
echo "APK created at $output_apk"
