import { Primitive } from "./Primitive";
import { Vec2 } from "./types";
import options from '../../.config.json';

abstract class Matrix {
  protected array: number[][];

  abstract getWidth(): number;
  abstract getHeight(): number;
  abstract add(b: Matrix | number): Matrix;
  abstract multiply(b: Matrix | number): Matrix;
  abstract transpose(): Matrix;
  abstract determinant(): number;
  print() {
    if (!this.array || this.array.length === 0) {
      return console.log('Nem létezik tömb!');
    }

    this.array.forEach((ar) => console.log(ar));
    console.log('\n');
  }
  /**
   * A mátrixból kiveszi azt a sort/oszlopot/elemet amikre ráillik a paraméterben megadott pozíció.
   * @param pos Az 'x' paraméter az oszlop indexnek felel meg, az 'y' paraméter a sor indexnek.
   * @returns Vagy mátrix kétdimenziós tömbjével, vagy egy sorának/oszlopának tömbjével, esetleg egy elemével tér vissza.
   */
  get(pos?: Vec2): number | number[] | number[][] {
    // Nincs megadva pos
    if (pos?.x === undefined && pos?.y === undefined) return this.array;
  
    // Csak x
    if (pos?.x !== undefined && pos?.y === undefined) return this.array.map((a) => a[0]);
  
    // Csak y
    if (pos?.x === undefined && pos?.y !== undefined) return this.array[pos.y];
  
    // Mindkettő
    if (pos?.x !== undefined && pos?.y !== undefined) return this.array[pos.y][pos.x];
  }

  static UnitMatrix(width: number, height: number): number[][] {
    const matrix = new Array<number[]>(height);
    for (let outerIndex = 0; outerIndex < height; outerIndex++) {
      matrix[outerIndex] = new Array<number>(width);
      for (let innerIndex = 0; innerIndex < width; innerIndex++) {
        if (outerIndex === innerIndex) {
          matrix[outerIndex][innerIndex] = 1;
          continue;
        }
        matrix[outerIndex][innerIndex] = 0;
      }
    }

    return matrix;
  }
}

export class BasicMatrix extends Matrix {
  constructor(array: number[][], width?: number) {
    super();
  
    if (array && array.length > 0) {
      this.array = [...array];
    } else {
      throw Error('Nem lett megadva tömb!');
    }
  }

  getWidth(): number {
    return this.array ? this.array[0].length : 0;
  }
  getHeight(): number {
    return this.array ? this.array.length : 0;
  }
  add(b: Matrix | number) {
    options.debug&&console.log('Add two Basic Matrix');
    if (typeof b === 'number') {
      const newArray = doOnMatrix(this.array, b, (a, b) => a + b);

      return new BasicMatrix(newArray);
    }

    if (b.getWidth() !== this.getWidth() || b.getHeight() !== this.getHeight()) {
      throw Error('Az összeadás nem végezhető el: A két tömb nem azonos méretű!');
    }
    
    const newArray = doOnMatrix(this.array, b.get() as number[][], (a, b) => a + b);

    options.debug&&console.log();

    return new BasicMatrix(newArray);
  }
  multiply(b: Matrix | number) {
    options.debug&&console.log('Multiply two Base Matrix')
    if (typeof b === 'number') {
      const newArray = doOnMatrix(this.array, b, (a, b) => a * b);

      return new BasicMatrix(newArray);
    }

    if (this.getWidth() !== b.getHeight()) {
      throw Error('A szorzás nem végezhető el: A tömbök nem megfelelő méretűek!')
    }

    const newArray = new Array<number[]>(this.getHeight());

    for (let row = 0; row < this.getHeight(); row++) {
      newArray[row] = new Array<number>(b.getWidth());

      for (let column = 0; column < b.getWidth(); column++) {
          let element: number = 0;
          for (let iterator = 0; iterator < this.getWidth(); iterator++) {
            element += this.array[row][iterator] * (b.get({ x: column, y: iterator }) as number)
        }
        newArray[row][column] = element;
      }
    }

    return new BasicMatrix(newArray);
  }
  transpose(): Matrix {
    const newArray = new Array<number[]>(this.getWidth());
    for (let outer = 0; outer < this.getWidth(); outer++) {
      newArray[outer] = new Array<number>(this.getHeight());
      for (let inner = 0; inner < this.getHeight(); inner++) {
        newArray[outer][inner] = this.array[inner][outer];
      }
    }

    return new BasicMatrix(newArray);
  }
  determinant(): number {
    return calculateDeterminant(this.array);
  }
}

export class BaseMatrix extends Matrix {
  private primitives: Primitive;

  constructor(array: number[][], primitives: Primitive) {
    super();

    if (array && array.length > 0) {
      this.primitives = primitives;
      this.array = array.map((row) => row.map((col) => col % this.getBase()));
    } else {
      throw Error('Nem lett megadva tömb!');
    }
  }

  getWidth(): number {
    return this.array ? this.array[0].length : 0;
  }
  getHeight(): number {
    return this.array ? this.array.length : 0;
  }
  add(b: number | Matrix): Matrix {
    options.debug&&console.log('Add two Base Matrix');
    if (typeof b === 'number') {
      return new BaseMatrix(this.array.map((row) => row.map((col) => this.primitives.add(col, b))), this.primitives);
    }

    if (b.getWidth() !== this.getWidth() || b.getHeight() !== this.getHeight()) {
      throw Error('Az összeadás nem végezhető el: A két tömb nem azonos méretű!');
    }

    const newArray = doOnMatrix(this.array, b.get() as number[][], (a, b) => this.primitives.add(a, b));

    options.debug&&console.log();

    return new BaseMatrix(newArray, this.primitives);
  }
  multiply(b: number | Matrix): Matrix {
    options.debug&&console.log('Multiply two Base Matrix')
    if (typeof b === 'number') {
      return new BaseMatrix(this.array.map((row) => row.map((col) => this.primitives.multiply(col, b))), this.primitives);
    }

    if (this.getWidth() !== b.getHeight()) {
      throw Error('A szorzás nem végezhető el: A tömbök nem megfelelő méretűek!')
    }

    const newArray = new Array<number[]>(this.getHeight());

    for (let row = 0; row < this.getHeight(); row++) {
      newArray[row] = new Array<number>(b.getWidth());
      options.debug&&console.log(`  ${row + 1}. row`);

      for (let column = 0; column < b.getWidth(); column++) {
          let element: number = 0;
          for (let iterator = 0; iterator < this.getWidth(); iterator++) {
            element += this.array[row][iterator] * (b.get({ x: column, y: iterator }) as number)
            options.debug&&console.log(`   ${this.array[row][iterator]} * ${b.get({ x: column, y: iterator })} = ${element} `)
        }
        newArray[row][column] = element % this.getBase();
      }
    }

    return new BaseMatrix(newArray, this.primitives);
  }
  transpose(): Matrix {
    const newArray = new Array<number[]>(this.getWidth());
    for (let outer = 0; outer < this.getWidth(); outer++) {
      newArray[outer] = new Array<number>(this.getHeight());
      for (let inner = 0; inner < this.getHeight(); inner++) {
        newArray[outer][inner] = this.array[inner][outer];
      }
    }

    return new BaseMatrix(newArray, this.primitives);
  }
  getBase() {
    return this.primitives.getBase();
  }
  // 1. pdf 17. és 26. oldalán találhatók a szükséges képletek
  getParityMatrixFromGenerator() {
    throw new Error('Nincs implementálva!');
  }
  getGeneratorMatrixFromParity() {
    throw new Error('Nincs implementálva!');
  }
  determinant(): number {
    const v = calculateDeterminant(this.array) % this.getBase();
    return options.onlyPositivePrimitives && v < 0 ? v + this.getBase() : v;
  }
}

function calculateDeterminant(a: number[][]): number {
  if (a.length !== a[0].length) {
    throw new Error('Determinánst számolni csak azonos szélességű és magasságú mátrixon lehet!');
  }
  options.debug&&console.log(`calculate determinant a ${a.length}x${a[0].length} matrix`);

  return determinantOf(a);
} 

function determinantOf(
  a: number[][],
  ignoreRow: number = -1,
  ignoreCol: number[]= [],
): number {
  options.debug&&console.log(`   determinant: ignoreCol: [${ignoreCol.join(', ')}], ignoreRow: ${ignoreRow + 1}`);
  
  let i: number;
  // Ha a táblában már csak 2x2-es mátrix van
  if (a.length - ignoreCol.length === 2) {
    let leftI: number, rightI: number;
    for(i = 0; i < a.length; i++) {
      if (ignoreCol.includes(i)) {
        continue;
      }

      if (leftI === undefined) {
        leftI = i;
      } else {
        rightI = i;
        break;
      }
    }
    return a[ignoreRow + 1][leftI] * a[ignoreRow + 2][rightI] - a[ignoreRow + 1][rightI] * a[ignoreRow + 2][leftI]
  }

  let sum = 0, index = 0;
  // Végigmenni a sorokon és meghívni önmagát rekurzívan átlósan
  for(i = 0; i < a[0].length; i++) {
    if (ignoreCol.includes(i)) {
      continue;
    }

    options.debug&&console.log(`   determinant: current element: ${a[ignoreRow + 1][i]}`);

    ignoreCol.push(i);
    const calcValue = a[ignoreRow + 1][i] * determinantOf(a, ignoreRow + 1 , ignoreCol);
    ignoreCol.pop();

    options.debug&&console.log(`   determinant: [${calcValue}]`);

    sum += index % 2 === 0 
      ? calcValue
      : -(calcValue);

    index++;
  }
  options.debug&&console.log(`\tdeterminant: current sum ${sum}`);

  return sum;
}

function doOnMatrix(a: number[][], b: number[][] | number, callback: (a: number, b: number) => number) {
  if (typeof b === 'number') {
    return a.map((row) => row.map((col) => callback(col, b)))
  } else {
    return a.map((row, outer) => row.map((col, inner) => callback(col, b[outer][inner])))
  }
}