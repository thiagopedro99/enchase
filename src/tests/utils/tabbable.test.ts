import { afterEach, describe, expect, it, vi } from 'vitest'

import { focusInOrder, tabbablesIn } from '@utils/tabbable.ts'

const hosts: HTMLElement[] = []

const mount = (html: string) => {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  hosts.push(host)

  return host
}

const ids = (host: HTMLElement) => tabbablesIn(host).map((element) => element.id)

const refuseFocus = (element: HTMLElement) => vi.spyOn(element, 'focus').mockImplementation(() => undefined)

afterEach(() => {
  hosts.splice(0).forEach((host) => host.remove())
  Reflect.deleteProperty(HTMLElement.prototype, 'checkVisibility')
})

describe('tabbablesIn', () => {
  it('lists the native controls that take focus, in document order', () => {
    const host = mount('<a id="link" href="/x">a</a><button id="button">b</button><input id="input"><select id="select"></select><textarea id="area"></textarea>')

    expect(ids(host)).toEqual(['link', 'button', 'input', 'select', 'area'])
  })

  it('keeps the order of the document when the kinds of control are mixed', () => {
    const host = mount('<input id="first"><button id="second">b</button><a id="third" href="/x">a</a><textarea id="fourth"></textarea><button id="fifth">c</button>')

    expect(ids(host)).toEqual(['first', 'second', 'third', 'fourth', 'fifth'])
  })

  it('leaves out an anchor without href, disabled controls and a hidden input', () => {
    const host = mount('<a id="anchor">a</a><button id="off" disabled>b</button><input id="hidden" type="hidden"><input id="locked" disabled><button id="on">c</button>')

    expect(ids(host)).toEqual(['on'])
  })

  it('leaves out a control inside a disabled fieldset', () => {
    const host = mount('<fieldset disabled><button id="inside">a</button></fieldset><button id="outside">b</button>')

    expect(ids(host)).toEqual(['outside'])
  })

  it('includes what the browser tabs to besides the native controls', () => {
    const host = mount(
      '<div id="editable" contenteditable></div><div id="true" contenteditable="true"></div><div id="plain" contenteditable="plaintext-only"></div><details><summary id="summary">s</summary><summary id="second">t</summary></details><iframe id="frame"></iframe><audio id="audio" controls></audio><video id="video" controls></video><span id="stop" tabindex="0"></span>'
    )

    expect(ids(host)).toEqual(['editable', 'true', 'plain', 'summary', 'frame', 'audio', 'video', 'stop'])
  })

  it('leaves out what the browser does not tab to', () => {
    const host = mount('<div id="off" contenteditable="false"></div><audio id="audio"></audio><video id="video"></video><button id="button">b</button>')

    expect(ids(host)).toEqual(['button'])
  })

  it('leaves out a negative tabindex, even on a control that would take focus', () => {
    const host = mount('<button id="a" tabindex="-1">a</button><a id="b" href="/x" tabindex="-1">b</a><input id="c" tabindex="-5"><div id="d" tabindex="-1"></div><button id="e" tabindex="0">e</button>')

    expect(ids(host)).toEqual(['e'])
  })

  it('leaves out a control inside a hidden or an inert ancestor', () => {
    const host = mount('<div hidden><button id="a">a</button></div><div inert><button id="b">b</button></div><button id="c">c</button>')

    expect(ids(host)).toEqual(['c'])
  })

  it('leaves out a control that css does not render, itself or through an ancestor', () => {
    const host = mount(
      '<button id="a" style="display: none">a</button><div style="display: none"><button id="b">b</button></div><button id="c" style="visibility: hidden">c</button><div style="visibility: hidden"><button id="d" style="visibility: visible">d</button></div><button id="e">e</button>'
    )

    expect(ids(host)).toEqual(['d', 'e'])
  })

  it('asks the browser when it can tell whether an element is rendered', () => {
    const host = mount('<button id="gone">a</button><button id="here">b</button>')

    Object.defineProperty(HTMLElement.prototype, 'checkVisibility', {
      configurable: true,
      value: function (this: HTMLElement) {
        return this.id !== 'gone'
      }
    })

    expect(ids(host)).toEqual(['here'])
  })

  it('keeps only the checked radio of a named group, and all of them while none is checked', () => {
    const none = mount('<input type="radio" name="g" id="r1"><input type="radio" name="g" id="r2">')
    const checked = mount('<input type="radio" name="h" id="s1"><input type="radio" name="h" id="s2" checked><input type="radio" name="h" id="s3">')

    expect(ids(none)).toEqual(['r1', 'r2'])
    expect(ids(checked)).toEqual(['s2'])
  })
})

describe('focusInOrder', () => {
  const buttons = () => Array.from(mount('<button id="a">a</button><button id="b">b</button><button id="c">c</button>').querySelectorAll('button'))

  it('focuses the control at the start and says it landed', () => {
    const [first, second] = buttons()

    expect(focusInOrder([first, second], 0, 1)).toBe(true)
    expect(first).toHaveFocus()
  })

  it('moves on to the next control when one refuses the focus', () => {
    const [first, second, third] = buttons()

    refuseFocus(first)
    refuseFocus(second)

    expect(focusInOrder([first, second, third], 0, 1)).toBe(true)
    expect(third).toHaveFocus()
  })

  it('wraps past the end going forward', () => {
    const [first, second, third] = buttons()

    refuseFocus(third)

    expect(focusInOrder([first, second, third], 2, 1)).toBe(true)
    expect(first).toHaveFocus()
  })

  it('wraps past the start going back', () => {
    const [first, second, third] = buttons()

    refuseFocus(first)
    refuseFocus(third)

    expect(focusInOrder([first, second, third], 0, -1)).toBe(true)
    expect(second).toHaveFocus()
  })

  it('says it found nothing when no control takes the focus, and for an empty list', () => {
    const [first, second] = buttons()

    refuseFocus(first)
    refuseFocus(second)

    expect(focusInOrder([first, second], 0, 1)).toBe(false)
    expect(focusInOrder([], 0, 1)).toBe(false)
  })
})
