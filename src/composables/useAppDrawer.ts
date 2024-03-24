import { useToggle } from '@vueuse/core';
import type { Ref } from 'vue';

export interface UseAppDrawerReturn {
  appDrawer: Ref<boolean>;
  toggleAppDrawer: (value?: boolean) => boolean;
}

const [appDrawer, toggleAppDrawer] = useToggle(true);

export function useAppDrawer(): UseAppDrawerReturn {
  return {
    appDrawer,
    toggleAppDrawer,
  };
}
