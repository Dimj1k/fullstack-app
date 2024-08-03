const { interval, lastValueFrom } = require('rxjs')
const { take } = require('rxjs/operators')

async function execute() {
    const source$ = interval(2000).pipe(take(1));
    const finalNumber = await lastValueFrom(source$);
    console.log(`The final number is ${finalNumber}`);
}

execute();