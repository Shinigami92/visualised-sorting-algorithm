import { AbstractSortService, CompareCallback, SwapCallback } from './AbstractSortService';

export class BubbleSortService<T> extends AbstractSortService<T> {
  public constructor(list: T[], compare: CompareCallback<T>, swap?: SwapCallback<T>, millis: number = 0) {
    super(list, compare, swap, millis);
  }

  protected *process(): Generator<boolean, void, unknown> {
    this.running = true;
    for (let n: number = this.listSize; n > 1; n--) {
      for (let i: number = 0; i < this.listSize - 1; i++) {
        let t1: T = this.list[i];
        let t2: T = this.list[i + 1];
        if (this.compare(t1, t2)) {
          if (this.swap) {
            this.swap(this.list, i, i + 1);
          } else {
            const temp: T = this.list[i];
            this.list[i] = this.list[i + 1];
            this.list[i + 1] = temp;
          }
          if (this.interrupt) {
            this.running = false;
            this.interrupt = false;
            yield false;
          }
          yield true;
        }
      }
    }
    this.running = false;
    yield false;
  }
}
