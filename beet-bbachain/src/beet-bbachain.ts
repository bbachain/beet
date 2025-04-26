import { SupportedTypeDefinition } from '@bbachain/beet'
import { KeysExports, keysTypeMap, KeysTypeMapKey } from './keys'

export * from './keys'
export * from './gpa'

/**
 * @category TypeDefinition
 */
export type BeetBBAChainTypeMapKey = KeysTypeMapKey
/**
 * @category TypeDefinition
 */
export type BeetBBAChainExports = KeysExports

/**
 * Maps bbachain beet exports to metadata which describes in which package it
 * is defined as well as which TypeScript type is used to represent the
 * deserialized value in JavaScript.
 *
 * @category TypeDefinition
 */
export const supportedTypeMap: Record<
  BeetBBAChainTypeMapKey,
  SupportedTypeDefinition & {
    beet: BeetBBAChainExports
  }
> = keysTypeMap
