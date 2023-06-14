import { Timer } from "./Timer";
import { BaseMatrix } from "./matrix/Matrix";
import { Primitive } from "./matrix/Primitive";

const timer = new Timer();
const primitive = new Primitive(11);

const matrix = new BaseMatrix([
  [6, 7, 2, 9, 10, 4],
  [1, 3, 6, 5, 9, 9],
  [4, 5, 6, 7, 2, 4],
  [8, 9, 10, 3, 5, 2],
], primitive);

const pivot = matrix.pivote();
console.log('\nPivot:\n')
pivot.print();

console.log('\nMatrix:\n')
matrix.print();
console.log();

// pivot.printDimensions();
// matrix.printDimensions();

matrix.multiply(pivot.transpose()).print();

timer.stopPrint();