/* eslint-disable @typescript-eslint/member-ordering */
import Vue from 'vue';
import Component from 'vue-class-component';
import { Ref, Watch } from 'vue-property-decorator';
import { AbstractSortService } from './shared/AbstractSortService';
import { BubbleSortService } from './shared/BubbleSortService';
import { InsertionSortService } from './shared/InsertionSortService';
import { SelectionSortService } from './shared/SelectionSortService';
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

@Component
export default class App extends Vue {
  public drawer: boolean = true;

  public sortAlgorithm: SortAlgorithmName = SortAlgorithmName.BubbleSort;

  @Ref('canvas')
  public readonly canvas!: HTMLCanvasElement;

  public n: number = 100;
  private N: number = 100;
  public delayActive: boolean = true;
  private millis: number = 10;
  private list: number[] = [];

  private readonly sortServices: Map<SortAlgorithmName, AbstractSortService<number>> = new Map();
  private sortService: AbstractSortService<number> | null = null;

  public get sortAlgorithms(): SortAlgorithmName[] {
    return [SortAlgorithmName.BubbleSort, SortAlgorithmName.SelectionSort, SortAlgorithmName.InsertionSort];
  }

  public get uiElementsDisabled(): boolean {
    return this.sortService?.isRunning() ?? false;
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
      // case QuickSortNotThreaded:
      // 	if (!(sortService instanceof QuickSortNotThreadedService)) {
      // 		System.out.println("Switched to QuickSortNotThreaded");
      // 		statusbarSortalgorithm.setText("QuickSortNotThreaded");
      // 		sortService = sortServices.get(SortAlgorithmName.QuickSortNotThreaded);
      // 	}
      // 	break;
      // case ShellSort:
      // 	if (!(sortService instanceof ShellSortService)) {
      // 		System.out.println("Switched to ShellSort");
      // 		statusbarSortalgorithm.setText("ShellSort");
      // 		sortService = sortServices.get(SortAlgorithmName.ShellSort);
      // 	}
      // 	break;
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

  @Watch('millis', { immediate: true })
  public onMillisChange(millis: number): void {
    if (this.sortService) {
      this.sortServices.forEach((s) => (s.millis = millis));
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

    this.switchSortAlgorithm(SortAlgorithmName.BubbleSort);

    this.fillList();
    this.randomizeList();
  }

  public mounted(): void {
    this.renderLoop();
  }

  private async renderLoop(): Promise<void> {
    const ctx: CanvasRenderingContext2D | null = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const canvasWidth: number = this.canvas.width;
      const canvasHeight: number = this.canvas.height;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = 'black';

      for (let index: number = 0; index < this.list.length; index++) {
        const x: number = (index / this.list.length) * canvasWidth;
        const y: number = (this.list[index] / this.N) * canvasHeight;
        ctx.fillRect(x, y, 3, 3);
      }

      await sleep(1);
    }
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
}