import { PrimeFactorDivision } from "./types";
import options from '../../.config.json';

// DANGER: ha negatív egy szám, akkor azt alap esetben nem váltja át pozitívvá
export class Primitive {
  private primitives: number[];
  private base: number;
  constructor(base: number) {
    if (options.onlyPrime && !isPrime(base)) {
      throw new Error('A bázisnak prím számnak kell lennie!');
    }

    options.debug&&console.log('Primitive constructor:');

    this.primitives = new Array<number>(base - 1);
    this.base = base;

    // Kiszámolni a bázist
    const h = base - 1;
    const primeFactor = getPrimeFactorDivision(h);
    if (!primeFactor || primeFactor.length === 0) {
      throw new Error(`A bázisnak (${h}) nem létezik prímtényezős felbontása!`);
    }

    options.debug&&console.log('Prime factors:')
    options.debug&&primeFactor.forEach((pf) => console.log(`   ${pf.prime}^${pf.power}`))
    // Ha bármelyik eleme 0, akkor error -> nem jó bázis (lehet hogy nem primitív)
    // Alfák kiszámolása
    const alphaValues = primeFactor.map((pf, index) => {
      const power = h / pf.prime;
      let beta: number;

      options.debug&&console.log(`   ${(index + 1)}. beta: prime: ${pf.prime}; power: ${power}`);
      for(let i = 1; i <= h; i++) {
        const f = Math.pow(i, power) - 1;
        options.debug&&console.log(`\tf${i}: ${f} mod ${this.base} = ${f % this.base}`);
        if (f % this.base !== 0) {
          beta = i;
          break;
        }
      }

      if (!beta) {
        throw new Error(`Nem sikerült béta értéket találni ${pf.prime}^${pf.power} szám esetén!`);
      }
      options.debug&&console.log(`\tbeta value: ${beta}`);
      options.debug&&console.log(`\talfa = ${beta}^(${h} / ${pf.prime}^${pf.power}) = ${beta}^(${h / Math.pow(pf.prime, pf.power)}) = ${Math.pow(beta, (h / Math.pow(pf.prime, pf.power)))} = ${Math.pow(beta, (h / Math.pow(pf.prime, pf.power))) % this.base}`);

      return Math.pow(beta, (h / Math.pow(pf.prime, pf.power))) % this.base;
    });
    options.debug&&console.log('   alphas:', alphaValues);

    // Alfákat összeadni, így kapjuk meg az első rendű gammát
    const firstAlpha = alphaValues.reduce((sum, current) => { return sum *= current }, 1);
    this.primitives[0] = options.onlyPositivePrimitives && firstAlpha < 0
      ? (this.base + (firstAlpha % this.base))
      : (firstAlpha % this.base);

    // Az első gammából kiszámítjuk a többit
    for (let i = 1; i < h; i++) {
      this.primitives[i] = (this.primitives[0] * this.primitives[i - 1]) % this.base;
    }

    options.debug&&console.log('\n');
  }

  getBase() {
    return this.base;
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
    options.debug&&console.log(`get inverse of ${inverseOf}`);
    if (!this.primitives?.length) {
      throw new Error('Még nem lettek kiszámítva a primitív elemek!');
    }
    return searchIndexOfNumbers({ primitives: this.primitives, denominator: inverseOf });
  }

  getInverseOfNumberatorAndDenominator(numberator: number, denominator: number) {
    options.debug&&console.log(`get inverse of numberator ${numberator} and denominator ${denominator}`);
    if (!this.primitives?.length) {
      throw new Error('Még nem lettek kiszámítva a primitív elemek!');
    }
    return searchIndexOfNumbers({ primitives: this.primitives, numberator, denominator });
  }
}

function searchIndexOfNumbers({ primitives, numberatorIndex, numberator = 1, denominatorIndex, denominator}: { primitives: number[], numberatorIndex?: number, numberator?: number, denominatorIndex?: number, denominator: number }) {
  let canBreak = denominator ? 0 : 1;

  if (numberator === 0 || denominator === 0) {
    throw new Error('Nem lehet 0 se a számláló, se a nevező!')
  }

  if (numberator === denominator) {
    return 1;
  }

  if (options.onlyPositivePrimitives && numberator < 0) {
    numberator = (this.base + numberator) / this.base
  }

  if (options.onlyPositivePrimitives && denominator < 0) {
    denominator = (this.base + denominator) / this.base
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
  options.debug&&console.log(`   numberatorIndex: ${numberatorIndex}; denominatorIndex: ${denominatorIndex}`);

  // Ha a számláló nagyobb, akkor elvégezni a műveletet
  if (numberatorIndex > denominatorIndex) {
    options.debug&&console.log(`   get primitive at index ${numberatorIndex - denominatorIndex - 1}`);
    return primitives[numberatorIndex - denominatorIndex - 1];
  }
  // Ha kisebb, akkor nagyobbá alakítani
  else if(numberatorIndex < denominatorIndex) {
    denominatorIndex -= (numberatorIndex + 1);
    numberatorIndex = undefined;
    numberator = 1;
    denominator = undefined;

    options.debug&&console.log('   call search index of numbers');
    return searchIndexOfNumbers({ primitives, numberatorIndex, numberator, denominatorIndex, denominator});
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