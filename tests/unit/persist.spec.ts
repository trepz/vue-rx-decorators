import Vue from 'vue'
import Component from 'vue-class-component'
import { Persist, PersistOptions } from '../../src/vue-persist-decorator'
import { LocalStorageMock } from '../mocks/localstorage.mock'

declare var global: any

global.localStorage = new LocalStorageMock()

const factory = <T>(value: T, options?: PersistOptions, componentOptions?: any) => {
    @Component(componentOptions)
    class Comp extends Vue {
        @Persist(options)
        hello: T = value
    }
    return new Comp()
}

beforeEach(() => localStorage.clear())

describe('Reading and writing', () => {
    let comp: any
    beforeEach(() => {
        comp = factory<string>('')
    })

    test('a watch object is set which matches the name of the data property', () => {
        const watch = comp.$options.watch
        expect(watch).toBeDefined()
        expect(watch!.hello).toBeDefined()
    })

    test('setting the property stores in localStorage', () => {
        comp.hello = 'hi'
        const item = localStorage.getItem('comp_hello')
        expect(item).toBe(JSON.stringify({ value: 'hi' }))
    })

    test('getting the property from localStorage', () => {
        comp.hello = 'hi'
        expect(comp.hello).toBe('hi')
    })
})

describe('Storage keys', () => {
    test('it uses the class name as a key by default', () => {
        const comp = factory<string>('')
        comp.hello = 'keys'
        expect(localStorage.getItem('comp_hello')).toBeDefined()
    })

    test('it uses the component name if manually set', () => {
        const comp = factory<string>('', {}, { name: 'different' })
        comp.hello = 'something different'
        expect(localStorage.getItem('different_hello')).toBeDefined()
    })

    test('default key name can be overridden using key option', () => {
        const comp = factory<string>('', { key: 'custom_key' })
        comp.hello = 'custom'
        expect(localStorage.getItem('custom_key')).toBeDefined()
    })
})

describe('Automatic type casting on stored values', () => {
    test('string', () => {
        const comp = factory<string>('')
        comp.hello = 'hi'
        expect(typeof comp.hello).toBe('string')
    })
    test('number', () => {
        const comp = factory<number>(1)
        comp.hello = 3
        expect(typeof comp.hello).toBe('number')
    })
    test('object', () => {
        const comp = factory<any>({})
        comp.hello = { greet: 'tings' }
        expect(typeof comp.hello).toBe('object')
    })
    test('boolean', () => {
        const comp = factory<boolean>(false)
        comp.hello = true
        expect(typeof comp.hello).toBe('boolean')
    })
    test('array', () => {
        const comp = factory<string[]>([])
        comp.hello = ['hi', 'hello']
        expect(Array.isArray(comp.hello)).toBeTruthy()
    })
})

describe('Expiry date', () => {
    test('expiry key is not added by default', () => {
        const comp = factory<string>('')
        comp.hello = 'hi'

        const obj = JSON.parse(localStorage.getItem('comp_hello') || '')
        expect(obj.value).toBe('hi')
        expect(obj.expiry).toBeUndefined()
    })

    test('adding expiry settings creates expiry prop as a date', () => {
        const comp = factory<string>('', { expiry: '2h' })
        comp.hello = 'hey'

        const obj = JSON.parse(localStorage.getItem('comp_hello') || '')
        expect(obj.value).toBe('hey')
        expect(new Date(obj.expiry).getDate()).not.toBeNaN()
    })
})
