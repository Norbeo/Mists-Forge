#!/bin/sh
# Assemble le jeu : index.html (aperçu) et dist/ (appli installable)
cd "$(dirname "$0")"
OUT=/tmp/claude-0/cc/fb.js
cat src/0*.js src/1*.js src/2*.js src/3*.js > $OUT && node --check $OUT || exit 1
PWAHEAD='<meta name="theme-color" content="#070504">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Forge des Brumes">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" href="favicon-64.png">'
{ echo "$PWAHEAD"; cat src/head.html src/body.html; echo "<script>"; cat $OUT; echo "</script>"; } > index.html
VER=$(md5sum $OUT src/head.html | md5sum | cut -c1-10)
rm -rf dist && mkdir -p dist
{ echo '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">'
  echo "$PWAHEAD"; cat src/head.html; echo '</head><body>'; cat src/body.html
  echo '<script>window.FB_SW = 1;</script><script>'; cat $OUT; echo '</script></body></html>'; } > dist/index.html
cp pwa/manifest.webmanifest pwa/*.png dist/ 2>/dev/null
sed "s/__VERSION__/$VER/" pwa/sw.template.js > dist/sw.js
echo "build ok · $(wc -c < index.html) octets · v$VER"
