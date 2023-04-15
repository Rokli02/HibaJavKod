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

const pivot = matrix.pivote([], [{ col: 5, row: 0 }]);
pivot.transpose().print();

timer.stopPrint();