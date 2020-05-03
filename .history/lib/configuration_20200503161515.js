import { processArgs } from './utils.js'

export class Configuration {
  constructor (schema) {
    Object.assign(this, schema)
  }

  get default () {

  }

  init () {
    const argOptions = processArgs(this)
    let configFile
    switch (true) {
      case fs.existsSync(argOptions.configFile):
        configFile = argOptions.configFile
        break
      case fs.existsSync(this.configFile):
        configFile = this.configFile
        break
      case fs.existsSync(`.config/${this.configFile}`):
        configFile = `.config/${this.configFile}`
        break
    }
    const config = configFile ? JSON.parse(fs.readFileSync(configFile)) : this.default
  }
}
