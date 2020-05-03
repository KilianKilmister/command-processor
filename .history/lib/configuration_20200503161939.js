import { processArgs } from './utils.js'
import * as fs from 'fs'
import { Schema } from './schema.js'

export class Configuration {
  constructor (schema) {
    Object.assign(this, schema)
  }

  get default () {

  }
}
