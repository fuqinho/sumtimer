<script setup lang="ts">
import ActivityList from 'src/components/ActivityList.vue';
import OngoingRecord from 'src/components/OngoingRecord.vue';
</script>

<template>
  <q-page class="row items-center justify-evenly">
    <ongoing-record></ongoing-record>
    <activity-list></activity-list>
  </q-page>
</template>
