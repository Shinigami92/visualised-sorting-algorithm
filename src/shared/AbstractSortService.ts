import { sleep } from './UtilFunction';

export type CompareCallback<T, U = T> = (t: T, u: U) => boolean;

export abstract class AbstractSortService<T, U = T> {
  protected list: T[];
  protected listSize: number;
  protected _millis: number;
  protected readonly compare: CompareCallback<T, U>;
  protected running = false;
  protected interrupt = false;

  public constructor(
    list: T[],
    compare: CompareCallback<T, U>,
    millis: number = 0,
  ) {
    if (millis < 0) {
      throw new Error('millis should not be negative');
    }

    this.list = list;
    this.listSize = list.length;
    this.compare = compare;
    this._millis = millis;
  }

  public get millis(): number {
    return this._millis;
  }

  public set millis(millis: number) {
    if (millis < 0) {
      throw new Error('millis should not be negative');
    }

    this._millis = millis;
  }

  public setLines(list: T[]): void {
    this.list = list;
    this.listSize = list.length;
  }

  public swap(i: number, j: number): void {
    const temp: T = this.list[i];
    this.list[i] = this.list[j];
    this.list[j] = temp;
  }

  public isRunning(): boolean {
    return this.running;
  }

  public cancel(): void {
    this.interrupt = true;
  }

  public restart(): void {
    if (this.isRunning()) {
      this.cancel();
      setTimeout(() => this.start(), 100);
    } else {
      void this.start();
    }
  }

  protected async start(): Promise<void> {
    const process: IterableIterator<boolean> | AsyncIterableIterator<boolean> =
      this.process();
    this.running = true;
    while (!this.interrupt) {
      const next:
        | IteratorYieldResult<boolean>
        | IteratorReturnResult<any>
        | Promise<IteratorResult<boolean, any>> = process.next();
      const hasNext: boolean =
        next instanceof Promise
          ? // eslint-disable-next-line unicorn/no-await-expression-member
            (await next).value
          : next.value;
      if (!hasNext) {
        break;
      }

      await sleep(this.millis);
    }

    this.interrupt = false;
    this.running = false;
  }

  protected abstract process():
    | IterableIterator<boolean>
    | AsyncIterableIterator<boolean>;
}
