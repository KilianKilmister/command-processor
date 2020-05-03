import { Schema } from './lib/main.js'

const schema = new Schema({
  options: {
    target: { alias: ['-T', '--target'], typeof: 'string' },
    forward: { alias: ['-F', '--fo*'], typeof: 'string' },
    ssl: { alias: ['-S', '-ssl'], typeof: 'boolean' },
    key: { alias: ['-K', '--key'], typeof: 'string', default: './server.key' },
    cert: { alias: ['-C', '--cert'], typeof: 'string', default: './server.key' }
  },
  configFile: 'testConfig.json',
  env: 'CMD_ARGS'
})

console.log(schema.init())
