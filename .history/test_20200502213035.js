import * as cmdArgs from './main.js'

const config = {
  config: { arg: ['-c', '--config'], param: 'path' },
  target: { arg: ['-T', '--target'], param: 'path' },
  forward: { arg: ['-F', '--forward'], param: 'path' },
  ssl: { arg: ['-S', '--ssl'] },
  key: { arg: ['-K', '--key'], param: 'path' },
  cert: { arg: ['-C', '--cert'], param: 'path' },
  secure: { arg: ['-s', '--secure'] }
}

console.log(process.argv)
process.argv.push(...'-ST some-target some-path -c some-config -s --forward some-forward'.split(' '))

console.log(process.argv)
const options = cmdArgs.process(config)
console.log(options)
