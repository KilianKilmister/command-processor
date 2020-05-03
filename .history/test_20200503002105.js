import * as cmdArgs from './main.js'

const config = {
  flags: {
    config: { alias: ['-c', '--config'], param: 'path' },
    target: { alias: ['-T', '--target'], param: 'path' },
    forward: { alias: ['-F', '--fo*'], param: 'path' },
    ssl: { alias: ['-S', '--ssl'], param: false },
    key: { alias: ['-K', '--key'], param: 'path' },
    cert: { alias: ['-C', '--cert'], param: 'path' }
  },
  noOpt: 'path',
  includeExec: false,
  includeFile: false

}

process.argv.push(...'-ST some-target some-path et reprehenderit -c some-config -s --forward some-forward'.split(' '))

const options = cmdArgs.processArgs(config)
console.log(options)
