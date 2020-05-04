import * as fs from 'fs'
import { processArgs, processEnv } from './utils.js'

export class Schema {
  constructor (_config) {
    this.history = []
    this.defaults = {}
    if (masterSchema) {
      return Object.assign(this, masterSchema.init(_config))
    } return Object.assign(this, _config)
  }

  get totalInitCount () { return this.history.length }
  get successCount () { return this.history.filter((el) => el.succeeded).length }
  get failCount () { return this.history.filter((el) => !el.succeeded).length }

  validate (config, callback) { return this.validateSync(config, callback) }

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
      for (const _option in this.options) {
        const option = this.options[_option]
        if (option) {
        // if the option is defined
          if (config[_option]) {
            if (option.schema) {
              option.schema.validateSync(config[_option], (err, subConfig) => {
                if (err) throw err
                config[_option] = subConfig
              })
            } else { // do typeCheck if requested
              if (option.typeof) {
                if (
                  ![option.typeof]
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
            } // if the option is undefined
          } else {
          // is there a default?
            if (option.default) {
              this.defaults[_option] = option.default
            // is the option required?
            } else if (option.required) {
              if (config[_option] === undefined) throw new Error(`>> invalid config: "${_option}" is not defined`)
            }
          }
        } else if (this.filter) delete config[_option]
      }
      return callback(null, config)
    } catch (err) {
      callback(err)
    }
  }

  /**
   *
   * @param {Object} config
   * @param {Schema} schemaTweaks
   */
  init (config = {}, schemaTweaks = {}) {
    const schema = Object.assign(Object.create(Schema.prototype), this, schemaTweaks)
    const argOptions = processArgs(schema)
    const configFile = (() => {
      switch (true) {
        case fs.existsSync(argOptions.configFile):
          return argOptions.configFile
        case fs.existsSync(schema.configFile):
          return schema.configFile
        case fs.existsSync(`.config/${schema.configFile}`):
          return `.config/${schema.configFile}`
        case fs.existsSync(`~/.config/${schema.configFile}`):
          return `.config/${schema.configFile}`
        default:
          return {}
      }
    })()
    const workingConfig = {
      ...schema.defaults,
      ...schema.configFile ? JSON.parse(fs.readFileSync(configFile)) : {},
      ...config,
      ...schema.processEnv ? processEnv(schema) : {},
      ...schema.processSTDIN ? argOptions : {}
    }
    return schema.validateSync(workingConfig, (err, final) => {
      workingConfig._index = this.history.length
      this.history.push(workingConfig)
      if (err) { workingConfig._succeeded = false; throw err }
      workingConfig._succeeded = true
      return workingConfig
    })
  }
}

var STDIN = new Schema({
  options: {
    includeExec: { typeof: 'boolean' },
    includeFile: { typeof: 'boolean' },
    noOpt: { default: 'noOpt', typeof: 'string' }
  }
})

var masterSchema = new Schema({
  options: {
    STDIN: {
      typeof: ['boolean', 'object'],
      schema: STDIN

    },
    checkENV: { typeof: ['string', 'boolean'] },
    filter: { default: true, typeof: 'boolean' },
    options: { required: true }
  }
})
