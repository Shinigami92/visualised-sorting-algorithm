import type { CompareCallback } from './AbstractSortService';
import { AbstractSortService } from './AbstractSortService';

export class BubbleSortService<T> extends AbstractSortService<T> {
  public constructor(
    list: T[],
    compare: CompareCallback<T>,
    millis: number = 0,
    simultaneousSwaps: number = 1,
  ) {
    super(list, compare, millis, simultaneousSwaps);
  }

  protected *process(): Generator<boolean, void, unknown> {
    for (let n: number = this.listSize; n > 1; n--) {
      for (let i = 0; i < this.listSize - 1; i++) {
        const t1: T = this.list[i];
        const t2: T = this.list[i + 1];
        if (this.compare(t1, t2)) {
          this.swap(i, i + 1);
          yield true;
        }
      }
    }

    yield false;
  }
}
