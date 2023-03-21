import { Timer } from "./Timer";
import { BaseMatrix, BasicMatrix } from "./matrix/Matrix";
import { Primitive } from "./matrix/Primitive";

const timer = new Timer();
const primitive = new Primitive(7);

const matrix = new BaseMatrix([
  [2, 0, 10],
  [-2, 6, -4],
  [3, 10, 17],
], primitive);

console.log(new BasicMatrix([
  [2, 0, 10],
  [-2, 6, -4],
  [3, 10, 17],
]).determinant())

console.log(matrix.determinant());

timer.stopPrint();