// export function to generate random number btw a range of numbers
export function getRandomNumber(min: number, max: number, isFloat?: boolean): number {
    if (isFloat) {
        return Math.random() * (max - min) + min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}