import Vue from 'vue';
import Component from 'vue-class-component';
import { Ref, Watch } from 'vue-property-decorator';
import { AbstractSortService } from './shared/AbstractSortService';
import { BubbleSortService } from './shared/BubbleSortService';
import { InsertionSortService } from './shared/InsertionSortService';
import { QuickSortNotThreadedService } from './shared/QuickSortNotThreadedService';
import { SelectionSortService } from './shared/SelectionSortService';
import { ShellSortService } from './shared/ShellSortService';
import { sleep } from './shared/UtilFunction';

export const enum SortAlgorithmName {
  BubbleSort = 'BubbleSort',
  SelectionSort = 'SelectionSort',
  InsertionSort = 'InsertionSort',
  ShellSort = 'ShellSort',
  RandomSelectionSort = 'RandomSelectionSort',
  QuickSort = 'QuickSort',
  QuickSortNotThreaded = 'QuickSortNotThreaded'
}

export const enum Theme {
  DefaultDots = 'DefaultDots',
  DefaultLines = 'DefaultLines',
  DefaultDotsWithRed = 'DefaultDotsWithRed',
  DefaultLinesWithRed = 'DefaultLinesWithRed',
  HsvDots = 'HsvDots',
  HsvLines = 'HsvLines'
}

@Component
export default class App extends Vue {
  public drawer: boolean = true;

  public sortAlgorithm: SortAlgorithmName = SortAlgorithmName.BubbleSort;

  @Ref('canvas')
  public readonly canvas!: HTMLCanvasElement;

  public n: number = 1000;
  public delayActive: boolean = true;
  public millis: number = 10;
  public theme: Theme = Theme.DefaultDots;

  public readonly sortAlgorithms: ReadonlyArray<SortAlgorithmName> = [
    SortAlgorithmName.BubbleSort,
    SortAlgorithmName.SelectionSort,
    SortAlgorithmName.InsertionSort,
    SortAlgorithmName.ShellSort,
    //   SortAlgorithmName.RandomSelectionSort,
    //   SortAlgorithmName.QuickSort,
    SortAlgorithmName.QuickSortNotThreaded
  ];

  public readonly themes: ReadonlyArray<Theme> = [
    Theme.DefaultDots,
    Theme.DefaultLines,
    Theme.DefaultDotsWithRed,
    Theme.DefaultLinesWithRed,
    Theme.HsvDots,
    Theme.HsvLines
  ];

  private N: number = 1000;
  private list: number[] = [];

  private readonly sortServices: Map<SortAlgorithmName, AbstractSortService<number>> = new Map();
  private sortService: AbstractSortService<number> | null = null;

  public get uiElementsDisabled(): boolean {
    return this.sortService?.isRunning() ?? false;
  }

  public switchSortAlgorithm(sortAlgorithmName: SortAlgorithmName): void {
    if (this.sortService?.isRunning()) {
      console.log('Cant switch because sorting is currently in progress');
      return;
    }
    switch (sortAlgorithmName) {
      case SortAlgorithmName.SelectionSort:
        if (!(this.sortService instanceof SelectionSortService)) {
          console.log('Switched to SelectionSort');
          // statusbarSortalgorithm.setText('SelectionSort');
          this.sortAlgorithm = SortAlgorithmName.SelectionSort;
          this.sortService = this.sortServices.get(SortAlgorithmName.SelectionSort) ?? null;
        }
        break;
      case SortAlgorithmName.InsertionSort:
        if (!(this.sortService instanceof InsertionSortService)) {
          console.log('Switched to InsertionSort');
          // statusbarSortalgorithm.setText("InsertionSort");
          this.sortAlgorithm = SortAlgorithmName.InsertionSort;
          this.sortService = this.sortServices.get(SortAlgorithmName.InsertionSort) ?? null;
        }
        break;
      // case QuickSort:
      // 	if (!(sortService instanceof QuickSortService)) {
      // 		System.out.println("Switched to QuickSort");
      // 		statusbarSortalgorithm.setText("QuickSort");
      // 		sortService = sortServices.get(SortAlgorithmName.QuickSort);
      // 	}
      // 	break;
      case SortAlgorithmName.QuickSortNotThreaded:
        if (!(this.sortService instanceof QuickSortNotThreadedService)) {
          console.log('Switched to QuickSortNotThreaded');
          // statusbarSortalgorithm.setText('QuickSortNotThreaded');
          this.sortService = this.sortServices.get(SortAlgorithmName.QuickSortNotThreaded) ?? null;
        }
        break;
      case SortAlgorithmName.ShellSort:
        if (!(this.sortService instanceof ShellSortService)) {
          console.log('Switched to ShellSort');
          // statusbarSortalgorithm.setText('ShellSort');
          this.sortService = this.sortServices.get(SortAlgorithmName.ShellSort) ?? null;
        }
        break;
      // case RandomSelectionSort:
      // 	if (!(sortService instanceof RandomSelectionSortService)) {
      // 		System.out.println("Switched to RandomSelectionSort");
      // 		statusbarSortalgorithm.setText("RandomSelectionSort");
      // 		sortService = sortServices.get(SortAlgorithmName.RandomSelectionSort);
      // 	}
      // 	break;
      case SortAlgorithmName.BubbleSort:
      default:
        if (!(this.sortService instanceof BubbleSortService)) {
          console.log('Switched to BubbleSort');
          // statusbarSortalgorithm.setText('BubbleSort');
          this.sortAlgorithm = SortAlgorithmName.BubbleSort;
          this.sortService = this.sortServices.get(SortAlgorithmName.BubbleSort) ?? null;
        }
        break;
    }
  }

  public changeN(newN: number): void {
    if (this.n === newN) {
      return;
    }

    this.N = newN;
    this.fillList();
    this.randomizeList();
  }

  public onSort(): void {
    if (!this.sortService) {
      return;
    }

    if (!this.sortService.isRunning()) {
      this.sortService.setLines(this.list);
      this.sortService.restart();
    }
  }

  public onStop(): void {
    if (!this.sortService) {
      return;
    }

    if (this.sortService.isRunning()) {
      this.sortService.cancel();
    }
  }

  public onShuffle(): void {
    if (!this.sortService) {
      return;
    }

    if (!this.sortService.isRunning()) {
      this.randomizeList();
      // statusbarSortServiceIsRunning.setText("fresh shuffled");
    }
  }

  public async onResize(): Promise<void> {
    if (this.canvas) {
      await this.$nextTick();
      const contentWrapper: HTMLDivElement = document.getElementById('canvas-wrapper') as HTMLDivElement;

      this.canvas.width = contentWrapper.clientWidth;
      this.canvas.height = contentWrapper.clientHeight - 48;
    }
  }

  public beforeMount(): void {
    this.sortServices.set(
      SortAlgorithmName.BubbleSort,
      new BubbleSortService<number>(this.list, (i1, i2) => i1 < i2, undefined, this.millis)
    );
    this.sortServices.set(
      SortAlgorithmName.SelectionSort,
      new SelectionSortService<number>(this.list, (i1, i2) => i1 > i2, undefined, this.millis)
    );
    this.sortServices.set(
      SortAlgorithmName.InsertionSort,
      new InsertionSortService<number>(this.list, (i1, i2) => i1 < i2, undefined, this.millis)
    );
    this.sortServices.set(
      SortAlgorithmName.ShellSort,
      new ShellSortService<number, number>(this.list, (i, v) => i < v, undefined, undefined, undefined, this.millis)
    );
    this.sortServices.set(
      SortAlgorithmName.QuickSortNotThreaded,
      new QuickSortNotThreadedService<number, number>(
        this.list,
        (i, v) => i > v,
        (i, v) => i < v,
        undefined,
        undefined,
        this.millis
      )
    );

    this.switchSortAlgorithm(SortAlgorithmName.BubbleSort);

    this.fillList();
    this.randomizeList();
  }

  public mounted(): void {
    this.renderLoop();
  }

  @Watch('millis', { immediate: true })
  public onMillisChange(millis: number): void {
    if (this.sortService) {
      this.sortServices.forEach((s) => (s.millis = millis));
    }
  }

  private fillList(): void {
    this.list.length = 0;
    for (let i: number = 0; i < this.N; i++) {
      this.list.push(i);
    }
  }

  private randomizeList(): void {
    for (let i: number = this.list.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1));
      [this.list[i], this.list[j]] = [this.list[j], this.list[i]];
    }
  }

  private async renderLoop(): Promise<void> {
    const ctx: CanvasRenderingContext2D | null = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const width: number = this.canvas.width;
      const height: number = this.canvas.height;
      const dw: number = width / this.list.length;
      const dh: number = height / this.list.length;

      ctx.clearRect(0, 0, width, height);
      switch (this.theme) {
        case Theme.HsvDots:
          for (let x: number = 0; x < this.N; x++) {
            const o: number = this.list[x];
            ctx.fillStyle = `hsl(${(o / this.N) * 360}, 78%, 54%)`;
            ctx.fillRect(dw * x, dh * o, 2.0, 2.0);
          }
          break;
        case Theme.HsvLines:
          for (let x: number = 0; x < this.N; x++) {
            const o: number = this.list[x];
            ctx.fillStyle = `hsl(${(o / this.N) * 360}, 78%, 54%)`;
            ctx.fillRect(dw * x, dh * o, 2.0, height);
          }
          break;
        case Theme.DefaultLines:
          ctx.fillStyle = 'black';
          for (let x: number = 0; x < this.N; x++) {
            const o: number = this.list[x];
            ctx.fillRect(dw * x, dh * o, 2.0, height);
          }
          break;
        case Theme.DefaultLinesWithRed:
          for (let x: number = 0; x < this.N; x++) {
            const o: number = this.list[x];
            ctx.fillStyle = -(o - this.N + 1) == x ? 'red' : 'black';
            ctx.fillRect(dw * x, dh * o, 2.0, height);
          }
          break;
        case Theme.DefaultDotsWithRed:
          for (let x: number = 0; x < this.N; x++) {
            const o: number = this.list[x];
            ctx.fillStyle = -(o - this.N + 1) == x ? 'red' : 'black';
            ctx.fillRect(dw * x, dh * o, 2.0, 2.0);
          }
          break;
        case Theme.DefaultDots:
        default:
          ctx.fillStyle = 'black';
          for (let x: number = 0; x < this.N; x++) {
            const o: number = this.list[x];
            ctx.fillRect(dw * x, dh * o, 2, 2);
          }
          break;
      }

      await sleep(1);
    }
  }
}
