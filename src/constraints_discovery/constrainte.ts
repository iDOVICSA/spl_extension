export class Constrainte {
  type: number; // require =1 ; mutex = 2
  firstBlock: number; // blockId
  secondBlock: number; // 

  constructor(firstBlock: number, secondBlock: number, type: number) {
    this.type = type;
    this.firstBlock = firstBlock;
    this.secondBlock = secondBlock;
  }
}
