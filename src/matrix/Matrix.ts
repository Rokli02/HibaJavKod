import { Primitive } from "./Primitive";
import { MatrixVec, Vec2 } from "./types";
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
  equals(b: Matrix | number[][]) {
    const array = b instanceof Matrix ? b.get() : b;

    return !this.array.some((row, outer) => row.some((col, inner) => col !== array[outer][inner]))
  }

  static FillMatrix(width: number, height: number, fill: number): number[][] {
    const matrix = new Array<number[]>(height);
    for (let outerIndex = 0; outerIndex < height; outerIndex++) {
      matrix[outerIndex] = new Array<number>(width);
      for (let innerIndex = 0; innerIndex < width; innerIndex++) {
        matrix[outerIndex][innerIndex] = fill;
      }
    }

    return matrix;
  }
  static NullMatrix(width: number, height: number): number[][] {
    return Matrix.FillMatrix(width, height, 0);
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
  constructor(array: number[][]) {
    super();
    options.debug.matrix&&console.log('BasicMatrix constructor');
  
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
    options.debug.matrix&&console.log('Add two Basic Matrix');
    if (typeof b === 'number') {
      const newArray = doOnMatrix(this.array, b, (a, b) => a + b);

      return new BasicMatrix(newArray);
    }

    if (b.getWidth() !== this.getWidth() || b.getHeight() !== this.getHeight()) {
      throw Error('Az összeadás nem végezhető el: A két tömb nem azonos méretű!');
    }
    
    const newArray = doOnMatrix(this.array, b.get() as number[][], (a, b) => a + b);

    options.debug.matrix&&console.log();

    return new BasicMatrix(newArray);
  }
  multiply(b: Matrix | number) {
    options.debug.matrix&&console.log('Multiply two Base Matrix')
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
  pivote(): BasicMatrix {
    return new BasicMatrix(generalPivote.call(this, (a: number, b: number) => a / b));
  }
  determinant(): number {
    return calculateDeterminant(this.array);
  }
}

export class BaseMatrix extends Matrix {
  private primitives: Primitive;

  constructor(array: number[][], primitives: Primitive) {
    super();
    options.debug.matrix&&console.log('BaseMatrix constructor');

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
    options.debug.matrix&&console.log('Add two Base Matrix');
    if (typeof b === 'number') {
      return new BaseMatrix(this.array.map((row) => row.map((col) => this.primitives.add(col, b))), this.primitives);
    }

    if (b.getWidth() !== this.getWidth() || b.getHeight() !== this.getHeight()) {
      throw Error('Az összeadás nem végezhető el: A két tömb nem azonos méretű!');
    }

    const newArray = doOnMatrix(this.array, b.get() as number[][], (a, b) => this.primitives.add(a, b));

    options.debug.matrix&&console.log();

    return new BaseMatrix(newArray, this.primitives);
  }
  multiply(b: number | Matrix): Matrix {
    options.debug.matrix&&console.log('Multiply two Base Matrix')
    if (typeof b === 'number') {
      return new BaseMatrix(this.array.map((row) => row.map((col) => this.primitives.multiply(col, b))), this.primitives);
    }

    if (this.getWidth() !== b.getHeight()) {
      throw Error('A szorzás nem végezhető el: A tömbök nem megfelelő méretűek!')
    }

    const newArray = new Array<number[]>(this.getHeight());

    for (let row = 0; row < this.getHeight(); row++) {
      newArray[row] = new Array<number>(b.getWidth());
      options.debug.matrix&&console.log(`  ${row + 1}. row`);

      for (let column = 0; column < b.getWidth(); column++) {
          let element: number = 0;
          for (let iterator = 0; iterator < this.getWidth(); iterator++) {
            element += this.array[row][iterator] * (b.get({ x: column, y: iterator }) as number)
            options.debug.matrix&&console.log(`   ${this.array[row][iterator]} * ${b.get({ x: column, y: iterator })} = ${element} `)
        }
        newArray[row][column] = options.onlyPositivePrimitives && element < 0 ? element % this.getBase() + this.getBase() : element % this.getBase();
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
  pivote(selectedParam?: MatrixVec[]): BaseMatrix {
    return new BaseMatrix(generalPivote.call(this, (a: number, b: number) => this.primitives.divide(a, b), selectedParam), this.primitives);
  }
  determinant(): number {
    const v = calculateDeterminant(this.array) % this.getBase();
    return options.onlyPositivePrimitives && v < 0 ? v + this.getBase() : v;
  }
}

function generalPivote(this: {array: number[][], getHeight: () => number, getWidth: () => number, print: () => void}, dividerFunc: (a: number, b: number) => number, selectedParam: MatrixVec[] = []): number[][] {
    let selectedRow: number,
        selectedCol: number,
        calculated: MatrixVec[] = [],
        wrongFields: MatrixVec[] = [];
    const array = this.array.map((row) => row.map((c) => c));
    const shoudCalculateNextStep = selectedParam.length === 0;
    options.debug.matrix&&console.log(`   pivote matrix of ${this.getHeight()}x${this.getWidth()}`);

    // Pivotálás sorról-sorra
    for(let iterator = 0; iterator < (selectedParam?.length > 0 ? selectedParam.length : this.getHeight()); iterator++) {
      // Egy oszlop kiválasztása
      if (wrongFields.length >= (this.getHeight() - 1) * (this.getWidth() - calculated.length)) {
        throw new Error('Túl sok hiba keletkezett!');
      }
      try {
      if (shoudCalculateNextStep) {
        const { row, col } = get1IfPossible(array, calculated, wrongFields);
        selectedRow = row;
        selectedCol = col;
      } else {
        calculated.push({ row: selectedParam[iterator].row, col: selectedParam[iterator].col })
        selectedRow = calculated[iterator].row;
        selectedCol = calculated[iterator].col;
      }

      options.debug.matrix&&console.log(`   current row: ${selectedRow}, col: ${selectedCol}\n`);

      // A sorok kiszámolása
      for(let row = 0; row < this.getHeight(); row++) {
        // Ha a jelenleg kiválaszott sorba lépünk, átugorjuk
        if (selectedRow === row) continue;
        for(let col = 0; col < this.getWidth(); col++) {
          // Ha már kiszámolt oszlopba lépünk átugorjuk
          if (calculated.some((calc) => calc.col === col)) continue;
          const divided = dividerFunc(array[selectedRow][selectedCol] * array[row][col] - array[row][selectedCol] * array[selectedRow][col], array[selectedRow][selectedCol])

          options.debug.matrix&&console.log(`   ${array[row][col]} ---> ${divided} = (${array[selectedRow][selectedCol]} * ${array[row][col]} - ${array[row][selectedCol]} * ${array[selectedRow][col]}) / ${array[selectedRow][selectedCol]}`);

          array[row][col] = divided;
        }
      }

      // A kiválasztott oszlop nullázása
      array.forEach((row, index) => {
        if (index !== selectedRow) {
          row[selectedCol] = 0;
        }
      })

      // A kiválasztott sor elemeit elosztani a kiválaszott elemmel
      array[selectedRow] = array[selectedRow].map((col) => col === 0 ? 0 : dividerFunc(col, array[selectedRow][selectedCol]));

      // A kiválaszott elem 1
      array[selectedRow][selectedCol] = 1;

      options.debug.matrix&&console.log(array);
      wrongFields = [];
      } catch (err) {
        options.debug.matrix&&console.log(`   selected [${selectedCol};${selectedRow}] element caused error!\n`);
        wrongFields.push({ row: selectedRow, col: selectedCol });
        // options.debug.matrix&&console.log('   list of wrong fields:', wrongFields);
        // options.debug.matrix&&console.log('   old selected element array:', calculated);
        calculated.pop();
        // options.debug.matrix&&console.log('   new selected element array:', calculated);
        iterator--;
      }
    }

    options.debug.matrix&&console.log('   all selected elements:', calculated);
    
    let isFound = false;
    // Miután végigmentünk a mátrixon, beszúrni és rendezni kell
    for (let i = 0; i < this.getWidth(); i++) {
      isFound = false;

      for (let c of calculated) {
        if (c.col === i) {
          isFound = true;
          break;
        }
      }
      if (!isFound) {
        calculated.push({ row: calculated.length, col: i });
        const newRow = Array(this.getWidth()).fill(0);
        newRow[i] = -1;
        array.push(newRow);
      }
    }
    calculated.sort((a, b) => a.col - b.col);
    options.debug.matrix&&console.log('   sorted matrix:', calculated.map((c) => array[c.row]));
    
    return calculated.map((c) => array[c.row]).map((row, rowIndex, arr) => row.map((_, colIndex) => arr[colIndex][rowIndex] < 0 ? dividerFunc(arr[colIndex][rowIndex], 1) : arr[colIndex][rowIndex])).filter((row) => row.reduce((sum, cur) => sum += cur, 0) !== 1);
}

function calculateDeterminant(a: number[][]): number {
  if (a.length !== a[0].length) {
    throw new Error('Determinánst számolni csak azonos szélességű és magasságú mátrixon lehet!');
  }
  options.debug.matrix&&console.log(`calculate determinant a ${a.length}x${a[0].length} matrix`);

  return determinantOf(a);
} 

function determinantOf(
  a: number[][],
  ignoreRow: number = -1,
  ignoreCol: number[]= [],
): number {
  options.debug.matrix&&console.log(`   determinant: ignoreCol: [${ignoreCol.join(', ')}], ignoreRow: ${ignoreRow + 1}`);
  
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

    options.debug.matrix&&console.log(`   determinant: current element: ${a[ignoreRow + 1][i]}`);

    ignoreCol.push(i);
    const calcValue = a[ignoreRow + 1][i] * determinantOf(a, ignoreRow + 1 , ignoreCol);
    ignoreCol.pop();

    options.debug.matrix&&console.log(`   determinant: [${calcValue}]`);

    sum += index % 2 === 0 
      ? calcValue
      : -(calcValue);

    index++;
  }
  options.debug.matrix&&console.log(`\tdeterminant: current sum ${sum}`);

  return sum;
}

function doOnMatrix(a: number[][], b: number[][] | number, callback: (a: number, b: number) => number) {
  if (typeof b === 'number') {
    return a.map((row) => row.map((col) => callback(col, b)))
  } else {
    return a.map((row, outer) => row.map((col, inner) => callback(col, b[outer][inner])))
  }
}

function get1IfPossible(a: number[][], c: MatrixVec[], wrongFields?: MatrixVec[]) {
  let selected: MatrixVec;
  for(let i = 0; i < a.length; i++) {
    if (c.some((calc) => calc.row === i)) {
      options.debug.matrix&&console.log(`\tskipping row ${i}`);
      continue;
    }
    for(let j = 0; j < a[i].length; j++) {
      if (c.some((calc) => calc.col === j) || a[i][j] === 0 || (wrongFields?.length > 0 && wrongFields.some((wf) => wf.col === j && wf.row === i) )) {
        options.debug.matrix&&console.log(`\tskipping col ${j}`);
        continue;
      }

      if (a[i][j] === 1) {
        selected = { row: i, col: j };
        c.push(selected);
        return selected;
      }

      if (!selected) {
        selected = { row: i, col: j };
      }
    }
  }

  c.push(selected);
  return selected;
}