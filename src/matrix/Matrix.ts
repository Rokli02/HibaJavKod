import { Primitive } from "./Primitive";
import { Vec2 } from "./types";

export abstract class Matrix {
  protected array: number[][];

  abstract getWidth(): number;
  abstract getHeight(): number;
  abstract add(b: Matrix | number): Matrix;
  abstract multiply(b: Matrix | number): Matrix;
  abstract transpose(): Matrix;
    /**
   * A mátrixból kiveszi azt a sort/oszlopot/elemet amikre ráillik a paraméterben megadott pozíció.
   * @param pos Az 'x' paraméter az oszlop indexnek felel meg, az 'y' paraméter a sor indexnek.
   * @returns Vagy mátrix kétdimenziós tömbjével, vagy egy sorának/oszlopának tömbjével, esetleg egy elemével tér vissza.
   */
  abstract get({x, y}: Vec2): number | number[] | number[][];

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

  get({ x, y }: Vec2) {
    // Nincs megadva pos
    if (!x && !y) return this.array;

    // Csak x
    if (x && !y) return this.array.map((a) => a[0])

    // Csak y
    if (!x && y) return this.array[y];

    // Mindkettő
    if (x && y)  return this.array[y][x];
  }
  print() {
    if (!this.array || this.array.length === 0) {
      return console.log('Nem létezik tömb!');
    }

    this.array.forEach((ar) => console.log(ar));
    console.log('\n');
  }
  getWidth(): number {
    return this.array ? this.array[0].length : 0;
  }
  getHeight(): number {
    return this.array ? this.array.length : 0;
  }
  add(b: Matrix | number) {
    if (typeof b === 'number') {
      const newArray = new Array<number[]>(this.getHeight());

      for (let outer = 0; outer < this.getHeight(); outer++) {
        newArray[outer] = new Array<number>(this.getWidth());
        for (let inner = 0; inner < this.getWidth(); inner++) {
          newArray[outer][inner] = b + this.array[outer][inner];
        }
      }

      return new BasicMatrix(newArray);
    }

    if (b.getWidth() !== this.getWidth() || b.getHeight() !== this.getHeight()) {
      throw Error('Az összeadás nem végezhető el: A két tömb nem azonos méretű!');
    }

    const newArray = new Array<number[]>(this.getHeight());
    for (let outer = 0; outer < this.getHeight(); outer++) {
      newArray[outer] = new Array<number>(this.getWidth());
      for (let inner = 0; inner < this.getWidth(); inner++) {
        newArray[outer][inner] = b.get({ x: inner, y: outer}) as number + this.array[outer][inner];
      }
    }

    return new BasicMatrix(newArray);
  }
  multiply(b: Matrix | number) {
    if (typeof b === 'number') {
      const newArray = new Array<number[]>(this.getHeight());

      for (let outer = 0; outer < this.getHeight(); outer++) {
        newArray[outer] = new Array<number>(this.getWidth());
        for (let inner = 0; inner < this.getWidth(); inner++) {
          newArray[outer][inner] = b * this.array[outer][inner];
        }
      }

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
    if (typeof b === 'number') {
      return new BaseMatrix(this.array.map((row) => row.map((col) => (col + b) % this.getBase())), this.primitives);
    }

    if (b.getWidth() !== this.getWidth() || b.getHeight() !== this.getHeight()) {
      throw Error('Az összeadás nem végezhető el: A két tömb nem azonos méretű!');
    }

    const newArray = new Array<number[]>(this.getHeight());

    for (let outer = 0; outer < this.getHeight(); outer++) {
      newArray[outer] = new Array<number>(this.getWidth());
      for (let inner = 0; inner < this.getWidth(); inner++) {
        newArray[outer][inner] = (b.get({ x: inner, y: outer}) as number + this.array[outer][inner]) % this.getBase();
      }
    }

    return new BaseMatrix(newArray, this.primitives);
  }
  multiply(b: number | Matrix): Matrix {
    if (typeof b === 'number') {
      return new BaseMatrix(this.array.map((row) => row.map((col) => (col * b) % this.getBase())), this.primitives);
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
  get({ x, y }: Vec2): number | number[] | number[][] {
    // Nincs megadva pos
    if (!x && !y) return this.array;

    // Csak x
    if (x && !y) return this.array.map((a) => a[0]);

    // Csak y
    if (!x && y) return this.array[y];

    // Mindkettő
    if (x && y) return this.array[y][x];
  }
  getBase() {
    return this.primitives.getBase();
  }
  pivot() {
    throw new Error('Nincs implementálva!');
  }
}