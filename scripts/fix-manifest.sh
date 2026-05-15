#!/bin/sh
# Fix missing client-reference-manifest for Next.js
FILE='.next/server/app/[locale]/(dashboard)/page_client-reference-manifest.js'
if [ ! -f "$FILE" ]; then
  mkdir -p "$(dirname "$FILE")"
  echo 'module.exports={id:{},name:{},chunks:{}}' > "$FILE"
fi
