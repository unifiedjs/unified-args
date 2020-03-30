// TypeScript Version: 3.0

import {Options as EngineOptions} from 'unified-engine'

type RequiredEngineOptions = Required<
  Pick<
    EngineOptions,
    | 'extensions'
    | 'ignoreName'
    | 'packageField'
    | 'pluginPrefix'
    | 'processor'
    | 'rcName'
  >
>

declare namespace unifiedArgs {
  interface Options extends RequiredEngineOptions {
    /**
     * Name of executable
     */
    name: string

    /**
     * Description of executable
     */
    description: string

    /**
     * Version of executable
     */
    version: string
  }
}

/**
 * Create a CLI for a unified processor
 */
declare function unifiedArgs(options: unifiedArgs.Options): void

export = unifiedArgs
