/* eslint-disable no-useless-escape */
/* eslint-disable max-len */
/* cSpell:disable */
import { it, expect } from 'vitest'
import { v } from '../../src'

const minFive = v.string.min(5, () => 'min5')
const maxFive = v.string.max(5, () => 'max5')
const justFive = v.string.length(5)
const nonempty = v.string.min(1, () => 'nonempty')
const includes = v.string.includes('includes')
const includesFromIndex2 = v.string.includes('includes', 2)
const startsWith = v.string.startsWith('startsWith')
const endsWith = v.string.endsWith('endsWith')

it('passing validations', () => {
  minFive.parse('12345')
  minFive.parse('123456')
  maxFive.parse('12345')
  maxFive.parse('1234')
  nonempty.parse('1')
  justFive.parse('12345')
  includes.parse('XincludesXX')
  includesFromIndex2.parse('XXXincludesXX')
  startsWith.parse('startsWithX')
  endsWith.parse('XendsWith')
})

it('failing validations', () => {
  expect(() => minFive.parse('1234')).toThrow()
  expect(() => maxFive.parse('123456')).toThrow()
  expect(() => nonempty.parse('')).toThrow()
  expect(() => justFive.parse('1234')).toThrow()
  expect(() => justFive.parse('123456')).toThrow()
  expect(() => includes.parse('XincludeXX')).toThrow()
  expect(() => includesFromIndex2.parse('XincludesXX')).toThrow()
  expect(() => startsWith.parse('x')).toThrow()
  expect(() => endsWith.parse('x')).toThrow()
})

it('email validations', () => {
  const email = v.string.email()
  email.parse('mojojojo@example.com')
  expect(() => email.parse('asdf')).toThrow()
  expect(() => email.parse('@lkjasdf.com')).toThrow()
  expect(() => email.parse('asdf@sdf.')).toThrow()
  expect(() => email.parse('asdf@asdf.com-')).toThrow()
  expect(() => email.parse('asdf@-asdf.com')).toThrow()
  expect(() => email.parse('asdf@-a(sdf.com')).toThrow()
  expect(() => email.parse('asdf@-asdf.com(')).toThrow()
  expect(() =>
    email.parse('pawan.anand@%9y83&#$%R&#$%R&%#$R%%^^%5rw3ewe.d.d.aaaa.wef.co'),
  ).toThrow()
})

it('more email validations', () => {
  const validEmails = [
    `very.common@example.com`,
    `disposable.style.email.with+symbol@example.com`,
    `other.email-with-hyphen@example.com`,
    `fully-qualified-domain@example.com`,
    `user.name+tag+sorting@example.com`,
    `x@example.com`,
    `example-indeed@strange-example.com`,
    `test/test@test.com`,
    `example@s.example`,
    `" "@example.org`,
    `"john..doe"@example.org`,
    `mailhost!username@example.org`,
    `"very.(),:;<>[]\".VERY.\"very@\\ \"very\".unusual"@strange.example.com`,
    `user%example.com@example.org`,
    `user-@example.org`,
    `postmaster@[123.123.123.123]`,
    `user@my-example.com`,
    `a@b.cd`,
    `work+user@mail.com`,
    `user@[68.185.127.196]`,
    `ipv4@[85.129.96.247]`,
    `valid@[79.208.229.53]`,
    `valid@[255.255.255.255]`,
    `valid@[255.0.55.2]`,
    `valid@[255.0.55.2]`,
    `hgrebert0@[IPv6:4dc8:ac7:ce79:8878:1290:6098:5c50:1f25]`,
    `bshapiro4@[IPv6:3669:c709:e981:4884:59a3:75d1:166b:9ae]`,
    `jsmith@[IPv6:2001:db8::1]`,
    `postmaster@[IPv6:2001:0db8:85a3:0000:0000:8a2e:0370:7334]`,
    `postmaster@[IPv6:2001:0db8:85a3:0000:0000:8a2e:0370:192.168.1.1]`,
  ]
  const invalidEmails = [
    `Abc.example.com`,
    `A@b@c@example.com`,
    `a"b(c)d,e:f;g<h>i[j\k]l@example.com`,
    `just"not"right@example.com`,
    `this is"not\allowed@example.com`,
    `this\ still\"not\\allowed@example.com`,
    `i_like_underscore@but_its_not_allowed_in_this_part.example.com`,
    `QA[icon]CHOCOLATE[icon]@test.com`,
    `invalid@-start.com`,
    `invalid@end.com-`,
    `a.b@c.d`,
    `invalid@[1.1.1.-1]`,
    `invalid@[68.185.127.196.55]`,
    `temp@[192.168.1]`,
    `temp@[9.18.122.]`,
    `double..point@test.com`,
    `asdad@test..com`,
    `asdad@hghg...sd...au`,
    `asdad@hghg........au`,
    `invalid@[256.2.2.48]`,
    `invalid@[256.2.2.48]`,
    `invalid@[999.465.265.1]`,
    `jkibbey4@[IPv6:82c4:19a8::70a9:2aac:557::ea69:d985:28d]`,
    `mlivesay3@[9952:143f:b4df:2179:49a1:5e82:b92e:6b6]`,
    `gbacher0@[IPv6:bc37:4d3f:5048:2e26:37cc:248e:df8e:2f7f:af]`,
    `invalid@[IPv6:5348:4ed3:5d38:67fb:e9b:acd2:c13:192.168.256.1]`,
  ]
  const emailSchema = v.string.email()
  expect(validEmails.every((email) => v.isResult(emailSchema.safeParse(email)))).toBe(true)
  expect(invalidEmails.every((email) => v.isError(emailSchema.safeParse(email)))).toBe(true)
})

it('url validations', () => {
  const url = v.string.url()
  url.parse('http://google.com')
  url.parse('https://google.com/asdf?asdf=ljk3lk4&asdf=234#asdf')
  expect(() => url.parse('asdf')).toThrow()
  expect(() => url.parse('https:/')).toThrow()
  expect(() => url.parse('asdfj@lkjsdf.com')).toThrow()
})

it('url error overrides', () => {
  try {
    v.string.url().parse('https')
  } catch (err) {
    expect(err.firstError).toEqual("'https' is not a valid URL")
  }
  try {
    v.string.url(() => 'badurl').parse('https')
  } catch (err) {
    expect(err.firstError).toEqual('badurl')
  }
  try {
    v.string.url(() => 'badurl').parse('https')
  } catch (err) {
    expect(err.firstError).toEqual('badurl')
  }
})

it('emoji validations', () => {
  const emoji = v.string.emoji()

  emoji.parse('👋👋👋👋')
  emoji.parse('🍺👩‍🚀🫡')
  emoji.parse('💚💙💜💛❤️')
  emoji.parse('🐛🗝🐏🍡🎦🚢🏨💫🎌☘🗡😹🔒🎬➡️🍹🗂🚨⚜🕑〽️🚦🌊🍴💍🍌💰😳🌺🍃')
  emoji.parse('🇹🇷🤽🏿‍♂️')
  emoji.parse(
    '😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚☺️☺🙂🤗🤩🤔🤨😐😑😶🙄😏😣😥😮🤐😯😪😫😴😌😛😜😝🤤😒😓😔😕🙃🤑😲☹️☹🙁😖😞😟😤😢😭😦😧😨😩🤯😬😰😱🥵🥶😳🤪😵😡😠🤬😷🤒🤕🤢🤮🤧😇🤠🥳🥴🥺🤥🤫🤭🧐🤓😈👿🤡👹👺💀☠️☠👻👽👾🤖💩😺😸😹😻😼😽🙀😿😾🙈🙉🙊🏻🏼🏽🏾🏿👶👶🏻👶🏼👶🏽👶🏾👶🏿🧒🧒🏻🧒🏼🧒🏽🧒🏾🧒🏿👦👦🏻👦🏼👦🏽👦🏾👦🏿👧👧🏻👧🏼👧🏽👧🏾👧🏿🧑🧑🏻🧑🏼🧑🏽🧑🏾🧑🏿👨👨🏻👨🏼👨🏽👨🏾👨🏿👩👩🏻👩🏼👩🏽👩🏾👩🏿🧓🧓🏻🧓🏼🧓🏽🧓🏾🧓🏿👴👴🏻👴🏼👴🏽👴🏾👴🏿👵👵🏻👵🏼👵🏽👵🏾👵🏿👨‍⚕️👨‍⚕👨🏻‍⚕️👨🏻‍⚕👨🏼‍⚕️👨🏼‍⚕👨🏽‍⚕️👨🏽‍⚕👨🏾‍⚕️👨🏾‍⚕👨🏿‍⚕️👨🏿‍⚕👩‍⚕️👩‍⚕👩🏻‍⚕️👩🏻‍⚕👩🏼‍⚕️👩🏼‍⚕👩🏽‍⚕️👩🏽‍⚕👩🏾‍⚕️👩🏾‍⚕👩🏿‍⚕️👩🏿‍⚕👨‍🎓👨🏻‍🎓👨🏼‍🎓👨🏽‍🎓👨🏾‍🎓👨🏿‍🎓👩‍🎓👩🏻‍🎓👩🏼‍🎓👩🏽‍🎓👩🏾‍🎓👩🏿‍🎓👨‍🏫👨🏻‍🏫👨🏼‍🏫👨🏽‍🏫👨🏾‍🏫👨🏿‍🏫👩‍🏫👩🏻‍🏫👩🏼‍🏫👩🏽‍🏫👩🏾‍🏫👩🏿‍🏫👨‍⚖️👨‍⚖👨🏻‍⚖️👨🏻‍⚖👨🏼‍⚖️👨🏼‍⚖👨🏽‍⚖️👨🏽‍⚖👨🏾‍⚖️👨🏾‍⚖👨🏿‍⚖️👨🏿‍⚖👩‍⚖️👩‍⚖👩🏻‍⚖️👩🏻‍⚖👩🏼‍⚖️👩🏼‍⚖👩🏽‍⚖️👩🏽‍⚖👩🏾‍⚖️👩🏾‍⚖👩🏿‍⚖️👩🏿‍⚖👨‍🌾👨🏻‍🌾👨🏼‍🌾👨🏽‍🌾👨🏾‍🌾👨🏿‍🌾👩‍🌾👩🏻‍🌾👩🏼‍🌾👩🏽‍🌾👩🏾‍🌾👩🏿‍🌾👨‍🍳👨🏻‍🍳👨🏼‍🍳👨🏽‍🍳👨🏾‍🍳👨🏿‍🍳👩‍🍳👩🏻‍🍳👩🏼‍🍳👩🏽‍🍳👩🏾‍🍳👩🏿‍🍳👨‍🔧👨🏻‍🔧👨🏼‍🔧👨🏽‍🔧👨🏾‍🔧👨🏿‍🔧👩‍🔧👩🏻‍🔧👩🏼‍🔧👩🏽‍🔧👩🏾‍🔧👩🏿‍🔧👨‍🏭👨🏻‍🏭👨🏼‍🏭👨🏽‍🏭👨🏾‍🏭👨🏿‍🏭👩‍🏭👩🏻‍🏭👩🏼‍🏭👩🏽‍🏭👩🏾‍🏭👩🏿‍🏭👨‍💼👨🏻‍💼👨🏼‍💼👨🏽‍💼👨🏾‍💼👨🏿‍💼👩‍💼👩🏻‍💼👩🏼‍💼👩🏽‍💼👩🏾‍💼👩🏿‍💼👨‍🔬👨🏻‍🔬👨🏼‍🔬👨🏽‍🔬👨🏾‍🔬👨🏿‍🔬👩‍🔬👩🏻‍🔬👩🏼‍🔬👩🏽‍🔬👩🏾‍🔬👩🏿‍🔬👨‍💻👨🏻‍💻👨🏼‍💻👨🏽‍💻👨🏾‍💻👨🏿‍💻👩‍💻👩🏻‍💻👩🏼‍💻👩🏽‍💻👩🏾‍💻👩🏿‍💻👨‍🎤👨🏻‍🎤👨🏼‍🎤👨🏽‍🎤👨🏾‍🎤👨🏿‍🎤👩‍🎤👩🏻‍🎤👩🏼‍🎤👩🏽‍🎤👩🏾‍🎤👩🏿‍🎤👨‍🎨👨🏻‍🎨👨🏼‍🎨👨🏽‍🎨👨🏾‍🎨👨🏿‍🎨👩‍🎨👩🏻‍🎨👩🏼‍🎨👩🏽‍🎨👩🏾‍🎨👩🏿‍🎨👨‍✈️👨‍✈👨🏻‍✈️👨🏻‍✈👨🏼‍✈️👨🏼‍✈👨🏽‍✈️👨🏽‍✈👨🏾‍✈️👨🏾‍✈👨🏿‍✈️👨🏿‍✈👩‍✈️👩‍✈👩🏻‍✈️👩🏻‍✈👩🏼‍✈️👩🏼‍✈👩🏽‍✈️👩🏽‍✈👩🏾‍✈️👩🏾‍✈👩🏿‍✈️👩🏿‍✈👨‍🚀👨🏻‍🚀👨🏼‍🚀👨🏽‍🚀👨🏾‍🚀👨🏿‍🚀👩‍🚀👩🏻‍🚀👩🏼‍🚀👩🏽‍🚀👩🏾‍🚀👩🏿‍🚀👨‍🚒👨🏻‍🚒👨🏼‍🚒👨🏽‍🚒👨🏾‍🚒👨🏿‍🚒👩‍🚒👩🏻‍🚒👩🏼‍🚒👩🏽‍🚒👩🏾‍🚒👩🏿‍🚒👮👮🏻👮🏼👮🏽👮🏾👮🏿👮‍♂️👮‍♂👮🏻‍♂️👮🏻‍♂👮🏼‍♂️👮🏼‍♂👮🏽‍♂️👮🏽‍♂👮🏾‍♂️👮🏾‍♂👮🏿‍♂️👮🏿‍♂👮‍♀️👮‍♀👮🏻‍♀️👮🏻‍♀👮🏼‍♀️👮🏼‍♀👮🏽‍♀️👮🏽‍♀👮🏾‍♀️👮🏾‍♀👮🏿‍♀️👮🏿‍♀🕵️🕵🕵🏻🕵🏼🕵🏽🕵🏾🕵🏿🕵️‍♂️🕵‍♂️🕵️‍♂🕵‍♂🕵🏻‍♂️🕵🏻‍♂🕵🏼‍♂️🕵🏼‍♂🕵🏽‍♂️🕵🏽‍♂🕵🏾‍♂️🕵🏾‍♂🕵🏿‍♂️🕵🏿‍♂🕵️‍♀️🕵‍♀️🕵️‍♀🕵‍♀🕵🏻‍♀️🕵🏻‍♀🕵🏼‍♀️🕵🏼‍♀🕵🏽‍♀️🕵🏽‍♀🕵🏾‍♀️🕵🏾‍♀🕵🏿‍♀️🕵🏿‍♀💂💂🏻💂🏼💂🏽💂🏾💂🏿💂‍♂️💂‍♂💂🏻‍♂️💂🏻‍♂💂🏼‍♂️💂🏼‍♂💂🏽‍♂️💂🏽‍♂💂🏾‍♂️💂🏾‍♂💂🏿‍♂️💂🏿‍♂💂‍♀️💂‍♀💂🏻‍♀️💂🏻‍♀💂🏼‍♀️💂🏼‍♀💂🏽‍♀️💂🏽‍♀💂🏾‍♀️💂🏾‍♀💂🏿‍♀️💂🏿‍♀👷👷🏻👷🏼👷🏽👷🏾👷🏿👷‍♂️👷‍♂👷🏻‍♂️👷🏻‍♂👷🏼‍♂️👷🏼‍♂👷🏽‍♂️👷🏽‍♂👷🏾‍♂️👷🏾‍♂👷🏿‍♂️👷🏿‍♂👷‍♀️👷‍♀👷🏻‍♀️👷🏻‍♀👷🏼‍♀️👷🏼‍♀👷🏽‍♀️👷🏽‍♀👷🏾‍♀️👷🏾‍♀👷🏿‍♀️👷🏿‍♀🤴🤴🏻🤴🏼🤴🏽🤴🏾🤴🏿👸👸🏻👸🏼👸🏽👸🏾👸🏿👳👳🏻👳🏼👳🏽👳🏾👳🏿👳‍♂️👳‍♂👳🏻‍♂️👳🏻‍♂👳🏼‍♂️👳🏼‍♂👳🏽‍♂️👳🏽‍♂👳🏾‍♂️👳🏾‍♂👳🏿‍♂️👳🏿‍♂👳‍♀️👳‍♀👳🏻‍♀️👳🏻‍♀👳🏼‍♀️👳🏼‍♀👳🏽‍♀️👳🏽‍♀👳🏾‍♀️👳🏾‍♀👳🏿‍♀️👳🏿‍♀👲👲🏻👲🏼👲🏽👲🏾👲🏿🧕🧕🏻🧕🏼🧕🏽🧕🏾🧕🏿🧔🧔🏻🧔🏼🧔🏽🧔🏾🧔🏿👱👱🏻👱🏼👱🏽👱🏾👱🏿👱‍♂️👱‍♂👱🏻‍♂️👱🏻‍♂👱🏼‍♂️👱🏼‍♂👱🏽‍♂️👱🏽‍♂👱🏾‍♂️👱🏾‍♂👱🏿‍♂️👱🏿‍♂👱‍♀️👱‍♀👱🏻‍♀️👱🏻‍♀👱🏼‍♀️👱🏼‍♀👱🏽‍♀️👱🏽‍♀👱🏾‍♀️👱🏾‍♀👱🏿‍♀️👱🏿‍♀👨‍🦰👨🏻‍🦰👨🏼‍🦰👨🏽‍🦰👨🏾‍🦰👨🏿‍🦰👩‍🦰👩🏻‍🦰👩🏼‍🦰👩🏽‍🦰👩🏾‍🦰👩🏿‍🦰👨‍🦱👨🏻‍🦱👨🏼‍🦱👨🏽‍🦱👨🏾‍🦱👨🏿‍🦱👩‍🦱👩🏻‍🦱👩🏼‍🦱👩🏽‍🦱👩🏾‍🦱👩🏿‍🦱👨‍🦲👨🏻‍🦲👨🏼‍🦲👨🏽‍🦲👨🏾‍🦲👨🏿‍🦲👩‍🦲👩🏻‍🦲👩🏼‍🦲👩🏽‍🦲👩🏾‍🦲👩🏿‍🦲👨‍🦳👨🏻‍🦳👨🏼‍🦳👨🏽‍🦳👨🏾‍🦳👨🏿‍🦳👩‍🦳👩🏻‍🦳👩🏼‍🦳👩🏽‍🦳👩🏾‍🦳👩🏿‍🦳🤵🤵🏻🤵🏼🤵🏽🤵🏾🤵🏿👰👰🏻👰🏼👰🏽👰🏾👰🏿🤰🤰🏻🤰🏼🤰🏽🤰🏾🤰🏿🤱🤱🏻🤱🏼🤱🏽🤱🏾🤱🏿👼👼🏻👼🏼👼🏽👼🏾👼🏿🎅🎅🏻🎅🏼🎅🏽🎅🏾🎅🏿🤶🤶🏻🤶🏼🤶🏽🤶🏾🤶🏿🦸🦸🏻🦸🏼🦸🏽🦸🏾🦸🏿🦸‍♀️🦸‍♀🦸🏻‍♀️🦸🏻‍♀🦸🏼‍♀️🦸🏼‍♀🦸🏽‍♀️🦸🏽‍♀🦸🏾‍♀️🦸🏾‍♀🦸🏿‍♀️🦸🏿‍♀🦸‍♂️🦸‍♂🦸🏻‍♂️🦸🏻‍♂🦸🏼‍♂️🦸🏼‍♂🦸🏽‍♂️🦸🏽‍♂🦸🏾‍♂️🦸🏾‍♂🦸🏿‍♂️🦸🏿‍♂🦹🦹🏻🦹🏼🦹🏽🦹🏾🦹🏿🦹‍♀️🦹‍♀🦹🏻‍♀️🦹🏻‍♀🦹🏼‍♀️🦹🏼‍♀🦹🏽‍♀️🦹🏽‍♀🦹🏾‍♀️🦹🏾‍♀🦹🏿‍♀️🦹🏿‍♀🦹‍♂️🦹‍♂🦹🏻‍♂️🦹🏻‍♂🦹🏼‍♂️🦹🏼‍♂🦹🏽‍♂️🦹🏽‍♂🦹🏾‍♂️🦹🏾‍♂🦹🏿‍♂️🦹🏿‍♂🧙🧙🏻🧙🏼🧙🏽🧙🏾🧙🏿🧙‍♀️🧙‍♀🧙🏻‍♀️🧙🏻‍♀🧙🏼‍♀️🧙🏼‍♀🧙🏽‍♀️🧙🏽‍♀🧙🏾‍♀️🧙🏾‍♀🧙🏿‍♀️🧙🏿‍♀🧙‍♂️🧙‍♂🧙🏻‍♂️🧙🏻‍♂🧙🏼‍♂️🧙🏼‍♂🧙🏽‍♂️🧙🏽‍♂🧙🏾‍♂️🧙🏾‍♂🧙🏿‍♂️🧙🏿‍♂🧚🧚🏻🧚🏼🧚🏽🧚🏾🧚🏿🧚‍♀️🧚‍♀🧚🏻‍♀️🧚🏻‍♀🧚🏼‍♀️🧚🏼‍♀🧚🏽‍♀️🧚🏽‍♀🧚🏾‍♀️🧚🏾‍♀🧚🏿‍♀️🧚🏿‍♀🧚‍♂️🧚‍♂🧚🏻‍♂️🧚🏻‍♂🧚🏼‍♂️🧚🏼‍♂🧚🏽‍♂️🧚🏽‍♂🧚🏾‍♂️🧚🏾‍♂🧚🏿‍♂️🧚🏿‍♂🧛🧛🏻🧛🏼🧛🏽🧛🏾🧛🏿🧛‍♀️🧛‍♀🧛🏻‍♀️🧛🏻‍♀🧛🏼‍♀️🧛🏼‍♀🧛🏽‍♀️🧛🏽‍♀🧛🏾‍♀️🧛🏾‍♀🧛🏿‍♀️🧛🏿‍♀🧛‍♂️🧛‍♂🧛🏻‍♂️🧛🏻‍♂🧛🏼‍♂️🧛🏼‍♂🧛🏽‍♂️🧛🏽‍♂🧛🏾‍♂️🧛🏾‍♂🧛🏿‍♂️🧛🏿‍♂🧜🧜🏻🧜🏼🧜🏽🧜🏾🧜🏿🧜‍♀️🧜‍♀🧜🏻‍♀️🧜🏻‍♀🧜🏼‍♀️🧜🏼‍♀🧜🏽‍♀️🧜🏽‍♀🧜🏾‍♀️🧜🏾‍♀🧜🏿‍♀️🧜🏿‍♀🧜‍♂️🧜‍♂🧜🏻‍♂️🧜🏻‍♂🧜🏼‍♂️🧜🏼‍♂🧜🏽‍♂️🧜🏽‍♂🧜🏾‍♂️🧜🏾‍♂🧜🏿‍♂️🧜🏿‍♂🧝🧝🏻🧝🏼🧝🏽🧝🏾🧝🏿🧝‍♀️🧝‍♀🧝🏻‍♀️🧝🏻‍♀🧝🏼‍♀️🧝🏼‍♀🧝🏽‍♀️🧝🏽‍♀🧝🏾‍♀️🧝🏾‍♀🧝🏿‍♀️🧝🏿‍♀🧝‍♂️🧝‍♂🧝🏻‍♂️🧝🏻‍♂🧝🏼‍♂️🧝🏼‍♂🧝🏽‍♂️🧝🏽‍♂🧝🏾‍♂️🧝🏾‍♂🧝🏿‍♂️🧝🏿‍♂🧞🧞‍♀️🧞‍♀🧞‍♂️🧞‍♂🧟🧟‍♀️🧟‍♀🧟‍♂️🧟‍♂🙍🙍🏻🙍🏼🙍🏽🙍🏾🙍🏿🙍‍♂️🙍‍♂🙍🏻‍♂️🙍🏻‍♂🙍🏼‍♂️🙍🏼‍♂🙍🏽‍♂️🙍🏽‍♂🙍🏾‍♂️🙍🏾‍♂🙍🏿‍♂️🙍🏿‍♂🙍‍♀️🙍‍♀🙍🏻‍♀️🙍🏻‍♀🙍🏼‍♀️🙍🏼‍♀🙍🏽‍♀️🙍🏽‍♀🙍🏾‍♀️🙍🏾‍♀🙍🏿‍♀️🙍🏿‍♀🙎🙎🏻🙎🏼🙎🏽🙎🏾🙎🏿🙎‍♂️🙎‍♂🙎🏻‍♂️🙎🏻‍♂🙎🏼‍♂️🙎🏼‍♂🙎🏽‍♂️🙎🏽‍♂🙎🏾‍♂️🙎🏾‍♂🙎🏿‍♂️🙎🏿‍♂🙎‍♀️🙎‍♀🙎🏻‍♀️🙎🏻‍♀🙎🏼‍♀️🙎🏼‍♀🙎🏽‍♀️🙎🏽‍♀🙎🏾‍♀️🙎🏾‍♀🙎🏿‍♀️🙎🏿‍♀🙅🙅🏻🙅🏼🙅🏽🙅🏾🙅🏿🙅‍♂️🙅‍♂🙅🏻‍♂️🙅🏻‍♂🙅🏼‍♂️🙅🏼‍♂🙅🏽‍♂️🙅🏽‍♂🙅🏾‍♂️🙅🏾‍♂🙅🏿‍♂️🙅🏿‍♂🙅‍♀️🙅‍♀🙅🏻‍♀️🙅🏻‍♀🙅🏼‍♀️🙅🏼‍♀🙅🏽‍♀️🙅🏽‍♀🙅🏾‍♀️🙅🏾‍♀🙅🏿‍♀️🙅🏿‍♀🙆🙆🏻🙆🏼🙆🏽🙆🏾🙆🏿🙆‍♂️🙆‍♂🙆🏻‍♂️🙆🏻‍♂🙆🏼‍♂️🙆🏼‍♂🙆🏽‍♂️🙆🏽‍♂🙆🏾‍♂️🙆🏾‍♂🙆🏿‍♂️🙆🏿‍♂🙆‍♀️🙆‍♀🙆🏻‍♀️🙆🏻‍♀🙆🏼‍♀️🙆🏼‍♀🙆🏽‍♀️🙆🏽‍♀🙆🏾‍♀️🙆🏾‍♀🙆🏿‍♀️🙆🏿‍♀💁💁🏻💁🏼💁🏽💁🏾💁🏿💁‍♂️💁‍♂💁🏻‍♂️💁🏻‍♂💁🏼‍♂️💁🏼‍♂💁🏽‍♂️💁🏽‍♂💁🏾‍♂️💁🏾‍♂💁🏿‍♂️💁🏿‍♂💁‍♀️💁‍♀💁🏻‍♀️💁🏻‍♀💁🏼‍♀️💁🏼‍♀💁🏽‍♀️💁🏽‍♀💁🏾‍♀️💁🏾‍♀💁🏿‍♀️💁🏿‍♀🙋🙋🏻🙋🏼🙋🏽🙋🏾🙋🏿🙋‍♂️🙋‍♂🙋🏻‍♂️🙋🏻‍♂🙋🏼‍♂️🙋🏼‍♂🙋🏽‍♂️🙋🏽‍♂🙋🏾‍♂️🙋🏾‍♂🙋🏿‍♂️🙋🏿‍♂🙋‍♀️🙋‍♀🙋🏻‍♀️🙋🏻‍♀🙋🏼‍♀️🙋🏼‍♀🙋🏽‍♀️🙋🏽‍♀🙋🏾‍♀️🙋🏾‍♀🙋🏿‍♀️🙋🏿‍♀🙇🙇🏻🙇🏼🙇🏽🙇🏾🙇🏿🙇‍♂️🙇‍♂🙇🏻‍♂️🙇🏻‍♂🙇🏼‍♂️🙇🏼‍♂🙇🏽‍♂️🙇🏽‍♂🙇🏾‍♂️🙇🏾‍♂🙇🏿‍♂️🙇🏿‍♂🙇‍♀️🙇‍♀🙇🏻‍♀️🙇🏻‍♀🙇🏼‍♀️🙇🏼‍♀🙇🏽‍♀️🙇🏽‍♀🙇🏾‍♀️🙇🏾‍♀🙇🏿‍♀️🙇🏿‍♀🤦🤦🏻🤦🏼🤦🏽🤦🏾🤦🏿🤦‍♂️🤦‍♂🤦🏻‍♂️🤦🏻‍♂🤦🏼‍♂️🤦🏼‍♂🤦🏽‍♂️🤦🏽‍♂🤦🏾‍♂️🤦🏾‍♂🤦🏿‍♂️🤦🏿‍♂🤦‍♀️🤦‍♀🤦🏻‍♀️🤦🏻‍♀🤦🏼‍♀️🤦🏼‍♀🤦🏽‍♀️🤦🏽‍♀🤦🏾‍♀️🤦🏾‍♀🤦🏿‍♀️🤦🏿‍♀🤷🤷🏻🤷🏼🤷🏽🤷🏾🤷🏿🤷‍♂️🤷‍♂🤷🏻‍♂️🤷🏻‍♂🤷🏼‍♂️🤷🏼‍♂🤷🏽‍♂️🤷🏽‍♂🤷🏾‍♂️🤷🏾‍♂🤷🏿‍♂️🤷🏿‍♂🤷‍♀️🤷‍♀🤷🏻‍♀️🤷🏻‍♀🤷🏼‍♀️🤷🏼‍♀🤷🏽‍♀️🤷🏽‍♀🤷🏾‍♀️🤷🏾‍♀🤷🏿‍♀️🤷🏿‍♀💆💆🏻💆🏼💆🏽💆🏾💆🏿💆‍♂️💆‍♂💆🏻‍♂️💆🏻‍♂💆🏼‍♂️💆🏼‍♂💆🏽‍♂️💆🏽‍♂💆🏾‍♂️💆🏾‍♂💆🏿‍♂️💆🏿‍♂💆‍♀️💆‍♀💆🏻‍♀️💆🏻‍♀💆🏼‍♀️💆🏼‍♀💆🏽‍♀️💆🏽‍♀💆🏾‍♀️💆🏾‍♀💆🏿‍♀️💆🏿‍♀💇💇🏻💇🏼💇🏽💇🏾💇🏿💇‍♂️💇‍♂💇🏻‍♂️💇🏻‍♂💇🏼‍♂️💇🏼‍♂💇🏽‍♂️💇🏽‍♂💇🏾‍♂️💇🏾‍♂💇🏿‍♂️💇🏿‍♂💇‍♀️💇‍♀💇🏻‍♀️💇🏻‍♀💇🏼‍♀️💇🏼‍♀💇🏽‍♀️💇🏽‍♀💇🏾‍♀️💇🏾‍♀💇🏿‍♀️💇🏿‍♀🚶🚶🏻🚶🏼🚶🏽🚶🏾🚶🏿🚶‍♂️🚶‍♂🚶🏻‍♂️🚶🏻‍♂🚶🏼‍♂️🚶🏼‍♂🚶🏽‍♂️🚶🏽‍♂🚶🏾‍♂️🚶🏾‍♂🚶🏿‍♂️🚶🏿‍♂🚶‍♀️🚶‍♀🚶🏻‍♀️🚶🏻‍♀🚶🏼‍♀️🚶🏼‍♀🚶🏽‍♀️🚶🏽‍♀🚶🏾‍♀️🚶🏾‍♀🚶🏿‍♀️🚶🏿‍♀🏃🏃🏻🏃🏼🏃🏽🏃🏾🏃🏿🏃‍♂️🏃‍♂🏃🏻‍♂️🏃🏻‍♂🏃🏼‍♂️🏃🏼‍♂🏃🏽‍♂️🏃🏽‍♂🏃🏾‍♂️🏃🏾‍♂🏃🏿‍♂️🏃🏿‍♂🏃‍♀️🏃‍♀🏃🏻‍♀️🏃🏻‍♀🏃🏼‍♀️🏃🏼‍♀🏃🏽‍♀️🏃🏽‍♀🏃🏾‍♀️🏃🏾‍♀🏃🏿‍♀️🏃🏿‍♀💃💃🏻💃🏼💃🏽💃🏾💃🏿🕺🕺🏻🕺🏼🕺🏽🕺🏾🕺🏿👯👯‍♂️👯‍♂👯‍♀️👯‍♀🧖🧖🏻🧖🏼🧖🏽🧖🏾🧖🏿🧖‍♀️🧖‍♀🧖🏻‍♀️🧖🏻‍♀🧖🏼‍♀️🧖🏼‍♀🧖🏽‍♀️🧖🏽‍♀🧖🏾‍♀️🧖🏾‍♀🧖🏿‍♀️🧖🏿‍♀🧖‍♂️🧖‍♂🧖🏻‍♂️🧖🏻‍♂🧖🏼‍♂️🧖🏼‍♂🧖🏽‍♂️🧖🏽‍♂🧖🏾‍♂️🧖🏾‍♂🧖🏿‍♂️🧖🏿‍♂🧗🧗🏻🧗🏼🧗🏽🧗🏾🧗🏿🧗‍♀️🧗‍♀🧗🏻‍♀️🧗🏻‍♀🧗🏼‍♀️🧗🏼‍♀🧗🏽‍♀️🧗🏽‍♀🧗🏾‍♀️🧗🏾‍♀🧗🏿‍♀️🧗🏿‍♀🧗‍♂️🧗‍♂🧗🏻‍♂️🧗🏻‍♂🧗🏼‍♂️🧗🏼‍♂🧗🏽‍♂️🧗🏽‍♂🧗🏾‍♂️🧗🏾‍♂🧗🏿‍♂️🧗🏿‍♂🧘🧘🏻🧘🏼🧘🏽🧘🏾🧘🏿🧘‍♀️🧘‍♀🧘🏻‍♀️🧘🏻‍♀🧘🏼‍♀️🧘🏼‍♀🧘🏽‍♀️🧘🏽‍♀🧘🏾‍♀️🧘🏾‍♀🧘🏿‍♀️🧘🏿‍♀🧘‍♂️🧘‍♂🧘🏻‍♂️🧘🏻‍♂🧘🏼‍♂️🧘🏼‍♂🧘🏽‍♂️🧘🏽‍♂🧘🏾‍♂️🧘🏾‍♂🧘🏿‍♂️🧘🏿‍♂🛀🛀🏻🛀🏼🛀🏽🛀🏾🛀🏿🛌🛌🏻🛌🏼🛌🏽🛌🏾🛌🏿🕴️🕴🕴🏻🕴🏼🕴🏽🕴🏾🕴🏿🗣️🗣👤👥🤺🏇🏇🏻🏇🏼🏇🏽🏇🏾🏇🏿⛷️⛷🏂🏂🏻🏂🏼🏂🏽🏂🏾🏂🏿🏌️🏌🏌🏻🏌🏼🏌🏽🏌🏾🏌🏿🏌️‍♂️🏌‍♂️🏌️‍♂🏌‍♂🏌🏻‍♂️🏌🏻‍♂🏌🏼‍♂️🏌🏼‍♂🏌🏽‍♂️🏌🏽‍♂🏌🏾‍♂️🏌🏾‍♂🏌🏿‍♂️🏌🏿‍♂🏌️‍♀️🏌‍♀️🏌️‍♀🏌‍♀🏌🏻‍♀️🏌🏻‍♀🏌🏼‍♀️🏌🏼‍♀🏌🏽‍♀️🏌🏽‍♀🏌🏾‍♀️🏌🏾‍♀🏌🏿‍♀️🏌🏿‍♀🏄🏄🏻🏄🏼🏄🏽🏄🏾🏄🏿🏄‍♂️🏄‍♂🏄🏻‍♂️🏄🏻‍♂🏄🏼‍♂️🏄🏼‍♂🏄🏽‍♂️🏄🏽‍♂🏄🏾‍♂️🏄🏾‍♂🏄🏿‍♂️🏄🏿‍♂🏄‍♀️🏄‍♀🏄🏻‍♀️🏄🏻‍♀🏄🏼‍♀️🏄🏼‍♀🏄🏽‍♀️🏄🏽‍♀🏄🏾‍♀️🏄🏾‍♀🏄🏿‍♀️🏄🏿‍♀🚣🚣🏻🚣🏼🚣🏽🚣🏾🚣🏿🚣‍♂️🚣‍♂🚣🏻‍♂️🚣🏻‍♂🚣🏼‍♂️🚣🏼‍♂🚣🏽‍♂️🚣🏽‍♂🚣🏾‍♂️🚣🏾‍♂🚣🏿‍♂️🚣🏿‍♂🚣‍♀️🚣‍♀🚣🏻‍♀️🚣🏻‍♀🚣🏼‍♀️🚣🏼‍♀🚣🏽‍♀️🚣🏽‍♀🚣🏾‍♀️🚣🏾‍♀🚣🏿‍♀️🚣🏿‍♀🏊🏊🏻🏊🏼🏊🏽🏊🏾🏊🏿🏊‍♂️🏊‍♂🏊🏻‍♂️🏊🏻‍♂🏊🏼‍♂️🏊🏼‍♂🏊🏽‍♂️🏊🏽‍♂🏊🏾‍♂️🏊🏾‍♂🏊🏿‍♂️🏊🏿‍♂🏊‍♀️🏊‍♀🏊🏻‍♀️🏊🏻‍♀🏊🏼‍♀️🏊🏼‍♀🏊🏽‍♀️🏊🏽‍♀🏊🏾‍♀️🏊🏾‍♀🏊🏿‍♀️🏊🏿‍♀⛹️⛹⛹🏻⛹🏼⛹🏽⛹🏾⛹🏿⛹️‍♂️⛹‍♂️⛹️‍♂⛹‍♂⛹🏻‍♂️⛹🏻‍♂⛹🏼‍♂️⛹🏼‍♂⛹🏽‍♂️⛹🏽‍♂⛹🏾‍♂️⛹🏾‍♂⛹🏿‍♂️⛹🏿‍♂⛹️‍♀️⛹‍♀️⛹️‍♀⛹‍♀⛹🏻‍♀️⛹🏻‍♀⛹🏼‍♀️⛹🏼‍♀⛹🏽‍♀️⛹🏽‍♀⛹🏾‍♀️⛹🏾‍♀⛹🏿‍♀️⛹🏿‍♀🏋️🏋🏋🏻🏋🏼🏋🏽🏋🏾🏋🏿🏋️‍♂️🏋‍♂️🏋️‍♂🏋‍♂🏋🏻‍♂️🏋🏻‍♂🏋🏼‍♂️🏋🏼‍♂🏋🏽‍♂️🏋🏽‍♂🏋🏾‍♂️🏋🏾‍♂🏋🏿‍♂️🏋🏿‍♂🏋️‍♀️🏋‍♀️🏋️‍♀🏋‍♀🏋🏻‍♀️🏋🏻‍♀🏋🏼‍♀️🏋🏼‍♀🏋🏽‍♀️🏋🏽‍♀🏋🏾‍♀️🏋🏾‍♀🏋🏿‍♀️🏋🏿‍♀🚴🚴🏻🚴🏼🚴🏽🚴🏾🚴🏿🚴‍♂️🚴‍♂🚴🏻‍♂️🚴🏻‍♂🚴🏼‍♂️🚴🏼‍♂🚴🏽‍♂️🚴🏽‍♂🚴🏾‍♂️🚴🏾‍♂🚴🏿‍♂️🚴🏿‍♂🚴‍♀️🚴‍♀🚴🏻‍♀️🚴🏻‍♀🚴🏼‍♀️🚴🏼‍♀🚴🏽‍♀️🚴🏽‍♀🚴🏾‍♀️🚴🏾‍♀🚴🏿‍♀️🚴🏿‍♀🚵🚵🏻🚵🏼🚵🏽🚵🏾🚵🏿🚵‍♂️🚵‍♂🚵🏻‍♂️🚵🏻‍♂🚵🏼‍♂️🚵🏼‍♂🚵🏽‍♂️🚵🏽‍♂🚵🏾‍♂️🚵🏾‍♂🚵🏿‍♂️🚵🏿‍♂🚵‍♀️🚵‍♀🚵🏻‍♀️🚵🏻‍♀🚵🏼‍♀️🚵🏼‍♀🚵🏽‍♀️🚵🏽‍♀🚵🏾‍♀️🚵🏾‍♀🚵🏿‍♀️🚵🏿‍♀🏎️🏎🏍️🏍🤸🤸🏻🤸🏼🤸🏽🤸🏾🤸🏿🤸‍♂️🤸‍♂🤸🏻‍♂️🤸🏻‍♂🤸🏼‍♂️🤸🏼‍♂🤸🏽‍♂️🤸🏽‍♂🤸🏾‍♂️🤸🏾‍♂🤸🏿‍♂️🤸🏿‍♂🤸‍♀️🤸‍♀🤸🏻‍♀️🤸🏻‍♀🤸🏼‍♀️🤸🏼‍♀🤸🏽‍♀️🤸🏽‍♀🤸🏾‍♀️🤸🏾‍♀🤸🏿‍♀️🤸🏿‍♀🤼🤼‍♂️🤼‍♂🤼‍♀️🤼‍♀🤽🤽🏻🤽🏼🤽🏽🤽🏾🤽🏿🤽‍♂️🤽‍♂🤽🏻‍♂️🤽🏻‍♂🤽🏼‍♂️🤽🏼‍♂🤽🏽‍♂️🤽🏽‍♂🤽🏾‍♂️🤽🏾‍♂🤽🏿‍♂️🤽🏿‍♂🤽‍♀️🤽‍♀🤽🏻‍♀️🤽🏻‍♀🤽🏼‍♀️🤽🏼‍♀🤽🏽‍♀️🤽🏽‍♀🤽🏾‍♀️🤽🏾‍♀🤽🏿‍♀️🤽🏿‍♀🤾🤾🏻🤾🏼🤾🏽🤾🏾🤾🏿🤾‍♂️🤾‍♂🤾🏻‍♂️🤾🏻‍♂🤾🏼‍♂️🤾🏼‍♂🤾🏽‍♂️🤾🏽‍♂🤾🏾‍♂️🤾🏾‍♂🤾🏿‍♂️🤾🏿‍♂🤾‍♀️🤾‍♀🤾🏻‍♀️🤾🏻‍♀🤾🏼‍♀️🤾🏼‍♀🤾🏽‍♀️🤾🏽‍♀🤾🏾‍♀️🤾🏾‍♀🤾🏿‍♀️🤾🏿‍♀🤹🤹🏻🤹🏼🤹🏽🤹🏾🤹🏿🤹‍♂️🤹‍♂🤹🏻‍♂️🤹🏻‍♂🤹🏼‍♂️🤹🏼‍♂🤹🏽‍♂️🤹🏽‍♂🤹🏾‍♂️🤹🏾‍♂🤹🏿‍♂️🤹🏿‍♂🤹‍♀️🤹‍♀🤹🏻‍♀️🤹🏻‍♀🤹🏼‍♀️🤹🏼‍♀🤹🏽‍♀️🤹🏽‍♀🤹🏾‍♀️🤹🏾‍♀🤹🏿‍♀️🤹🏿‍♀👫👬👭💏👩‍❤️‍💋‍👨👩‍❤‍💋‍👨👨‍❤️‍💋‍👨👨‍❤‍💋‍👨👩‍❤️‍💋‍👩👩‍❤‍💋‍👩💑👩‍❤️‍👨👩‍❤‍👨👨‍❤️‍👨👨‍❤‍👨👩‍❤️‍👩👩‍❤‍👩👪👨‍👩‍👦👨‍👩‍👧👨‍👩‍👧‍👦👨‍👩‍👦‍👦👨‍👩‍👧‍👧👨‍👨‍👦👨‍👨‍👧👨‍👨‍👧‍👦👨‍👨‍👦‍👦👨‍👨‍👧‍👧👩‍👩‍👦👩‍👩‍👧👩‍👩‍👧‍👦👩‍👩‍👦‍👦👩‍👩‍👧‍👧👨‍👦👨‍👦‍👦👨‍👧👨‍👧‍👦👨‍👧‍👧👩‍👦👩‍👦‍👦👩‍👧👩‍👧‍👦👩‍👧‍👧🤳🤳🏻🤳🏼🤳🏽🤳🏾🤳🏿💪💪🏻💪🏼💪🏽💪🏾💪🏿🦵🦵🏻🦵🏼🦵🏽🦵🏾🦵🏿🦶🦶🏻🦶🏼🦶🏽🦶🏾🦶🏿👈👈🏻👈🏼👈🏽👈🏾👈🏿👉👉🏻👉🏼👉🏽👉🏾👉🏿☝️☝☝🏻☝🏼☝🏽☝🏾☝🏿👆👆🏻👆🏼👆🏽👆🏾👆🏿🖕🖕🏻🖕🏼🖕🏽🖕🏾🖕🏿👇👇🏻👇🏼👇🏽👇🏾👇🏿✌️✌✌🏻✌🏼✌🏽✌🏾✌🏿🤞🤞🏻🤞🏼🤞🏽🤞🏾🤞🏿🖖🖖🏻🖖🏼🖖🏽🖖🏾🖖🏿🤘🤘🏻🤘🏼🤘🏽🤘🏾🤘🏿🤙🤙🏻🤙🏼🤙🏽🤙🏾🤙🏿🖐️🖐🖐🏻🖐🏼🖐🏽🖐🏾🖐🏿✋✋🏻✋🏼✋🏽✋🏾✋🏿👌👌🏻👌🏼👌🏽👌🏾👌🏿👍👍🏻👍🏼👍🏽👍🏾👍🏿👎👎🏻👎🏼👎🏽👎🏾👎🏿✊✊🏻✊🏼✊🏽✊🏾✊🏿👊👊🏻👊🏼👊🏽👊🏾👊🏿🤛🤛🏻🤛🏼🤛🏽🤛🏾🤛🏿🤜🤜🏻🤜🏼🤜🏽🤜🏾🤜🏿🤚🤚🏻🤚🏼🤚🏽🤚🏾🤚🏿👋👋🏻👋🏼👋🏽👋🏾👋🏿🤟🤟🏻🤟🏼🤟🏽🤟🏾🤟🏿✍️✍✍🏻✍🏼✍🏽✍🏾✍🏿👏👏🏻👏🏼👏🏽👏🏾👏🏿👐👐🏻👐🏼👐🏽👐🏾👐🏿🙌🙌🏻🙌🏼🙌🏽🙌🏾🙌🏿🤲🤲🏻🤲🏼🤲🏽🤲🏾🤲🏿🙏🙏🏻🙏🏼🙏🏽🙏🏾🙏🏿🤝💅💅🏻💅🏼💅🏽💅🏾💅🏿👂👂🏻👂🏼👂🏽👂🏾👂🏿👃👃🏻👃🏼👃🏽👃🏾👃🏿🦰🦱🦲🦳👣👀👁️👁👁️‍🗨️👁‍🗨️👁️‍🗨👁‍🗨🧠🦴🦷👅👄💋💘❤️❤💓💔💕💖💗💙💚💛🧡💜🖤💝💞💟❣️❣💌💤💢💣💥💦💨💫💬🗨️🗨🗯️🗯💭🕳️🕳👓🕶️🕶🥽🥼👔👕👖🧣🧤🧥🧦👗👘👙👚👛👜👝🛍️🛍🎒👞👟🥾🥿👠👡👢👑👒🎩🎓🧢⛑️⛑📿💄💍💎🐵🐒🦍🐶🐕🐩🐺🦊🦝🐱🐈🦁🐯🐅🐆🐴🐎🦄🦓🦌🐮🐂🐃🐄🐷🐖🐗🐽🐏🐑🐐🐪🐫🦙🦒🐘🦏🦛🐭🐁🐀🐹🐰🐇🐿️🐿🦔🦇🐻🐨🐼🦘🦡🐾🦃🐔🐓🐣🐤🐥🐦🐧🕊️🕊🦅🦆🦢🦉🦚🦜🐸🐊🐢🦎🐍🐲🐉🦕🦖🐳🐋🐬🐟🐠🐡🦈🐙🐚🦀🦞🦐🦑🐌🦋🐛🐜🐝🐞🦗🕷️🕷🕸️🕸🦂🦟🦠💐🌸💮🏵️🏵🌹🥀🌺🌻🌼🌷🌱🌲🌳🌴🌵🌾🌿☘️☘🍀🍁🍂🍃🍇🍈🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒🍓🥝🍅🥥🥑🍆🥔🥕🌽🌶️🌶🥒🥬🥦🍄🥜🌰🍞🥐🥖🥨🥯🥞🧀🍖🍗🥩🥓🍔🍟🍕🌭🥪🌮🌯🥙🥚🍳🥘🍲🥣🥗🍿🧂🥫🍱🍘🍙🍚🍛🍜🍝🍠🍢🍣🍤🍥🥮🍡🥟🥠🥡🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯🍼🥛☕🍵🍶🍾🍷🍸🍹🍺🍻🥂🥃🥤🥢🍽️🍽🍴🥄🔪🏺🌍🌎🌏🌐🗺️🗺🗾🧭🏔️🏔⛰️⛰🌋🗻🏕️🏕🏖️🏖🏜️🏜🏝️🏝🏞️🏞🏟️🏟🏛️🏛🏗️🏗🧱🏘️🏘🏚️🏚🏠🏡🏢🏣🏤🏥🏦🏨🏩🏪🏫🏬🏭🏯🏰💒🗼🗽⛪🕌🕍⛩️⛩🕋⛲⛺🌁🌃🏙️🏙🌄🌅🌆🌇🌉♨️♨🌌🎠🎡🎢💈🎪🚂🚃🚄🚅🚆🚇🚈🚉🚊🚝🚞🚋🚌🚍🚎🚐🚑🚒🚓🚔🚕🚖🚗🚘🚙🚚🚛🚜🚲🛴🛹🛵🚏🛣️🛣🛤️🛤🛢️🛢⛽🚨🚥🚦🛑🚧⚓⛵🛶🚤🛳️🛳⛴️⛴🛥️🛥🚢✈️✈🛩️🛩🛫🛬💺🚁🚟🚠🚡🛰️🛰🚀🛸🛎️🛎🧳⌛⏳⌚⏰⏱️⏱⏲️⏲🕰️🕰🕛🕧🕐🕜🕑🕝🕒🕞🕓🕟🕔🕠🕕🕡🕖🕢🕗🕣🕘🕤🕙🕥🕚🕦🌑🌒🌓🌔🌕🌖🌗🌘🌙🌚🌛🌜🌡️🌡☀️☀🌝🌞⭐🌟🌠☁️☁⛅⛈️⛈🌤️🌤🌥️🌥🌦️🌦🌧️🌧🌨️🌨🌩️🌩🌪️🌪🌫️🌫🌬️🌬🌀🌈🌂☂️☂☔⛱️⛱⚡❄️❄☃️☃⛄☄️☄🔥💧🌊🎃🎄🎆🎇🧨✨🎈🎉🎊🎋🎍🎎🎏🎐🎑🧧🎀🎁🎗️🎗🎟️🎟🎫🎖️🎖🏆🏅🥇🥈🥉⚽⚾🥎🏀🏐🏈🏉🎾🥏🎳🏏🏑🏒🥍🏓🏸🥊🥋🥅⛳⛸️⛸🎣🎽🎿🛷🥌🎯🎱🔮🧿🎮🕹️🕹🎰🎲🧩🧸♠️♠♥️♥♦️♦♣️♣♟️♟🃏🀄🎴🎭🖼️🖼🎨🧵🧶🔇🔈🔉🔊📢📣📯🔔🔕🎼🎵🎶🎙️🎙🎚️🎚🎛️🎛🎤🎧📻🎷🎸🎹🎺🎻🥁📱📲☎️☎📞📟📠🔋🔌💻🖥️🖥🖨️🖨⌨️⌨🖱️🖱🖲️🖲💽💾💿📀🧮🎥🎞️🎞📽️📽🎬📺📷📸📹📼🔍🔎🕯️🕯💡🔦🏮📔📕📖📗📘📙📚📓📒📃📜📄📰🗞️🗞📑🔖🏷️🏷💰💴💵💶💷💸💳🧾💹💱💲✉️✉📧📨📩📤📥📦📫📪📬📭📮🗳️🗳✏️✏✒️✒🖋️🖋🖊️🖊🖌️🖌🖍️🖍📝💼📁📂🗂️🗂📅📆🗒️🗒🗓️🗓📇📈📉📊📋📌📍📎🖇️🖇📏📐✂️✂🗃️🗃🗄️🗄🗑️🗑🔒🔓🔏🔐🔑🗝️🗝🔨⛏️⛏⚒️⚒🛠️🛠🗡️🗡⚔️⚔🔫🏹🛡️🛡🔧🔩⚙️⚙🗜️🗜⚖️⚖🔗⛓️⛓🧰🧲⚗️⚗🧪🧫🧬🔬🔭📡💉💊🚪🛏️🛏🛋️🛋🚽🚿🛁🧴🧷🧹🧺🧻🧼🧽🧯🛒🚬⚰️⚰⚱️⚱🗿🏧🚮🚰♿🚹🚺🚻🚼🚾🛂🛃🛄🛅⚠️⚠🚸⛔🚫🚳🚭🚯🚱🚷📵🔞☢️☢☣️☣⬆️⬆↗️↗➡️➡↘️↘⬇️⬇↙️↙⬅️⬅↖️↖↕️↕↔️↔↩️↩↪️↪⤴️⤴⤵️⤵🔃🔄🔙🔚🔛🔜🔝🛐⚛️⚛🕉️🕉✡️✡☸️☸☯️☯✝️✝☦️☦☪️☪☮️☮🕎🔯♈♉♊♋♌♍♎♏♐♑♒♓⛎🔀🔁🔂▶️▶⏩⏭️⏭⏯️⏯◀️◀⏪⏮️⏮🔼⏫🔽⏬⏸️⏸⏹️⏹⏺️⏺⏏️⏏🎦🔅🔆📶📳📴♀️♀♂️♂⚕️⚕♾️♾♻️♻⚜️⚜🔱📛🔰⭕✅☑️☑✔️✔✖️✖❌❎➕➖➗➰➿〽️〽✳️✳✴️✴❇️❇‼️‼⁉️⁉❓❔❕❗〰️〰©️©®️®™️™#️⃣#⃣*️⃣*⃣0️⃣0⃣1️⃣1⃣2️⃣2⃣3️⃣3⃣4️⃣4⃣5️⃣5⃣6️⃣6⃣7️⃣7⃣8️⃣8⃣9️⃣9⃣🔟💯🔠🔡🔢🔣🔤🅰️🅰🆎🅱️🅱🆑🆒🆓ℹ️ℹ🆔Ⓜ️Ⓜ🆕🆖🅾️🅾🆗🅿️🅿🆘🆙🆚🈁🈂️🈂🈷️🈷🈶🈯🉐🈹🈚🈲🉑🈸🈴🈳㊗️㊗㊙️㊙🈺🈵▪️▪▫️▫◻️◻◼️◼◽◾⬛⬜🔶🔷🔸🔹🔺🔻💠🔘🔲🔳⚪⚫🔴🔵🏁🚩🎌🏴🏳️🏳🏳️‍🌈🏳‍🌈🏴‍☠️🏴‍☠🇦🇨🇦🇩🇦🇪🇦🇫🇦🇬🇦🇮🇦🇱🇦🇲🇦🇴🇦🇶🇦🇷🇦🇸🇦🇹🇦🇺🇦🇼🇦🇽🇦🇿🇧🇦🇧🇧🇧🇩🇧🇪🇧🇫🇧🇬🇧🇭🇧🇮🇧🇯🇧🇱🇧🇲🇧🇳🇧🇴🇧🇶🇧🇷🇧🇸🇧🇹🇧🇻🇧🇼🇧🇾🇧🇿🇨🇦🇨🇨🇨🇩🇨🇫🇨🇬🇨🇭🇨🇮🇨🇰🇨🇱🇨🇲🇨🇳🇨🇴🇨🇵🇨🇷🇨🇺🇨🇻🇨🇼🇨🇽🇨🇾🇨🇿🇩🇪🇩🇬🇩🇯🇩🇰🇩🇲🇩🇴🇩🇿🇪🇦🇪🇨🇪🇪🇪🇬🇪🇭🇪🇷🇪🇸🇪🇹🇪🇺🇫🇮🇫🇯🇫🇰🇫🇲🇫🇴🇫🇷🇬🇦🇬🇧🇬🇩🇬🇪🇬🇫🇬🇬🇬🇭🇬🇮🇬🇱🇬🇲🇬🇳🇬🇵🇬🇶🇬🇷🇬🇸🇬🇹🇬🇺🇬🇼🇬🇾🇭🇰🇭🇲🇭🇳🇭🇷🇭🇹🇭🇺🇮🇨🇮🇩🇮🇪🇮🇱🇮🇲🇮🇳🇮🇴🇮🇶🇮🇷🇮🇸🇮🇹🇯🇪🇯🇲🇯🇴🇯🇵🇰🇪🇰🇬🇰🇭🇰🇮🇰🇲🇰🇳🇰🇵🇰🇷🇰🇼🇰🇾🇰🇿🇱🇦🇱🇧🇱🇨🇱🇮🇱🇰🇱🇷🇱🇸🇱🇹🇱🇺🇱🇻🇱🇾🇲🇦🇲🇨🇲🇩🇲🇪🇲🇫🇲🇬🇲🇭🇲🇰🇲🇱🇲🇲🇲🇳🇲🇴🇲🇵🇲🇶🇲🇷🇲🇸🇲🇹🇲🇺🇲🇻🇲🇼🇲🇽🇲🇾🇲🇿🇳🇦🇳🇨🇳🇪🇳🇫🇳🇬🇳🇮🇳🇱🇳🇴🇳🇵🇳🇷🇳🇺🇳🇿🇴🇲🇵🇦🇵🇪🇵🇫🇵🇬🇵🇭🇵🇰🇵🇱🇵🇲🇵🇳🇵🇷🇵🇸🇵🇹🇵🇼🇵🇾🇶🇦🇷🇪🇷🇴🇷🇸🇷🇺🇷🇼🇸🇦🇸🇧🇸🇨🇸🇩🇸🇪🇸🇬🇸🇭🇸🇮🇸🇯🇸🇰🇸🇱🇸🇲🇸🇳🇸🇴🇸🇷🇸🇸🇸🇹🇸🇻🇸🇽🇸🇾🇸🇿🇹🇦🇹🇨🇹🇩🇹🇫🇹🇬🇹🇭🇹🇯🇹🇰🇹🇱🇹🇲🇹🇳🇹🇴🇹🇷🇹🇹🇹🇻🇹🇼🇹🇿🇺🇦🇺🇬🇺🇲🇺🇳🇺🇸🇺🇾🇺🇿🇻🇦🇻🇨🇻🇪🇻🇬🇻🇮🇻🇳🇻🇺🇼🇫🇼🇸🇽🇰🇾🇪🇾🇹🇿🇦🇿🇲🇿🇼🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  )
  expect(() => emoji.parse(':-)')).toThrow()
  expect(() => emoji.parse('😀 is an emoji')).toThrow()
  expect(() => emoji.parse('😀stuff')).toThrow()
  expect(() => emoji.parse('stuff😀')).toThrow()
})

it('uuid', () => {
  const uuid = v.string.uuid(() => 'custom error')
  uuid.parse('9491d710-3185-4e06-bea0-6a2f275345e0')
  uuid.parse('00000000-0000-0000-0000-000000000000')
  uuid.parse('b3ce60f8-e8b9-40f5-1150-172ede56ff74') // Variant 0 - RFC 4122: Reserved, NCS backward compatibility
  uuid.parse('92e76bf9-28b3-4730-cd7f-cb6bc51f8c09') // Variant 2 - RFC 4122: Reserved, Microsoft Corporation backward compatibility
  const result = uuid.safeParse('9491d710-3185-4e06-bea0-6a2f275345e0X')
  expect(v.isResult(result)).toEqual(false)
  if (!v.isResult(result)) expect(v.firstErrorFromResultError(result)).toEqual('custom error')
})

it('bad uuid', () => {
  const uuid = v.string.uuid(() => 'custom error')
  uuid.parse('9491d710-3185-4e06-bea0-6a2f275345e0')
  const result = uuid.safeParse('invalid uuid')
  expect(v.isResult(result)).toEqual(false)
  if (!v.isResult(result)) expect(v.firstErrorFromResultError(result)).toEqual('custom error')
})

it('cuid', () => {
  const cuid = v.string.cuid(() => 'Invalid cuid')
  cuid.parse('ckopqwooh000001la8mbi2im9')
  const result = cuid.safeParse('cifjhdsfhsd-invalid-cuid')
  expect(v.isResult(result)).toEqual(false)
  if (!v.isResult(result)) expect(v.firstErrorFromResultError(result)).toEqual('Invalid cuid')
})

it('cuid2', () => {
  const cuid2 = v.string.cuid2(() => 'Invalid cuid2')
  const validStrings = [
    'a', // short string
    'tz4a98xxat96iws9zmbrgj3a', // normal string
    'kf5vz6ssxe4zjcb409rjgo747tc5qjazgptvotk6', // longer than require("@paralleldrive/cuid2").bigLength
  ]
  validStrings.forEach((s) => cuid2.parse(s))
  const invalidStrings = [
    '', // empty string
    '1z4a98xxat96iws9zmbrgj3a', // starts with a number
    'tz4a98xxat96iws9zMbrgj3a', // include uppercase
    'tz4a98xxat96iws-zmbrgj3a', // involve symbols
  ]
  const results = invalidStrings.map((s) => cuid2.safeParse(s))
  expect(results.every((r) => !v.isResult(r))).toEqual(true)
  if (!v.isResult(results[0]))
    expect(v.firstErrorFromResultError(results[0])).toEqual('Invalid cuid2')
})

it('ulid', () => {
  const ulid = v.string.ulid(() => 'Invalid ulid')
  ulid.parse('01ARZ3NDEKTSV4RRFFQ69G5FAV')
  const result = ulid.safeParse('invalidulid')
  expect(v.isResult(result)).toEqual(false)
  if (!v.isResult(result)) expect(v.firstErrorFromResultError(result)).toEqual('Invalid ulid')
})

it('regex', () => {
  v.string.regex(/^moo+$/).parse('mooooo')
  expect(() => v.string.uuid().parse('purr')).toThrow()
})

it('regexp error message', () => {
  const result = v.string.regex(/^moo+$/, () => 'Invalid').safeParse('boooo')
  if (!v.isResult(result)) expect(v.firstErrorFromResultError(result)).toEqual('Invalid')
  else throw new Error('validation should have failed')

  expect(() => v.string.uuid().parse('purr')).toThrow()
})

it('regex lastIndex reset', () => {
  const schema = v.string.regex(/^\d+$/g)
  expect(v.isResult(schema.safeParse('123'))).toEqual(true)
  expect(v.isResult(schema.safeParse('123'))).toEqual(true)
  expect(v.isResult(schema.safeParse('123'))).toEqual(true)
  expect(v.isResult(schema.safeParse('123'))).toEqual(true)
  expect(v.isResult(schema.safeParse('123'))).toEqual(true)
})

// it('checks getters', () => {
//   expect(v.string.email().isEmail).toEqual(true)
//   expect(v.string.email().isURL).toEqual(false)
//   expect(v.string.email().isCUID).toEqual(false)
//   expect(v.string.email().isCUID2).toEqual(false)
//   expect(v.string.email().isUUID).toEqual(false)
//   expect(v.string.email().isIP).toEqual(false)
//   expect(v.string.email().isULID).toEqual(false)

//   expect(v.string.url().isEmail).toEqual(false)
//   expect(v.string.url().isURL).toEqual(true)
//   expect(v.string.url().isCUID).toEqual(false)
//   expect(v.string.url().isCUID2).toEqual(false)
//   expect(v.string.url().isUUID).toEqual(false)
//   expect(v.string.url().isIP).toEqual(false)
//   expect(v.string.url().isULID).toEqual(false)

//   expect(v.string.cuid().isEmail).toEqual(false)
//   expect(v.string.cuid().isURL).toEqual(false)
//   expect(v.string.cuid().isCUID).toEqual(true)
//   expect(v.string.cuid().isCUID2).toEqual(false)
//   expect(v.string.cuid().isUUID).toEqual(false)
//   expect(v.string.cuid().isIP).toEqual(false)
//   expect(v.string.cuid().isULID).toEqual(false)

//   expect(v.string.cuid2().isEmail).toEqual(false)
//   expect(v.string.cuid2().isURL).toEqual(false)
//   expect(v.string.cuid2().isCUID).toEqual(false)
//   expect(v.string.cuid2().isCUID2).toEqual(true)
//   expect(v.string.cuid2().isUUID).toEqual(false)
//   expect(v.string.cuid2().isIP).toEqual(false)
//   expect(v.string.cuid2().isULID).toEqual(false)

//   expect(v.string.uuid().isEmail).toEqual(false)
//   expect(v.string.uuid().isURL).toEqual(false)
//   expect(v.string.uuid().isCUID).toEqual(false)
//   expect(v.string.uuid().isCUID2).toEqual(false)
//   expect(v.string.uuid().isUUID).toEqual(true)
//   expect(v.string.uuid().isIP).toEqual(false)
//   expect(v.string.uuid().isULID).toEqual(false)

//   expect(v.string.ip().isEmail).toEqual(false)
//   expect(v.string.ip().isURL).toEqual(false)
//   expect(v.string.ip().isCUID).toEqual(false)
//   expect(v.string.ip().isCUID2).toEqual(false)
//   expect(v.string.ip().isUUID).toEqual(false)
//   expect(v.string.ip().isIP).toEqual(true)
//   expect(v.string.ip().isULID).toEqual(false)

//   expect(v.string.ulid().isEmail).toEqual(false)
//   expect(v.string.ulid().isURL).toEqual(false)
//   expect(v.string.ulid().isCUID).toEqual(false)
//   expect(v.string.ulid().isCUID2).toEqual(false)
//   expect(v.string.ulid().isUUID).toEqual(false)
//   expect(v.string.ulid().isIP).toEqual(false)
//   expect(v.string.ulid().isULID).toEqual(true)
// })

// it('min max getters', () => {
//   expect(v.string.min(5).minLength).toEqual(5)
//   expect(v.string.min(5).min(10).minLength).toEqual(10)
//   expect(v.string.minLength).toEqual(null)

//   expect(v.string.max(5).maxLength).toEqual(5)
//   expect(v.string.max(5).max(1).maxLength).toEqual(1)
//   expect(v.string.maxLength).toEqual(null)
// })

// it('trim', () => {
//   expect(v.string.trim().min(2).parse(' 12 ')).toEqual('12')

//   // ordering of methods is respected
//   expect(v.string.min(2).trim().parse(' 1 ')).toEqual('1')
//   expect(() => v.string.trim().min(2).parse(' 1 ')).toThrow()
// })

// it('lowerCase', () => {
//   expect(v.string.toLowerCase().parse('ASDF')).toEqual('asdf')
//   expect(v.string.toUpperCase().parse('asdf')).toEqual('ASDF')
// })

// it('datetime', () => {
//   const a = v.string.datetime({})
//   // expect(a.isDatetime).toEqual(true)

//   const b = v.string.datetime({ offset: true })
//   // expect(b.isDatetime).toEqual(true)

//   const c = v.string.datetime({ precision: 3 })
//   // expect(c.isDatetime).toEqual(true)

//   const d = v.string.datetime({ offset: true, precision: 0 })
//   // expect(d.isDatetime).toEqual(true)

//   // const { isDatetime } = v.string.datetime()
//   // expect(isDatetime).toEqual(true)
// })

it('datetime parsing', () => {
  const datetime = v.string.datetime()
  datetime.parse('1970-01-01T00:00:00.000Z')
  datetime.parse('2022-10-13T09:52:31.816Z')
  datetime.parse('2022-10-13T09:52:31.8162314Z')
  datetime.parse('1970-01-01T00:00:00Z')
  datetime.parse('2022-10-13T09:52:31Z')
  expect(() => datetime.parse('')).toThrow()
  expect(() => datetime.parse('foo')).toThrow()
  expect(() => datetime.parse('2020-10-14')).toThrow()
  expect(() => datetime.parse('T18:45:12.123')).toThrow()
  expect(() => datetime.parse('2020-10-14T17:42:29+00:00')).toThrow()

  const datetimeNoMs = v.string.datetime({ precision: 0 })
  datetimeNoMs.parse('1970-01-01T00:00:00Z')
  datetimeNoMs.parse('2022-10-13T09:52:31Z')
  expect(() => datetimeNoMs.parse('tuna')).toThrow()
  expect(() => datetimeNoMs.parse('1970-01-01T00:00:00.000Z')).toThrow()
  expect(() => datetimeNoMs.parse('1970-01-01T00:00:00.Z')).toThrow()
  expect(() => datetimeNoMs.parse('2022-10-13T09:52:31.816Z')).toThrow()

  const datetime3Ms = v.string.datetime({ precision: 3 })
  datetime3Ms.parse('1970-01-01T00:00:00.000Z')
  datetime3Ms.parse('2022-10-13T09:52:31.123Z')
  expect(() => datetime3Ms.parse('tuna')).toThrow()
  expect(() => datetime3Ms.parse('1970-01-01T00:00:00.1Z')).toThrow()
  expect(() => datetime3Ms.parse('1970-01-01T00:00:00.12Z')).toThrow()
  expect(() => datetime3Ms.parse('2022-10-13T09:52:31Z')).toThrow()

  const datetimeOffset = v.string.datetime({ offset: true })
  datetimeOffset.parse('1970-01-01T00:00:00.000Z')
  datetimeOffset.parse('2022-10-13T09:52:31.816234134Z')
  datetimeOffset.parse('1970-01-01T00:00:00Z')
  datetimeOffset.parse('2022-10-13T09:52:31.4Z')
  datetimeOffset.parse('2020-10-14T17:42:29+00:00')
  datetimeOffset.parse('2020-10-14T17:42:29+03:15')
  datetimeOffset.parse('2020-10-14T17:42:29+0315')
  datetimeOffset.parse('2020-10-14T17:42:29+03')
  expect(() => datetimeOffset.parse('tuna')).toThrow()
  expect(() => datetimeOffset.parse('2022-10-13T09:52:31.Z')).toThrow()

  const datetimeOffsetNoMs = v.string.datetime({ offset: true, precision: 0 })
  datetimeOffsetNoMs.parse('1970-01-01T00:00:00Z')
  datetimeOffsetNoMs.parse('2022-10-13T09:52:31Z')
  datetimeOffsetNoMs.parse('2020-10-14T17:42:29+00:00')
  datetimeOffsetNoMs.parse('2020-10-14T17:42:29+0000')
  datetimeOffsetNoMs.parse('2020-10-14T17:42:29+00')
  expect(() => datetimeOffsetNoMs.parse('tuna')).toThrow()
  expect(() => datetimeOffsetNoMs.parse('1970-01-01T00:00:00.000Z')).toThrow()
  expect(() => datetimeOffsetNoMs.parse('1970-01-01T00:00:00.Z')).toThrow()
  expect(() => datetimeOffsetNoMs.parse('2022-10-13T09:52:31.816Z')).toThrow()
  expect(() => datetimeOffsetNoMs.parse('2020-10-14T17:42:29.124+00:00')).toThrow()

  const datetimeOffset4Ms = v.string.datetime({ offset: true, precision: 4 })
  datetimeOffset4Ms.parse('1970-01-01T00:00:00.1234Z')
  datetimeOffset4Ms.parse('2020-10-14T17:42:29.1234+00:00')
  datetimeOffset4Ms.parse('2020-10-14T17:42:29.1234+0000')
  datetimeOffset4Ms.parse('2020-10-14T17:42:29.1234+00')
  expect(() => datetimeOffset4Ms.parse('tuna')).toThrow()
  expect(() => datetimeOffset4Ms.parse('1970-01-01T00:00:00.123Z')).toThrow()
  expect(() => datetimeOffset4Ms.parse('2020-10-14T17:42:29.124+00:00')).toThrow()
})

it('IP validation', () => {
  const ip = v.string.ip()
  expect(v.isResult(ip.safeParse('122.122.122.122'))).toBe(true)

  const ipv4 = v.string.ipv4()
  expect(() => ipv4.parse('6097:adfa:6f0b:220d:db08:5021:6191:7990')).toThrow()

  const ipv6 = v.string.ipv6()
  expect(() => ipv6.parse('254.164.77.1')).toThrow()

  const validIPs = [
    '1e5e:e6c8:daac:514b:114b:e360:d8c0:682c',
    '9d4:c956:420f:5788:4339:9b3b:2418:75c3',
    'a6ea::2454:a5ce:94.105.123.75',
    '474f:4c83::4e40:a47:ff95:0cda',
    'd329:0:25b4:db47:a9d1:0:4926:0000',
    'e48:10fb:1499:3e28:e4b6:dea5:4692:912c',
    '114.71.82.94',
    '0.0.0.0',
    '37.85.236.115',
  ]

  const invalidIPs = [
    'd329:1be4:25b4:db47:a9d1:dc71:4926:992c:14af',
    'd5e7:7214:2b78::3906:85e6:53cc:709:32ba',
    '8f69::c757:395e:976e::3441',
    '54cb::473f:d516:0.255.256.22',
    '54cb::473f:d516:192.168.1',
    '256.0.4.4',
    '-1.0.555.4',
    '0.0.0.0.0',
    '1.1.1',
  ]
  // no parameters check IPv4 or IPv6
  const ipSchema = v.string.ip()
  expect(validIPs.every((ipA) => v.isResult(ipSchema.safeParse(ipA)))).toBe(true)
  expect(invalidIPs.every((ipA) => v.isError(ipSchema.safeParse(ipA)))).toBe(true)
})
