import { sleep } from './UtilFunction';

export type CompareCallback<T, U = T> = (t: T, u: U) => boolean;
export type SwapCallback<T> = (list: T[], i1: number, i2: number) => void;

export abstract class AbstractSortService<T, U = T> {
  protected list: T[];
  protected listSize: number;
  protected _millis: number;
  protected readonly compare: CompareCallback<T, U>;
  protected readonly swap?: SwapCallback<T>;
  protected running: boolean = false;
  protected interrupt: boolean = false;

  public constructor(list: T[], compare: CompareCallback<T, U>, swap?: SwapCallback<T>, millis: number = 0) {
    if (millis < 0) {
      throw new Error('millis should not be negative');
    }
    this.list = list;
    this.listSize = list.length;
    this.compare = compare;
    this.swap = swap;
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
      this.start();
    }
  }

  protected async start(): Promise<void> {
    const process: IterableIterator<boolean> | AsyncIterableIterator<boolean> = this.process();
    this.running = true;
    while (!this.interrupt) {
      const next:
        | IteratorYieldResult<boolean>
        | IteratorReturnResult<any>
        | Promise<IteratorResult<boolean, any>> = process.next();
      const hasNext: boolean = next instanceof Promise ? (await next).value : next.value;
      if (!hasNext) {
        break;
      }
      await sleep(this.millis);
    }
    this.interrupt = false;
    this.running = false;
  }

  protected abstract process(): IterableIterator<boolean> | AsyncIterableIterator<boolean>;
}
