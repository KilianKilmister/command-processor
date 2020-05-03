import * as cmdArgs from './main.js'

const config = {
  flags: {
    config: { arg: ['-c', '--config'], param: 'path' },
    target: { arg: ['-T', '--target'], param: 'path' },
    forward: { arg: ['-F', '--fo*'], param: 'path' },
    ssl: { arg: ['-S', '--ssl'] },
    key: { arg: ['-K', '--key'], param: 'path' },
    cert: { arg: ['-C', '--cert'], param: 'path' },
    secure: {
      arg: ['-s', '--secure']
    },
    a: {
      alias: ['-c', '--config'],
      param: false //
    },
    b: {
      alias: ['-c', '--config'],
      param: true
    },
    c: {
      alias: ['-c', '--config'],
      param: null
    },
    d: {
      alias: ['-c', '--config'],
      param: undefined
    },
    e: {
      alias: ['-c', '--config'],
      param: 'string'
    },
    e: {
      alias: ['-c', '--config'],
      param: null
    }
  },
  noOpt: 'path',
  includeExec: false,
  includeFile: false

}

process.argv.push(...'-ST some-target some-path et reprehenderit -c some-config -s --forward some-forward'.split(' '))

const options = cmdArgs.processArgs(config)
console.log(options)
