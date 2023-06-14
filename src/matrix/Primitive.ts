import { PrimeFactorDivision } from "./types";
import options from '../../.config.json';

// DANGER: ha negatív egy szám, akkor azt alap esetben nem váltja át pozitívvá
export class Primitive {
  private primitives: number[];
  private readonly base: number;

  constructor(base: number, starterGamma?: number) {
    if (options.onlyPrime && !isPrime(base)) {
      throw new Error('A bázisnak prím számnak kell lennie!');
    }

    options.debug.primitive&&console.log('Primitive constructor:');

    this.primitives = new Array<number>(base - 1);
    this.base = base;


    let firstGamma: number;
    const h = base - 1;
    if (!starterGamma) {
      // Kiszámolni a bázist
      const primeFactor = getPrimeFactorDivision(h);
      if (!primeFactor || primeFactor.length === 0) {
        throw new Error(`A bázisnak (${h}) nem létezik prímtényezős felbontása!`);
      }
  
      options.debug.primitive&&console.log('Prime factors:')
      options.debug.primitive&&primeFactor.forEach((pf) => console.log(`   ${pf.prime}^${pf.power}`))
      // Ha bármelyik eleme 0, akkor error -> nem jó bázis (lehet hogy nem primitív)
      // Alfák kiszámolása
      const alphaValues = primeFactor.map((pf, index) => {
        const power = h / pf.prime;
        let beta: number;
  
        options.debug.primitive&&console.log(`   ${(index + 1)}. beta: prime: ${pf.prime}; power: ${power}`);
        for(let i = 1; i <= h; i++) {
          const f = Math.pow(i, power) - 1;
          options.debug.primitive&&console.log(`\tf${i}: ${f} mod ${this.base} = ${f % this.base}`);
          if (f % this.base !== 0) {
            beta = i;
            break;
          }
        }
  
        if (!beta) {
          throw new Error(`Nem sikerült béta értéket találni ${pf.prime}^${pf.power} szám esetén!`);
        }
        options.debug.primitive&&console.log(`\tbeta value: ${beta}`);
        options.debug.primitive&&console.log(`\talfa = ${beta}^(${h} / ${pf.prime}^${pf.power}) = ${beta}^(${h / Math.pow(pf.prime, pf.power)}) = ${Math.pow(beta, (h / Math.pow(pf.prime, pf.power)))} = ${Math.pow(beta, (h / Math.pow(pf.prime, pf.power))) % this.base}`);
  
        return Math.pow(beta, (h / Math.pow(pf.prime, pf.power))) % this.base;
      });
      options.debug.primitive&&console.log('   alphas:', alphaValues);
      firstGamma = alphaValues.reduce((sum, current) => { return sum *= current }, 1);
    } else {
      firstGamma = starterGamma;
    }

    // Alfákat összeadni, így kapjuk meg az első rendű gammát
    this.primitives[0] = options.onlyPositivePrimitives && firstGamma < 0
      ? (this.base + (firstGamma % this.base))
      : (firstGamma % this.base);

    // Az első gammából kiszámítjuk a többit
    for (let i = 1; i < h; i++) {
      this.primitives[i] = (this.primitives[0] * this.primitives[i - 1]) % this.base;
    }

    options.debug.primitive&&console.log('Primitive Values: \n', this.primitives.map((p, idx) => `\t${idx + 1}: ${p}`).join('\n'));
    options.debug.primitive&&console.log('\n');
  }

  getBase() {
    return this.base;
  }

  add(n1: number, n2: number) {
    options.debug.primitive&&console.log(`add ${n1} with ${n2}`);
    const v = (n1 + n2) % this.base;
    return options.onlyPositivePrimitives && v < 0 ? v + this.base : v;
  }

  multiply(n1: number, n2: number) {
    options.debug.primitive&&console.log(`multiply ${n1} with ${n2}`);
    const v = (n1 * n2) % this.base;
    return options.onlyPositivePrimitives && v < 0 ? v + this.base : v;
  }

  divide(numberator: number, denominator: number) {
    options.debug.primitive&&console.log(`divide ${numberator} with ${denominator}`);
    return searchIndexOfNumbers({ base: this.base, primitives: this.primitives, numberator, denominator });
  }

  get(index?: number) {
    if (index === undefined) {
      return [...this.primitives];
    }

    if (index <= 0) {
      throw new Error('Az indexnek nagyobbnak kell lenni, mint 0!');
    }

    if (index > this.primitives.length) {
      throw new Error(`Az indexnek kisebbnek kell lenni, mint ${this.primitives.length}!`);
    }

    return this.primitives[index - 1];
  }

  getInverseOf(inverseOf: number) {
    options.debug.primitive&&console.log(`get inverse of ${inverseOf}`);
    return searchIndexOfNumbers({ base: this.base, primitives: this.primitives, denominator: inverseOf });
  }
}

function searchIndexOfNumbers({ base, primitives, numberatorIndex, numberator = 1, denominatorIndex, denominator}: { base: number, primitives: number[], numberatorIndex?: number, numberator?: number, denominatorIndex?: number, denominator: number }) {
  let canBreak = denominator ? 0 : 1;

  if ((denominator % base) === 0) {
    throw new Error('Nem lehet 0 a nevező!')
  }

  if ((numberator % base) === 0) {
    if (options.canDivide0Primitives) {
      return 0;
    } else {
      throw new Error('Nem lehet 0 a számláló!')
    }
  }

  if (numberator > base) {
    numberator %= base;
  }

  if (denominator > base) {
    denominator %= base;
  }

  if (options.onlyPositivePrimitives && numberator < 0) {
    numberator %= base;

    if (numberator < 0) {
      numberator += base;
    }
  }

  if (options.onlyPositivePrimitives && denominator < 0) {
    denominator %= base;

    if (denominator < 0) {
      denominator += base;
    }
  }

  if (numberator === denominator) {
    return 1;
  }

  if (denominator === 1) {
    return numberator;
  }

  for (let i = 0; i < primitives.length; i++) {
    if (primitives[i] === numberator) {
      numberatorIndex = i;
      canBreak++;
    }
    if(primitives[i] === denominator) {
      denominatorIndex = i;
      canBreak++;
    }

    if (canBreak === 2) {
      break;
    }
  }
  options.debug.primitive&&console.log(`   numberatorIndex: ${numberatorIndex}; denominatorIndex: ${denominatorIndex}`);

  // Ha a számláló nagyobb, akkor elvégezni a műveletet
  if (numberatorIndex > denominatorIndex) {
    options.debug.primitive&&console.log(`   get primitive at index ${numberatorIndex - denominatorIndex - 1}`);
    return primitives[numberatorIndex - denominatorIndex - 1];
  }
  // Ha kisebb, akkor nagyobbá alakítani
  else if(numberatorIndex < denominatorIndex) {
    denominatorIndex -= (numberatorIndex + 1);
    numberatorIndex = undefined;
    numberator = 1;
    denominator = undefined;

    options.debug.primitive&&console.log('   call search index of numbers');
    return searchIndexOfNumbers({ base, primitives, numberatorIndex, numberator, denominatorIndex, denominator});
  }
  // Ha egyenlőek, akkor 1 az érték
  else { 
    return 1;
  }
}

export function getPrimeFactorDivision(h: number): PrimeFactorDivision[] {
  let prime: number = 2;
  let power: number = 0;
  const halfOfH = h >> 1;
  const pfd: PrimeFactorDivision[] = [];

  if (h === 2 || h === 3) {
    return [{ prime: h, power: 1 }];
  }

  while (h > 0 && halfOfH >= prime) {
    if (h % prime === 0) {
      power++;
      h = h / prime;
    } else {
      if (power) {
        pfd.push({ prime, power });
      }
      prime = getNextPrime(prime);
      power = 0;
    }
  }

  return pfd;
}

export function getNextPrime(prime: number): number {
  let nextPrime: number;
  if (prime % 2 === 0) {
    nextPrime = ++prime
  } else {
    nextPrime = prime + 2;
  }
  while (!isPrime(nextPrime)) {
    nextPrime += 2;
  }

  return nextPrime;
}

export function isPrime(prime: number): boolean {
  const s = Math.sqrt(prime);
  if (prime % 2 === 0 && prime !== 2) return false;
  for(let i = 3; i <= s; i += 2) {
    if(prime % i === 0) return false;
  }
  return prime >= 2;
}