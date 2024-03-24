import type { CompareCallback } from './AbstractSortService';
import { AbstractSortService } from './AbstractSortService';

export class InsertionSortService<T> extends AbstractSortService<T> {
  public constructor(
    list: T[],
    compare: CompareCallback<T>,
    millis: number = 0,
  ) {
    super(list, compare, millis);
  }

  protected *process(): Generator<boolean, void, unknown> {
    for (let i = 1; i < this.listSize; i++) {
      let j: number = i;
      while (j > 0) {
        const t1: T = this.list[j - 1];
        const t2: T = this.list[j];
        if (!this.compare(t1, t2)) {
          break;
        }

        this.swap(j, j - 1);
        yield true;
        j--;
      }
    }

    yield false;
  }
}
