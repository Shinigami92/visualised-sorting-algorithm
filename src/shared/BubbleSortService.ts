import { AbstractSortService, CompareCallback } from './AbstractSortService';

export class BubbleSortService<T> extends AbstractSortService<T> {
  public constructor(list: T[], compare: CompareCallback<T>, millis: number = 0) {
    super(list, compare, millis);
  }

  protected *process(): Generator<boolean, void, unknown> {
    for (let n: number = this.listSize; n > 1; n--) {
      for (let i: number = 0; i < this.listSize - 1; i++) {
        let t1: T = this.list[i];
        let t2: T = this.list[i + 1];
        if (this.compare(t1, t2)) {
          this.swap(i, i + 1);
          yield true;
        }
      }
    }
    yield false;
  }
}
