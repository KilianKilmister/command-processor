/**
 * Synchronously process command line args
 * @param {Object} config -- config and key-map object
 * @returns object of option/value pairs
 */
export function processArgs (config) {
  const args = process.argv// .slice(2)
  const noOpt = config.noOpt || 'noOpt'
  const options = {
    [noOpt]: []
  }
  if (config.includeExec) options.exec = args[0]
  if (config.includeExec) options.exec = args[1]

  // get execution args
  // iterate over args
  for (let i = 2; i < args.length; i++) {
    let arg = args[i]
    // if it doesn't start with `-` or `--`, treat it as path-to-server-root
    while (!arg.startsWith('-')) {
      options[noOpt].push(arg)
      // if so: skip to the next argument
      i++
      arg = args[i]
    }
    // check for a delimiter
    if (arg === '--') {
    // if it is one, save all the following args to an array and break out of
    // loop
      options.args = args.slice(i + 1)
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
    for (const key in config.flags) {
      count++
      if (config.flags[key].alias.some((value) => {
        if (/\*/.test(value)) {
          return new RegExp(`--${value.replace('*', '\\S*')}`).test(arg) } else return value === arg
      })) {
      // if it does, check if the option wants an argument
        const param = config.flags[key].param
        options[key] = (() => {
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
      } else if (config.flags[key].no && config.flags[key].arg.includes(`--no${arg.slice(1)}`)) {
        options[key] = false
        i++
        break
      }
      if (count === Object.keys(config.flags).length) throw new Error(`invalid command line flag: "${arg}"`)
    }
  }
  return options
}
