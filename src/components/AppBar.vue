<script setup lang="ts">
import { useAppDrawer } from '@/composables/useAppDrawer';
import {
  VAppBar,
  VAppBarNavIcon,
  VAppBarTitle,
  VSpacer,
} from 'vuetify/components';

const { toggleAppDrawer } = useAppDrawer();
</script>

<template>
  <VAppBar color="grey-lighten-5">
    <VAppBarTitle>Visualised Sorting Algorithm</VAppBarTitle>
    <VSpacer />
    <VAppBarNavIcon @click="toggleAppDrawer()" />
  </VAppBar>
</template>
