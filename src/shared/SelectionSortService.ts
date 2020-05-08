import { AbstractSortService, CompareCallback } from './AbstractSortService';

export class SelectionSortService<T> extends AbstractSortService<T> {
  public constructor(list: T[], compare: CompareCallback<T>, millis: number = 0) {
    super(list, compare, millis);
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
        this.swap(j, iMin);
        yield true;
      }
    }
    yield false;
  }
}
