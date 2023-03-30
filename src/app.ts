import { Timer } from "./Timer";
import { BaseMatrix } from "./matrix/Matrix";
import { Primitive } from "./matrix/Primitive";

const timer = new Timer();
const primitive = new Primitive(13);

const matrix = new BaseMatrix([
  [3, 5, 7, 5, 4, 3],
  [2, 4, 1, 5, 9, 11],
  [12, 3, 2, 7, 6, 10],
  [8, 8, 3, 11, 7, 2],
], primitive);
// const matrix = new BaseMatrix([
//   [5, 2, 4, 5],
//   [2, 2, 1, 2],
//   [5, 3, 2, 4],
// ], primitive);
// const matrix = new BaseMatrix([
//   [1, 2, 2, 0],
//   [1, 1, 0, 2],
// ], primitive);

// const pivoteM = new BaseMatrix([
//   [1, 0, 1, 1],
//   [0, 1, 2, 1],
// ], primitive);

const pivot = matrix.pivote();
  // [
  // { row: 1, col: 2 },
  // { row: 2, col: 4 },
  // { row: 3, col: 0 },
  // { row: 0, col: 1 },
// ]);
pivot.print();
// matrix.print();
console.log(matrix.multiply(pivot.transpose()).get())
// console.log(matrix.multiply(matrix.pivote().transpose()).get());
// console.log(matrix.multiply(matrix.pivote().transpose()));

timer.stopPrint();