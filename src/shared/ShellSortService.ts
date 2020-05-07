import { AbstractSortService, CompareCallback } from './AbstractSortService';

export class ShellSortService<T, U> extends AbstractSortService<T, U> {
  private readonly gapSequence: number[];
  private readonly tempSave?: (t: T) => U;
  private readonly swapPart1?: (t1: T, t2: T) => void;
  private readonly swapPart2?: (t: T, u: U) => void;

  public constructor(
    list: T[],
    compare: CompareCallback<T, U>,
    tempSave?: (t: T) => U,
    swapPart1?: (t1: T, t2: T) => void,
    swapPart2?: (t: T, u: U) => void,
    millis: number = 0
  ) {
    super(list, compare, undefined, millis);
    this.tempSave = tempSave;
    this.swapPart1 = swapPart1;
    this.swapPart2 = swapPart2;
    this.gapSequence = [1750, 701, 301, 132, 57, 23, 10, 4, 1];
  }

  protected *process(): Generator<boolean, void, unknown> {
    for (let gap of this.gapSequence) {
      const gapVal: number = gap;
      if (gapVal > this.listSize) {
        continue;
      }
      for (let i: number = gapVal; i < this.listSize; i++) {
        const tempU: U = this.tempSave ? this.tempSave(this.list[i]) : ((this.list[i] as unknown) as U);
        let j: number;
        for (j = i; j >= gapVal && this.compare(this.list[j - gapVal], tempU); j -= gap) {
          if (this.swapPart1) {
            this.swapPart1(this.list[j], this.list[j - gapVal]);
          } else {
            const temp: T = this.list[j];
            this.list[j] = this.list[j - gapVal];
            this.list[j - gapVal] = temp;
          }
          // yield true;
        }
        // JA tempSave!
        if (!!this.tempSave) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.swapPart2!(this.list[j], tempU);
        } else {
          this.list[j] = (tempU as unknown) as T;
        }
        yield true;
      }
    }
    yield false;
  }
}
