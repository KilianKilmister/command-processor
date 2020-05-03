import * as fs from 'fs'
import { processArgs, processEnv } from './utils.js'

const masterSchema = {
  options: {
    STDIN: {
      typeof: ['boolean', 'object'],
      schema: {
        options: {
          includeExec: { typeof: 'boolean' },
          includeFile: { typeof: 'boolean' },
          noOpt: { default: 'noOpt', typeof: 'string' }
        }
      }
    },
    checkENV: { typeof: ['string', 'boolean'] },
    filter: { default: true, typeof: 'boolean' },
    options: { required: true }
  }
}

export class Schema {
  constructor (schema) {
    this.x
  }

  get default () {

  }

  validate (config, callback) { return Schema.validateSync(config, callback) }

  /**
   * validate a configuration against a schema and if it is valid, return a full
   * configuration
   * @param {Object} config - the configuration to validate
   * @param {Object} schema
   * @param {(err: Error, config: Object)} callback
   */
  validateSync (config, callback) {
    try {
      // iterate over options defined in schema
      for (const _option in schema.options) {
        const option = schema.options[_option]
        // if the option is defined
        if (config[_option]) { // do typeCheck if requested
          if (option.typeof) {
            if (
              [option.typeof]
                .flat() // eslint-disable-next-line valid-typeof
                .every(value => typeof config[_option] === value)
            ) {
              throw new Error(
          `>> invalid config: "${_option}" is of wrong type
          expected: ${option.typeof}
          got: ${typeof config[_option]}`
              )
            }
          }
          // check against allowed values if any are specified
          if (option.allowed) {
            if (
              [option.allowed]
                .flat() // eslint-disable-next-line valid-typeof
                .some(value => config[_option] === value)
            ) {
              throw new Error(
          `>> invalid config: "${_option}" is not an allowed option\nexpected: ${option.allowed}`
              )
            }
          }
          // if the option is undefined
        } else {
          // is there a default?
          if (option.schema) {
            option.schema.validateSync(config[_option], (err, config) => {
              if (err) throw err
              config[_option] = config
            })
          } else if (option.default) {
            config[_option] = this[_option].default
            // is the option required?
          } else if (this[_option].required) {
            if (config[_option] === undefined) throw new Error(`>> invalid config: "${_option}" is not defined`)
          }
        }
      }
      callback(null, config)
    } catch (err) {
      callback(err)
    }
  }

  init (config = {}, schemaTweaks) {
    const workingConfig = Object.assign({}, this, schemaTweaks)
    const argOptions = processArgs(this)
    const configFile = (() => {
      switch (true) {
        case fs.existsSync(argOptions.configFile):
          return argOptions.configFile
        case fs.existsSync(this.configFile):
          return this.configFile
        case fs.existsSync(`.config/${this.configFile}`):
          return `.config/${this.configFile}`
        case fs.existsSync(`~/.config/${this.configFile}`):
          return `.config/${this.configFile}`
        default:
          return config
      }
    })()

    const hierarchy = []
      .push(this.defaults)
      .push(this.defaults)
      .push(useBoth === true ? config : {})
      .push(this.configFile ? configFile : {})
      .push(this.processEnv ? processEnv(this) : {})
      .push(this.processSTDIN ? argOptions : {})

    return Object.assign({}, ...hierarchy)
  }
}
