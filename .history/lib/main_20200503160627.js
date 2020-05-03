import * as fs from 'fs'

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
    Schema.validateSync(schema, masterSchema, (err, schema) => {
      if (err) throw err
    })
  }

  validate (config, callback) { return Schema.validate(config, this, callback) }
  validateSync (config, callback) { return Schema.validateSync(config, this, callback) }
  static validate (config, schema, callback) { return Schema.validateSync(config, schema, callback) }

  /**
   * validate a configuration against a schema and if it is valid, return a full
   * configuration
   * @param {Object} config - the configuration to validate
   * @param {Object} schema
   * @param {(err: Error, config: Object)} callback
   */
  static validateSync (config, schema, callback) {
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
            Configuration.validateSync(config[_option], option.schema)
          } else if (option.default) {
            config[_option] = schema[_option].default
            // is the option required?
          } else if (schema[_option].required) {
            if (config[_option] === undefined) throw new Error(`>> invalid config: "${_option}" is not defined`)
          }
        }
      }
      callback(null, config)
    } catch (err) {
      callback(err)
    }
  }
}

export class Configuration {
  constructor (schema) {
    Object.assign(this, schema)
  }

  get default () {

  }
}

/**
 * Synchronously process command line args
 * @param {Object} schema -- config and key-map object
 * @returns object of option/value pairs
 */
export function processArgs (schema) {
  if (!schema.noConfigFile) {
    schema.options.config = { alias: ['-c', '--config'], param: 'path' }
  }
  for (const flag in schema.options) {
    schema.options[flag].alias = schema.options[flag].alias.map((alias) => {
      if (!alias.startsWith('-')) alias = ('-' + alias)
      if (!alias.startsWith('--') && alias.length > 2) alias = ('-' + alias)
      return alias
    })
  }
  const args = process.argv
  const noOpt = schema.noOpt || 'noOpt'
  const argOptions = {
    [noOpt]: []
  }
  if (schema.includeExec) argOptions.exec = args[0]
  if (schema.includeExec) argOptions.exec = args[1]

  // get execution args
  // iterate over args
  for (let i = 2; i < args.length; i++) {
    let arg = args[i]
    // if it doesn't start with `-` or `--`, treat it as path-to-server-root
    while (!arg.startsWith('-')) {
      argOptions[noOpt].push(arg)
      // if so: skip to the next argument
      i++
      arg = args[i]
    }
    // check for a delimiter
    if (arg === '--') {
    // if it is one, save all the following args to an array and break out of
    // loop
      argOptions.args = args.slice(i + 1)
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
    let count = 0
    for (const key in schema.options) {
      count++
      if (schema.options[key].alias.some((value) => {
        if (/\*/.test(value)) {
          const r = new RegExp(value.replace('*', '\\S*'))
          return r.test(arg)
        } else return value === arg
      })) {
      // if it does, check if the option wants an argument
        const param = schema.options[key].param
        argOptions[key] = (() => {
          switch (true) {
            case param === false || /^false$/i.test(param):
              return false
            case !param || param === true || /^true$/i.test(param):
              return true
            case Array.isArray(param) || /^array$/i.test(param):
              return ((value = []) => {
                while (!args[++i].startsWith('-')) {
                  value.push(args[i])
                }
                return value
              })()
            default:
              return args[++i]
          }
        })()
        break
      } else if (schema.options[key].no && schema.options[key].arg.includes(`--no${arg.slice(1)}`)) {
        argOptions[key] = false
        i++
        break
      }
      if (count === Object.keys(schema.options).length) throw new Error(`invalid command line flag: "${arg}"`)
    }
  }
  return argOptions
}

export function processEnv (schema) {
  const envOptions = {}
  process.env[schema.env].split(' ').forEach('=').map((pair) => {
    for (const flag in schema.options) {
      const envFlag = flag.replace(/([a-z](?=[A-Z]))/g, '$1_').toUpperCase()
      if (pair[0] === envFlag) {
        envOptions[flag] = pair[1]
      }
    }
  })
  return envOptions
}

export function init (schema) {
  const argOptions = processArgs(schema)
  let configFile
  switch (true) {
    case fs.existsSync(argOptions.configFile):
      configFile = argOptions.configFile
      break
    case fs.existsSync(schema.configFile):
      configFile = schema.configFile
      break
    case fs.existsSync(`.config/${schema.configFile}`):
      configFile = `.config/${schema.configFile}`
      break
  }
  const config = configFile ? JSON.parse(fs.readFileSync(configFile)) : getDefaultConfig()
}

/**
 * @callback Callback
 * @param {NodeJS.ErrnoException} err
 * @returns {void}
 */
