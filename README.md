# Hiba javító kódolás

## Alap számításokat tartalmaz **TypeScript** (*JavaScript*) nyelvben megírva
Ezek a Primitív elem számolás és a mátrix műveletek, amiben az alap aritmetikai műveletek, valamint determináns és paritás mátrix számítás implementálásra került.
</br>
</br>
</br>

## Első használat
Amennyiben nincs globálisan telepítve TypeScript package, akkor azt a projekt szintjén kell megtennünk úgy, hogy belelépünk terminálba a mappájába és kiadjuk az alábbi parancsot:
```bash
npm i
```
Ez feltelepíti a szükséges függőségeit.
</br>
</br>
</br>

## Futtatás
Futtatni az alábbi parancsot kiadva tudjuk a programot:
```bash
npm run start
```
Az ***src/app.ts*** fájlban lehet megadni a végrehajtandó műveleteket.</br>
**Primitive** és **BaseMatrix** osztálynévvel vannak implementálva, így ezeket kell majd példányosítani.</br>
</br>
**Példa**:
```ts
const primitive = new Primitive(13);

const matrix = new BaseMatrix([
  [3, 5, 7, 5, 4, 3],
  [2, 4, 1, 5, 9, 11],
  [12, 3, 2, 7, 6, 10],
  [8, 8, 3, 11, 7, 2],
], primitive);

const pivot = matrix.pivote();

const nullM = matrix.multiply(pivot.transpose())

console.log(nullM.get())
```

Eredményként az alábbi kimenetet kell kapnunk:
```ts

[ 0, 0 ]
[ 0, 0 ]
[ 0, 0 ]
[ 0, 0 ]

```