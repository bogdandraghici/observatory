import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'shortNumber',
    standalone: false
})
export class ShortNumberPipe implements PipeTransform {

    transform(val: number, _____args?: any): any {
        if (isNaN(val)) {return 0} // will only work value is a number
        if (val === null) {return 0}
        if (val === 0) {return 0}
        let abs = Math.abs(val)
        const rounder = Math.pow(10, 1)
        const isNegative = val < 0 // will also work for Negative numbers
        let key = ''

        const powers = [
            {key: 'Q', value: Math.pow(10, 15)},
            {key: 'T', value: Math.pow(10, 12)},
            {key: 'B', value: Math.pow(10, 9)},
            {key: 'M', value: Math.pow(10, 6)},
            {key: 'K', value: 1000}
        ]

        for (const power of powers) {
            let reduced = abs / power.value
            reduced = Math.round(reduced * rounder) / rounder
            if (reduced >= 1) {
                abs = reduced
                key = power.key
                break
            }
        }
        return (isNegative ? '-' : '') + abs + key
    }
}
