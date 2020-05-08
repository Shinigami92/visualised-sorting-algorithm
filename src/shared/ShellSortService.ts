import { AbstractSortService, CompareCallback } from './AbstractSortService';

export class ShellSortService<T, U extends T> extends AbstractSortService<T, U> {
  private readonly gapSequence: number[];

  public constructor(list: T[], compare: CompareCallback<T, U>, millis: number = 0) {
    super(list, compare, millis);
    this.gapSequence = [1750, 701, 301, 132, 57, 23, 10, 4, 1];
  }

  protected *process(): Generator<boolean, void, unknown> {
    for (let gap of this.gapSequence) {
      const gapVal: number = gap;
      if (gapVal > this.listSize) {
        continue;
      }
      for (let i: number = gapVal; i < this.listSize; i++) {
        const tempU: U = this.list[i] as U;
        let j: number;
        for (j = i; j >= gapVal && this.compare(this.list[j - gapVal], tempU); j -= gap) {
          this.swap(j, j - gapVal);
          // yield true;
        }
        this.list[j] = tempU;
        yield true;
      }
    }
    yield false;
  }
}
