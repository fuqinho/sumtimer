<script setup lang="ts">
import { ref } from 'vue';

const video1 = ref(false);
</script>

<template>
  <div>
    <h2>Sumtimer</h2>
    <div class="text-body1">
      <span class="text-italic">Sumtimer</span> is a simple time tracker to
      measure and improve your personal time usage.
    </div>

    <h4>How to use</h4>
    <div class="row q-col-gutter-sm">
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">1. Organize activities</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            Register the activities for which you want to record time.
          </q-card-section>
          <q-card-section class="q-pt-none" @click="video1 = true">
            <video
              loop
              autoplay
              muted
              preload="metadata"
              class="cursor-pointer"
            >
              <source src="videos/intro-add-activity.webm" type="video/webm" />
            </video>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">2. Record activity times</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            Start recording time by clicking "Play" button on an activity.
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">3. Review records</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            You can review past records on a weekly basis.
          </q-card-section>
        </q-card>
      </div>
    </div>
    <h4>Additional features</h4>
    <div class="row q-col-gutter-sm">
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Focus mode</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            You can prevent yourself from spending time on specified websites
            (e.g. Youtube, Twitter, etc...) using a companion Chrome extension.
          </q-card-section>
          <q-card-section class="q-pt-none"></q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Weekly targets</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            You can set weekly targets for each category (e.g. 4 hours for
            excercises) and watch progress.
          </q-card-section>
        </q-card>
      </div>
    </div>
    <h6></h6>
  </div>
  <q-dialog v-model="video1">
    <div class="video-container">
      <video loop autoplay muted preload="metadata" controls>
        <source src="videos/intro-add-activity.webm" type="video/webm" />
      </video>
    </div>
  </q-dialog>
</template>

<style scoped>
video {
  width: 100%;
  height: 100%;
}

.video-container {
  max-width: 80%;
  max-height: 80%;
}
</style>
