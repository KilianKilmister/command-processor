// import httpProxy from 'http-proxy'
// import * as http from 'http'
// import * as fs from 'fs'
// import { validateConfig } from '../src/util.js'
// import { defaultServerConfig } from '../src/configs.js'

const commandArgs = {
  config: { arg: ['-c', '--config'], param: 'path' },
  target: { arg: ['-T', '--target'], param: 'path' },
  forward: { arg: ['-F', '--forward'], param: 'path' },
  ssl: { arg: ['-S', '--ssl'] },
  key: { arg: ['-K', '--key'], param: 'path' },
  cert: { arg: ['-C', '--cert'], param: 'path' },
  secure: { arg: ['-s', '--secure'] }
}
process.argv.push(...'-ST some-target some-path -c some-config -s --forward some-forward'.split(' '))
// get execution args
const args = process.argv.slice(2)

// iterate over args
const commandlineOptions = {}
for (let i = 0; i < args.length; i++) {
  let arg = args[i]
  // if it doesn't start with `-` or `--`, treat it as path-to-server-root
  if (!arg.startsWith('-')) {
    commandlineOptions.root = arg
    // if so: skip to the next argument
    i++
    arg = args[i]
  }
  // check for a delimiter
  if (arg === '--') {
    // if it is one, save all the following args to an array and break out of
    // loop
    commandlineOptions.args = args.slice(i + 1)
    break
  }
  // if arg is a single letter option, expand each letter to an arg
  if (!arg.startsWith('--')) {
    // delete the arg from input array
    // and insert every single letter argument in it's place
    // this nicely adjusts the length of args and causes each inserted arg to be
    // processed in order
    args.splice(i, 1, ...arg.slice(1).split('').map((value) => value.padStart('2', '-')))
    // then set arg to the first of these items now at `i`
    arg = args[i]
  }
  // check each possible option if it matches the arg
  for (const key in commandArgs) {
    if (commandArgs[key].arg.includes(arg)) {
      // if it does, check if the option wants an argument
      if (commandArgs[key].param) {
        // if so, save key/value to the options object
        commandlineOptions[key] = args[i + 1]
        // and skip checking the value entirely
        i++
        // else, save key = true
      } else commandlineOptions[key] = true
      // exit sub-loop
      break
    }
  }
}

console.log(commandlineOptions)
