<script setup lang="ts">
import AppBar from '@/components/AppBar.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useAppDrawer } from '@/composables/useAppDrawer';
import type { AbstractSortService } from '@/shared/AbstractSortService';
import { BubbleSortService } from '@/shared/BubbleSortService';
import { InsertionSortService } from '@/shared/InsertionSortService';
import { QuickSortNotThreadedService } from '@/shared/QuickSortNotThreadedService';
import { QuickSortService } from '@/shared/QuickSortService';
import { SelectionSortService } from '@/shared/SelectionSortService';
import { ShellSortService } from '@/shared/ShellSortService';
import { useResizeObserver } from '@vueuse/core';
import type { ComputedRef, Ref } from 'vue';
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
import {
  VApp,
  VBtn,
  VCol,
  VContainer,
  VMain,
  VNavigationDrawer,
  VRow,
  VSelect,
  VSlider,
} from 'vuetify/components';

const enum SortAlgorithmName {
  BubbleSort = 'BubbleSort',
  SelectionSort = 'SelectionSort',
  InsertionSort = 'InsertionSort',
  ShellSort = 'ShellSort',
  RandomSelectionSort = 'RandomSelectionSort',
  QuickSort = 'QuickSort',
  QuickSortNotThreaded = 'QuickSortNotThreaded',
}

const enum Theme {
  DefaultDots = 'DefaultDots',
  DefaultLines = 'DefaultLines',
  DefaultDotsWithRed = 'DefaultDotsWithRed',
  DefaultLinesWithRed = 'DefaultLinesWithRed',
  HsvDots = 'HsvDots',
  HsvLines = 'HsvLines',
}

const { appDrawer } = useAppDrawer();
const sortAlgorithm: Ref<SortAlgorithmName> = ref(SortAlgorithmName.BubbleSort);

const canvasWrapper: Ref<HTMLElement | null> = ref(null);
const canvas: Ref<HTMLCanvasElement | null> = ref(null);

const n: Ref<number> = ref(500);
const millis: Ref<number> = ref(10);
const simultaneousSwapsBase: Ref<number> = ref(0);
const simultaneousSwaps: ComputedRef<number> = computed(() =>
  Math.pow(10, simultaneousSwapsBase.value),
);
const theme: Ref<Theme> = ref(Theme.DefaultDots);

const sortAlgorithms: ReadonlyArray<SortAlgorithmName> = [
  SortAlgorithmName.BubbleSort,
  SortAlgorithmName.SelectionSort,
  SortAlgorithmName.InsertionSort,
  SortAlgorithmName.ShellSort,
  // SortAlgorithmName.RandomSelectionSort,
  SortAlgorithmName.QuickSort,
  SortAlgorithmName.QuickSortNotThreaded,
];

const themes: ReadonlyArray<Theme> = [
  Theme.DefaultDots,
  Theme.DefaultLines,
  Theme.DefaultDotsWithRed,
  Theme.DefaultLinesWithRed,
  Theme.HsvDots,
  Theme.HsvLines,
];

const N: Ref<number> = ref(500);
const list: Ref<number[]> = ref([]);

const sortServices: Ref<Map<SortAlgorithmName, AbstractSortService<number>>> =
  ref(new Map());
const sortService: Ref<AbstractSortService<number> | null> = ref(null);

const uiElementsDisabled = computed(
  () => sortService.value?.isRunning() ?? false,
);

function switchSortAlgorithm(sortAlgorithmName: SortAlgorithmName): void {
  if (sortService.value?.isRunning()) {
    console.log('Cant switch because sorting is currently in progress');
    return;
  }

  const sortService_: AbstractSortService<number> | undefined =
    sortServices.value.get(sortAlgorithmName);
  if (sortService_) {
    console.log(`Switched to ${sortAlgorithmName}`);
    sortAlgorithm.value = sortAlgorithmName;
    sortService.value = sortService_;
  }
}

function changeN(newN: number): void {
  if (n.value === newN) {
    return;
  }

  N.value = newN;
  fillList();
  randomizeList();
}

function onSort(): void {
  if (!sortService.value) {
    return;
  }

  if (!sortService.value.isRunning()) {
    sortService.value.setLines(list.value);
    sortService.value.restart();
  }
}

function onStop(): void {
  if (!sortService.value) {
    return;
  }

  if (sortService.value.isRunning()) {
    sortService.value.cancel();
  }
}

function onShuffle(): void {
  if (!sortService.value) {
    return;
  }

  if (!sortService.value.isRunning()) {
    randomizeList();
    // statusbarSortServiceIsRunning.setText("fresh shuffled");
  }
}

useResizeObserver(canvasWrapper, (entries) => {
  if (!canvas.value) {
    return;
  }

  const entry = entries[0];

  canvas.value.width = entry.contentRect.width;
  canvas.value.height = entry.contentRect.height - 7;
});

onBeforeMount(() => {
  sortServices.value.set(
    SortAlgorithmName.BubbleSort,
    new BubbleSortService<number>(
      list.value,
      (i1, i2) => i1 < i2,
      millis.value,
      simultaneousSwaps.value,
    ),
  );
  sortServices.value.set(
    SortAlgorithmName.SelectionSort,
    new SelectionSortService<number>(
      list.value,
      (i1, i2) => i1 > i2,
      millis.value,
      simultaneousSwaps.value,
    ),
  );
  sortServices.value.set(
    SortAlgorithmName.InsertionSort,
    new InsertionSortService<number>(
      list.value,
      (i1, i2) => i1 < i2,
      millis.value,
      simultaneousSwaps.value,
    ),
  );
  sortServices.value.set(
    SortAlgorithmName.ShellSort,
    new ShellSortService<number, number>(
      list.value,
      (i, v) => i < v,
      millis.value,
      simultaneousSwaps.value,
    ),
  );
  sortServices.value.set(
    SortAlgorithmName.QuickSortNotThreaded,
    new QuickSortNotThreadedService<number, number>(
      list.value,
      (i, v) => i > v,
      (i, v) => i < v,
      millis.value,
      simultaneousSwaps.value,
    ),
  );
  sortServices.value.set(
    SortAlgorithmName.QuickSort,
    new QuickSortService<number, number>(
      list.value,
      (i, v) => i > v,
      (i, v) => i < v,
      millis.value,
      simultaneousSwaps.value,
    ),
  );

  switchSortAlgorithm(SortAlgorithmName.BubbleSort);

  fillList();
  randomizeList();
});

onMounted(() => {
  renderLoop();
});

watch(
  millis,
  (millis) => {
    if (sortService.value) {
      for (const [_, service] of sortServices.value) {
        service.millis = millis;
      }
    }
  },
  { immediate: true },
);

watch(
  simultaneousSwaps,
  (simultaneousSwaps) => {
    if (sortService.value) {
      for (const [_, service] of sortServices.value) {
        service.simultaneousSwaps = simultaneousSwaps;
      }
    }
  },
  { immediate: true },
);

function fillList(): void {
  list.value.length = 0;
  for (let i = 0; i < N.value; i++) {
    list.value.push(i);
  }
}

function randomizeList(): void {
  for (let i: number = list.value.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [list.value[i], list.value[j]] = [list.value[j], list.value[i]];
  }
}

function renderLoop(): void {
  const ctx: CanvasRenderingContext2D | null = canvas.value!.getContext('2d');
  if (!ctx) {
    requestAnimationFrame(renderLoop);
    return;
  }

  const width: number = canvas.value!.width;
  const height: number = canvas.value!.height;
  const dw: number = width / list.value.length;
  const dh: number = height / list.value.length;

  ctx.clearRect(0, 0, width, height);
  switch (theme.value) {
    case Theme.HsvDots: {
      for (let x = 0; x < N.value; x++) {
        const o: number = list.value[x];
        ctx.fillStyle = `hsl(${(o / N.value) * 360}, 78%, 54%)`;
        ctx.fillRect(dw * x, dh * o, 2, 2);
      }

      break;
    }

    case Theme.HsvLines: {
      for (let x = 0; x < N.value; x++) {
        const o: number = list.value[x];
        ctx.fillStyle = `hsl(${(o / N.value) * 360}, 78%, 54%)`;
        ctx.fillRect(dw * x, dh * o, 2, height);
      }

      break;
    }

    case Theme.DefaultLines: {
      ctx.fillStyle = 'black';
      for (let x = 0; x < N.value; x++) {
        const o: number = list.value[x];
        ctx.fillRect(dw * x, dh * o, 2, height);
      }

      break;
    }

    case Theme.DefaultLinesWithRed: {
      for (let x = 0; x < N.value; x++) {
        const o: number = list.value[x];
        ctx.fillStyle = -(o - N.value + 1) === x ? 'red' : 'black';
        ctx.fillRect(dw * x, dh * o, 2, height);
      }

      break;
    }

    case Theme.DefaultDotsWithRed: {
      for (let x = 0; x < N.value; x++) {
        const o: number = list.value[x];
        ctx.fillStyle = -(o - N.value + 1) === x ? 'red' : 'black';
        ctx.fillRect(dw * x, dh * o, 2, 2);
      }

      break;
    }

    // eslint-disable-next-line unicorn/no-useless-switch-case
    case Theme.DefaultDots:
    default: {
      ctx.fillStyle = 'black';
      for (let x = 0; x < N.value; x++) {
        const o: number = list.value[x];
        ctx.fillRect(dw * x, dh * o, 2, 2);
      }

      break;
    }
  }

  requestAnimationFrame(renderLoop);
}
</script>

<template>
  <VApp full-height>
    <VNavigationDrawer
      v-model="appDrawer"
      location="end"
      :mobile-breakpoint="632"
    >
      <VContainer>
        <VRow dense>
          <VCol cols="12">
            <VSelect
              v-model="sortAlgorithm"
              :items="sortAlgorithms"
              :disabled="uiElementsDisabled"
              @update:model-value="switchSortAlgorithm"
            />
          </VCol>

          <VCol cols="12">
            <VBtn v-if="uiElementsDisabled" block color="red" @click="onStop">
              <span>Stop!</span>
            </VBtn>
            <VBtn v-else block color="green" @click="onSort">
              <span>Sort!</span>
            </VBtn>
          </VCol>
          <VCol cols="12">
            <VBtn block :disabled="uiElementsDisabled" @click="onShuffle">
              <span>Shuffle!</span>
            </VBtn>
          </VCol>

          <VCol cols="12">
            <span class="pl-1">Elements</span>
            <VSlider
              class="pt-7"
              :model-value="500"
              :min="10"
              :max="15000"
              hide-details
              thumb-label
              :step="10"
              :tick-size="0"
              :disabled="uiElementsDisabled"
              @end="changeN"
            >
              <template #append>
                <span>{{ N }}</span>
              </template>
            </VSlider>
          </VCol>

          <VCol cols="12">
            <span class="pl-1">Delay between swaps</span>
            <VSlider
              v-model="millis"
              class="pt-7"
              :min="4"
              :max="200"
              hide-details
              thumb-label
              :tick-size="0"
              :step="1"
            >
              <template #append>
                <span>{{ millis }} ms</span>
              </template>
            </VSlider>
          </VCol>

          <VCol cols="12">
            <span class="pl-1">Simultaneous swaps</span>
            <VSlider
              v-model="simultaneousSwapsBase"
              class="pt-2 pb-4"
              hide-details
              :min="0"
              :max="3"
              show-ticks="always"
              :ticks="{
                0: '1',
                1: '10',
                2: '100',
                3: '1000',
              }"
              :tick-size="4"
              :step="1"
            >
              <template #append>
                <span>{{ simultaneousSwaps }} swaps</span>
              </template>
            </VSlider>
          </VCol>

          <VCol cols="12">
            <VSelect v-model="theme" :items="themes" />
          </VCol>
        </VRow>
      </VContainer>
    </VNavigationDrawer>

    <AppBar />

    <VMain ref="canvasWrapper">
      <canvas ref="canvas" />
    </VMain>

    <AppFooter />
  </VApp>
</template>
