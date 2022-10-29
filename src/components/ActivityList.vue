<script setup lang="ts">
import ActivityItem from 'src/components/ActivityItem.vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ActivityDoc, ActivityDocumentData } from 'src/types/documents';
import {
  collection,
  endBefore,
  getDocs,
  getFirestore,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  startAfter,
  Unsubscribe,
  where,
} from '@firebase/firestore';
import { activitiesPerPage } from 'src/common/constants';

// =========================== Properties/Emitters =============================
interface Props {
  uid: string;
  cid?: string;
}
const props = defineProps<Props>();

// =========================== Use stores/composables ==========================

// =========================== Refs ============================================
const currentSnapshot = ref(null as QuerySnapshot<ActivityDocumentData> | null);
const hasNext = ref(false);
const hasPrev = ref(false);

// =========================== Computed properties =============================
const cid = computed(() => props.cid);
const activities = computed(() => {
  if (currentSnapshot.value) {
    return currentSnapshot.value.docs.map((a) => {
      return { id: a.id, data: a.data() };
    });
  } else {
    return [] as ActivityDoc[];
  }
});

// =========================== Methods =========================================
function loadPrev() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  const q = buildQuery(false, true);
  unsubscribe = onSnapshot(q, (snapshot) => {
    currentSnapshot.value = snapshot as QuerySnapshot<ActivityDocumentData>;
  });
}

function loadNext() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  const q = buildQuery(true, false);
  unsubscribe = onSnapshot(q, (snapshot) => {
    currentSnapshot.value = snapshot as QuerySnapshot<ActivityDocumentData>;
  });
}

function buildQuery(isNext?: boolean, isPrev?: boolean, pageSize?: number) {
  if (!pageSize) pageSize = activitiesPerPage;
  const activitiesCollection = collection(getFirestore(), 'activities');
  const snapshot = currentSnapshot.value;
  if (snapshot && isNext && snapshot.docs.length > 0) {
    const last = snapshot.docs[snapshot.docs.length - 1];
    if (props.cid) {
      return query(
        activitiesCollection,
        where('uid', '==', props.uid),
        where('cid', '==', props.cid),
        orderBy('updated', 'desc'),
        startAfter(last),
        limit(pageSize)
      );
    } else {
      return query(
        activitiesCollection,
        where('uid', '==', props.uid),
        orderBy('updated', 'desc'),
        startAfter(last),
        limit(pageSize)
      );
    }
  } else if (snapshot && isPrev && snapshot.docs.length > 0) {
    const first = snapshot.docs[0];
    if (props.cid) {
      return query(
        activitiesCollection,
        where('uid', '==', props.uid),
        where('cid', '==', props.cid),
        orderBy('updated', 'desc'),
        endBefore(first),
        limitToLast(pageSize)
      );
    } else {
      return query(
        activitiesCollection,
        where('uid', '==', props.uid),
        orderBy('updated', 'desc'),
        endBefore(first),
        limitToLast(pageSize)
      );
    }
  } else {
    if (props.cid) {
      return query(
        activitiesCollection,
        where('uid', '==', props.uid),
        where('cid', '==', props.cid),
        orderBy('updated', 'desc'),
        limit(pageSize)
      );
    } else {
      return query(
        activitiesCollection,
        where('uid', '==', props.uid),
        orderBy('updated', 'desc'),
        limit(pageSize)
      );
    }
  }
}

// =========================== Additional setup ================================
let unsubscribe = null as Unsubscribe | null;

onMounted(reloadSnapshot);
watch(cid, reloadSnapshot);

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
});

watch(currentSnapshot, async (snapshot) => {
  if (snapshot) {
    const qNext = buildQuery(true, false, 1);
    const docsNext = await getDocs(qNext);
    hasNext.value = docsNext.docs.length > 0;

    const qPrev = buildQuery(false, true, 1);
    const docsPrev = await getDocs(qPrev);
    hasPrev.value = docsPrev.docs.length > 0;
  } else {
    hasNext.value = false;
    hasPrev.value = false;
  }
});

function reloadSnapshot() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  const q = buildQuery();
  unsubscribe = onSnapshot(q, (snapshot) => {
    currentSnapshot.value = snapshot as QuerySnapshot<ActivityDocumentData>;
  });
}
</script>

<template>
  <div>
    <q-list bordered separator>
      <ActivityItem
        v-for="activity in activities"
        :key="activity.id"
        :doc="activity"
      ></ActivityItem>
    </q-list>
    <q-btn @click="loadPrev" :disable="!hasPrev">Prev</q-btn>
    <q-btn @click="loadNext" :disable="!hasNext">Next</q-btn>
  </div>
</template>
