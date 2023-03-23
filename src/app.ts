import { Timer } from "./Timer";
import { BaseMatrix, BasicMatrix } from "./matrix/Matrix";
import { Primitive } from "./matrix/Primitive";

const timer = new Timer();
const primitive = new Primitive(7);

// const matrix = new BaseMatrix([
//   [3, 5, 7, 5, 4, 3],
//   [2, 4, 1, 5, 9, 11],
//   [12, 3, 2, 7, 6, 10],
//   [8, 8, 3, 11, 7, 2],
// ], primitive);
const matrix = new BaseMatrix([
  [5, 2, 4],
  [3, 2, 1],
  [5, 3, 2],
], primitive);

matrix.pivote().forEach((row) => {
  console.log(row.join('   '));
})

timer.stopPrint();