import { Schema } from './lib/main.js'

const schema = new Schema({
  options: {
    config: { alias: ['c', '--config'], param: 'path', default: },
    target: { alias: ['-T', '--target'], param: 'path' },
    forward: { alias: ['-F', '--fo*'], param: 'path' },
    ssl: { alias: ['-S', '-ssl'], param: false },
    key: { alias: ['-K', '--key'], param: 'path' },
    cert: { alias: ['-C', '--cert'], param: 'path' }
  },

  env: 'CMD_ARGS'
})

console.log(schema.init())
