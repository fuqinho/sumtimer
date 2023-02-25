<script setup lang="ts">
import { ref } from 'vue';
import SigninButton from '@/components/SigninButton.vue';

const video1 = ref(false);
const video2 = ref(false);
const image3 = ref(false);
const videoa1 = ref(false);
const videoa2 = ref(false);
</script>

<template>
  <div>
    <div class="column items-center">
      <img class="overview-img" src="images/overview.png" />
      <div class="overview-text q-py-lg">
        Sumtimer is a simple time tracker to measure and improve your personal
        time usage.
      </div>
      <SigninButton />
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
              class="cursor-pointer section-video"
            >
              <source src="videos/add-activity.webm" type="video/webm" />
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
          <q-card-section class="q-pt-none" @click="video2 = true">
            <video
              loop
              autoplay
              muted
              preload="metadata"
              class="cursor-pointer section-video"
            >
              <source src="videos/add-record.mp4" type="video/mp4" />
            </video>
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
          <q-card-section class="q-pt-none" @click="image3 = true">
            <img
              class="cursor-pointer section-img"
              src="images/review-records.png"
            />
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
          <q-card-section class="q-pt-none" @click="videoa1 = true">
            <video
              loop
              autoplay
              muted
              preload="metadata"
              class="cursor-pointer section-video"
            >
              <source src="videos/focus-mode.webm" type="video/webm" />
            </video>
          </q-card-section>
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
          <q-card-section class="q-pt-none" @click="videoa2 = true">
            <video
              loop
              autoplay
              muted
              preload="metadata"
              class="cursor-pointer section-video"
            >
              <source src="videos/weekly-targets.webm" type="video/webm" />
            </video>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <h6></h6>
  </div>
  <q-dialog v-model="video1">
    <div class="video-container">
      <video
        class="section-video"
        loop
        autoplay
        muted
        preload="metadata"
        controls
      >
        <source src="videos/add-activity.webm" type="video/webm" />
      </video>
    </div>
  </q-dialog>
  <q-dialog v-model="video2">
    <div class="video-container">
      <video
        class="section-video"
        loop
        autoplay
        muted
        preload="metadata"
        controls
      >
        <source src="videos/add-record.mp4" type="video/mp4" />
      </video>
    </div>
  </q-dialog>
  <q-dialog v-model="image3">
    <div class="image-container">
      <img class="section-img" src="images/review-records.png" />
    </div>
  </q-dialog>
  <q-dialog v-model="videoa1">
    <div class="video-container">
      <video
        class="section-video"
        loop
        autoplay
        muted
        preload="metadata"
        controls
      >
        <source src="videos/focus-mode.webm" type="video/webm" />
      </video>
    </div>
  </q-dialog>
  <q-dialog v-model="videoa2">
    <div class="video-container">
      <video
        class="section-video"
        loop
        autoplay
        muted
        preload="metadata"
        controls
      >
        <source src="videos/weekly-targets.webm" type="video/webm" />
      </video>
    </div>
  </q-dialog>
</template>

<style scoped>
.overview-img {
  width: 90%;
  max-width: 1200px;
}

.overview-text {
  width: 90%;
  font-size: 22px;
  color: #444;
  text-align: center;
}

.section-video {
  width: 100%;
  height: 100%;
}

.section-img {
  width: 100%;
  height: 100%;
}

.video-container {
  max-width: 80%;
  max-height: 80%;
}

.image-container {
  max-width: 80%;
  max-height: 80%;
}
</style>
