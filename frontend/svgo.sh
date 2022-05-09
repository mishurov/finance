#!/bin/sh

SVG_DIR=./src/images
SVGO=./node_modules/.bin/svgo

for f in $(ls $SVG_DIR/*.svg) ; do
  $SVGO $f -o $f
done
