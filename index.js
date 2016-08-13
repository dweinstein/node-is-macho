#!/usr/bin/env node
'use strict'

const fs = require('fs')

function machoMagic (buffer) {
  const magics = [
    [0xca, 0xfe, 0xba, 0xbe], // fat
    [0xce, 0xfa, 0xed, 0xfe], // 32bit
    [0xcf, 0xfa, 0xed, 0xfe], // 64bit
    [0xfe, 0xed, 0xfa, 0xce]  // big-endian
  ]
  for (let m of magics) {
    if (!buffer.compare(Buffer.from(m), 0, 4, 0, 4)) {
      return true
    }
  }
  return false
}

function isMachoSync (path) {
  let fd
  try {
    fd = fs.openSync(path, 'r')
    const buffer = Buffer.alloc(4)
    fs.readSync(fd, buffer, 0, 4)
    return machoMagic(buffer)
  } finally {
    fs.close(fd)
  }
}

module.exports = {
  sync: isMachoSync
}

if (!module.parent) {
  const path = process.argv[2]
  if (!path) {
    console.log(`Usage: ${process.argv[1]} <path>`)
    process.exit(22)
  }
  const isMacho = isMachoSync(path)
  console.log(`Macho: ${isMacho}`)
  if (!isMacho) process.exit(1)
}
