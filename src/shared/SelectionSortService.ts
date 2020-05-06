import { AbstractSortService, CompareCallback, SwapCallback } from './AbstractSortService';

export class SelectionSortService<T> extends AbstractSortService<T> {
  public constructor(list: T[], compare: CompareCallback<T>, swap?: SwapCallback<T>, millis: number = 0) {
    super(list, compare, swap, millis);
  }

  protected *process(): Generator<boolean, void, unknown> {
    for (let j: number = 0; j < this.listSize - 1; j++) {
      let iMin: number = j;
      for (let i: number = j + 1; i < this.listSize; i++) {
        if (this.compare(this.list[i], this.list[iMin])) {
          iMin = i;
        }
      }
      if (iMin != j) {
        if (this.swap) {
          this.swap(this.list, j, iMin);
        } else {
          const temp: T = this.list[j];
          this.list[j] = this.list[iMin];
          this.list[iMin] = temp;
        }
        yield true;
      }
    }
    yield false;
  }
}
