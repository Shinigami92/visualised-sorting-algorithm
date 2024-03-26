import type { CompareCallback } from './AbstractSortService';
import { AbstractSortService } from './AbstractSortService';
import { sleep } from './UtilFunction';

export class QuickSortService<T, U extends T> extends AbstractSortService<
  T,
  U
> {
  private readonly leftCompare: CompareCallback<T, U>;
  private readonly rightCompare: CompareCallback<T, U>;

  public constructor(
    list: T[],
    leftCompare: CompareCallback<T, U>,
    rightCompare: CompareCallback<T, U>,
    millis: number = 0,
    simultaneousSwaps: number = 1,
  ) {
    super(list, null as any, millis, simultaneousSwaps);
    this.leftCompare = leftCompare;
    this.rightCompare = rightCompare;
  }

  protected async *process(): AsyncGenerator<boolean, void, unknown> {
    await this.quicksort(0, this.listSize - 1);
    yield false;
  }

  private async quicksort(lo: number, hi: number): Promise<void> {
    if (lo < hi) {
      let p!: number;
      const gen: Generator<boolean, number, unknown> = this.partition(lo, hi);

      let bulkCount = 0;

      while (!this.interrupt) {
        const value: boolean | number = gen.next().value;
        if (typeof value === 'number') {
          p = value;
          break;
        }

        if (bulkCount++ > this.simultaneousSwaps) {
          await sleep(this.millis);
          bulkCount = 0;
        }
      }

      await Promise.allSettled([
        this.quicksort(lo, p),
        this.quicksort(p + 1, hi),
      ]);
    }
  }

  private *partition(
    lo: number,
    hi: number,
  ): Generator<boolean, number, unknown> {
    const pivot: U = this.list[lo] as U;
    let i: number = lo - 1;
    let j: number = hi + 1;
    while (!this.interrupt) {
      do {
        i++;
      } while (this.leftCompare(this.list[i], pivot));

      do {
        j--;
      } while (this.rightCompare(this.list[j], pivot));

      if (i >= j) {
        return j;
      }

      this.swap(i, j);
      yield true;
    }

    throw new Error('Pivot not found');
  }
}
