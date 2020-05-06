import { AbstractSortService, CompareCallback, SwapCallback } from './AbstractSortService';

export class InsertionSortService<T> extends AbstractSortService<T> {
  public constructor(list: T[], compare: CompareCallback<T>, swap?: SwapCallback<T>, millis: number = 0) {
    super(list, compare, swap, millis);
  }

  protected *process(): Generator<boolean, void, unknown> {
    this.running = true;
    for (let i: number = 1; i < this.listSize; i++) {
      let j: number = i;
      while (j > 0) {
        let t1: T = this.list[j - 1];
        let t2: T = this.list[j];
        if (!this.compare(t1, t2)) {
          break;
        }
        if (this.swap) {
          this.swap(this.list, j, j - 1);
        } else {
          const temp: T = this.list[j];
          this.list[j] = this.list[j - 1];
          this.list[j - 1] = temp;
        }
        if (this.interrupt) {
          this.running = false;
          this.interrupt = false;
          yield false;
        }
        yield true;
        j--;
      }
    }
    this.running = false;
    yield false;
  }
}
