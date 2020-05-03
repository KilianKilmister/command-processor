import * as cmdArgs from './main.js'

const config = {
  flags: {
    config: { alias: ['-c', '--config'], param: 'path' },
    target: { alias: ['-T', '--target'], param: 'path' },
    forward: { alias: ['-F', '--fo*'], param: 'path' },
    ssl: { alias: ['-S', '--ssl'] },
    key: { alias: ['-K', '--key'], param: 'path' },
    cert: { alias: ['-C', '--cert'], param: 'path' },
    secure: {
      alias: ['-s', '--secure']
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
    }
  },
  noOpt: 'path',
  includeExec: false,
  includeFile: false

}

process.argv.push(...'-ST some-target some-path et reprehenderit -c some-config -s --forward some-forward'.split(' '))

const options = cmdArgs.processArgs(config)
console.log(options)
