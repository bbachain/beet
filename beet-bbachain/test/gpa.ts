import test from 'tape'
import spok from 'spok'
import { BeetStruct } from '@bbachain/beet'
import { u8 } from '@bbachain/beet'
import {
  IntAndString,
  PROGRAM_ID,
  Results,
  stringFilter,
  withDecodedBytes,
} from './utils'
import { GpaBuilder } from '../src/beet-bbachain'

test('gpa: fixed struct with one u8', (t) => {
  type Args = {
    n: number
  }
  const struct = new BeetStruct([['n', u8]], (args) => args)

  let gpaBuilder: GpaBuilder<Args> = GpaBuilder.fromStruct(PROGRAM_ID, struct)
  function prepCase(comment: string) {
    t.comment(comment)
    gpaBuilder = GpaBuilder.fromStruct(PROGRAM_ID, struct)
  }

  t.deepEqual(gpaBuilder.config, {}, 'initially config is empty')

  prepCase(`gpaBuilder.addFilter('n', 2)`)
  gpaBuilder.addFilter('n', 2)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [{ memcmp: { offset: 0, bytes: Buffer.from([2]) } }],
  })

  t.end()
})

test('gpa: fixed struct with two u8s', (t) => {
  const struct = new BeetStruct(
    [
      ['n', u8],
      ['nn', u8],
    ],
    (args) => args
  )

  let gpaBuilder = GpaBuilder.fromStruct(PROGRAM_ID, struct)
  function prepCase(comment: string) {
    t.comment(comment)
    gpaBuilder = GpaBuilder.fromStruct(PROGRAM_ID, struct)
  }

  t.deepEqual(gpaBuilder.config, {}, 'config is empty')

  prepCase(`gpaBuilder.addFilter('n', 2)`)
  gpaBuilder.addFilter('n', 2)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [{ memcmp: { offset: 0, bytes: Buffer.from([2]) } }],
  })

  prepCase(`gpaBuilder.addFilter('nn', 4)`)
  gpaBuilder.addFilter('nn', 4)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [{ memcmp: { offset: 1, bytes: Buffer.from([4]) } }],
  })

  prepCase(`add both of the above`)
  gpaBuilder.addFilter('n', 2).addFilter('nn', 4)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [
      {
        memcmp: { offset: 0, bytes: Buffer.from([2]) },
      },
      { memcmp: { offset: 1, bytes: Buffer.from([4]) } },
    ],
  })

  prepCase(`gpaBuilder.dataSize()`)
  gpaBuilder.dataSize()
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [{ dataSize: 2 }],
  })

  prepCase(`gpaBuilder.dataSize().addFilter('nn', 4)`)
  gpaBuilder.dataSize().addFilter('nn', 4)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [
      { dataSize: 2 },
      { memcmp: { offset: 1, bytes: Buffer.from([4]) } },
    ],
  })

  t.end()
})

test('gpa: fixed struct with three ints', (t) => {
  let gpaBuilder = GpaBuilder.fromStruct<Results>(PROGRAM_ID, Results.struct)
  function prepCase(comment: string) {
    t.comment(comment)
    gpaBuilder = GpaBuilder.fromStruct<Results>(PROGRAM_ID, Results.struct)
  }

  prepCase(`gpaBuilder.addFilter('win', 2)`)
  gpaBuilder.addFilter('win', 2)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [{ memcmp: { offset: 0, bytes: Buffer.from([2]) } }],
  })

  prepCase(`gpaBuilder.addFilter('totalWin', 8)`)
  gpaBuilder.addFilter('totalWin', 8)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [{ memcmp: { offset: 1, bytes: Buffer.from([8]) } }],
  })

  prepCase(`gpaBuilder.addFilter('losses', -7)`)
  gpaBuilder.addFilter('losses', -7)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [{ memcmp: { offset: 3, bytes: Buffer.from([-7]) } }],
  })

  prepCase(`gpaBuilder.addFilter('totalWin', 8).addFilter('losses', -7)`)
  gpaBuilder.addFilter('totalWin', 8).addFilter('losses', -7)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [
      { memcmp: { offset: 1, bytes: Buffer.from([8]) } },
      { memcmp: { offset: 3, bytes: Buffer.from([-7]) } },
    ],
  })

  t.end()
})

test('gpa: fixable struct with one int and a string', (t) => {
  let gpaBuilder = GpaBuilder.fromStruct<IntAndString>(
    PROGRAM_ID,
    IntAndString.struct
  )
  function prepCase(comment: string) {
    t.comment(comment)
    gpaBuilder = GpaBuilder.fromStruct<IntAndString>(
      PROGRAM_ID,
      IntAndString.struct
    )
  }

  prepCase(`gpaBuilder.addFilter('theInt', 2)`)
  gpaBuilder.addFilter('theInt', 2)
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [{ memcmp: { offset: 0, bytes: Buffer.from([2]) } }],
  })

  prepCase(`gpaBuilder.addFilter('theString', 'hello world')`)
  gpaBuilder.addFilter('theString', 'hello world')
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [stringFilter(1, 'hello world')],
  })

  prepCase(
    `gpaBuilder.addFilter('theInt', 2).addFilter('theString', 'hello world')`
  )
  gpaBuilder.addFilter('theInt', 2).addFilter('theString', 'hello world')
  spok(t, withDecodedBytes(gpaBuilder.config), {
    filters: [
      { memcmp: { offset: 0, bytes: Buffer.from([2]) } },
      stringFilter(1, 'hello world'),
    ],
  })

  t.end()
})
