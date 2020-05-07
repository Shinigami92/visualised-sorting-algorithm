import { AbstractSortService, CompareCallback, SwapCallback } from './AbstractSortService';
import { sleep } from './UtilFunction';

export class QuickSortNotThreadedService<T, U> extends AbstractSortService<T, U> {
  private readonly pivotSave?: (t: T) => U;
  private readonly leftCompare: CompareCallback<T, U>;
  private readonly rightCompare: CompareCallback<T, U>;

  public constructor(
    list: T[],
    leftCompare: CompareCallback<T, U>,
    rightCompare: CompareCallback<T, U>,
    pivotSave?: (t: T) => U,
    swap?: SwapCallback<T>,
    millis: number = 0
  ) {
    super(list, null as any, swap, millis);
    this.pivotSave = pivotSave;
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
      while (!this.interrupt) {
        const value: boolean | number = gen.next().value;
        if (typeof value === 'number') {
          p = value;
          break;
        }
        await sleep(1);
      }
      await this.quicksort(lo, p);
      await this.quicksort(p + 1, hi);
    }
  }

  private *partition(lo: number, hi: number): Generator<boolean, number, unknown> {
    const pivot: U = this.pivotSave ? this.pivotSave(this.list[lo]) : ((this.list[lo] as unknown) as U);
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
      if (this.swap) {
        this.swap(this.list, i, j);
      } else {
        const temp: T = this.list[i];
        this.list[i] = this.list[j];
        this.list[j] = temp;
      }
      yield true;
    }
    throw new Error('Pivot not found');
  }
}
