<script setup lang="ts">
import { VBtn, VFooter, VIcon, VSpacer } from 'vuetify/components';
</script>

<template>
  <VFooter app color="grey-lighten-5">
    <span>
      Copyright &copy; 2020 - 2024 Christopher Quadflieg aka Shinigami
    </span>
    <VSpacer />
    <VBtn
      icon
      flat
      href="https://github.com/Shinigami92/visualised-sorting-algorithm"
      target="_blank"
    >
      <VIcon>mdi-github</VIcon>
    </VBtn>
  </VFooter>
</template>
