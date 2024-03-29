<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
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
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import type { RecordDoc, RecordDocumentData } from '@/types/documents';
import { recordsPerPage } from '@/common/constants';
import RecordItem from '@/components/RecordItem.vue';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  uid: string;
  aid?: string;
  records?: RecordDoc[];
}>();

// =========================== Use stores/composables ==========================

// =========================== Refs ============================================
const currentSnapshot = ref(null as QuerySnapshot<RecordDocumentData> | null);
const hasNext = ref(false);
const hasPrev = ref(false);

// =========================== Computed properties =============================
const records = computed(() => {
  if (props.records) {
    return props.records;
  }
  if (currentSnapshot.value) {
    return currentSnapshot.value.docs.map((d) => {
      return { id: d.id, data: d.data() };
    });
  } else {
    return [] as RecordDoc[];
  }
});

// =========================== Methods =========================================
function loadPrev() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  const q = buildQuery(props.aid, false, true);
  unsubscribe = onSnapshot(q, (snapshot) => {
    currentSnapshot.value = snapshot as QuerySnapshot<RecordDocumentData>;
  });
}

function loadNext() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  const q = buildQuery(props.aid, true, false);
  unsubscribe = onSnapshot(q, (snapshot) => {
    currentSnapshot.value = snapshot as QuerySnapshot<RecordDocumentData>;
  });
}

function buildQuery(
  aid?: string,
  isNext?: boolean,
  isPrev?: boolean,
  pageSize?: number
) {
  if (!pageSize) pageSize = recordsPerPage;
  const recordsCollection = collection(getFirestore(), 'records');
  const snapshot = currentSnapshot.value;
  if (snapshot && isNext && snapshot.docs.length > 0) {
    const last = snapshot.docs[snapshot.docs.length - 1];
    if (aid) {
      return query(
        recordsCollection,
        where('uid', '==', props.uid),
        where('aid', '==', aid),
        orderBy('end', 'desc'),
        startAfter(last),
        limit(pageSize)
      );
    } else {
      return query(
        recordsCollection,
        where('uid', '==', props.uid),
        orderBy('end', 'desc'),
        startAfter(last),
        limit(pageSize)
      );
    }
  } else if (snapshot && isPrev && snapshot.docs.length > 0) {
    const first = snapshot.docs[0];
    if (aid) {
      return query(
        recordsCollection,
        where('uid', '==', props.uid),
        where('aid', '==', aid),
        orderBy('end', 'desc'),
        endBefore(first),
        limitToLast(pageSize)
      );
    } else {
      return query(
        recordsCollection,
        where('uid', '==', props.uid),
        orderBy('end', 'desc'),
        endBefore(first),
        limitToLast(pageSize)
      );
    }
  } else {
    if (aid) {
      return query(
        recordsCollection,
        where('uid', '==', props.uid),
        where('aid', '==', aid),
        orderBy('end', 'desc'),
        limit(pageSize)
      );
    } else {
      return query(
        recordsCollection,
        where('uid', '==', props.uid),
        orderBy('end', 'desc'),
        limit(pageSize)
      );
    }
  }
}

// =========================== Additional setup ================================

let unsubscribe = null as Unsubscribe | null;

if (!props.records) {
  onMounted(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    const q = buildQuery(props.aid);
    unsubscribe = onSnapshot(q, (snapshot) => {
      currentSnapshot.value = snapshot as QuerySnapshot<RecordDocumentData>;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  });

  watch(currentSnapshot, async (snapshot) => {
    if (snapshot) {
      const qNext = buildQuery(props.aid, true, false, 1);
      const docsNext = await getDocs(qNext);
      hasNext.value = docsNext.docs.length > 0;

      const qPrev = buildQuery(props.aid, false, true, 1);
      const docsPrev = await getDocs(qPrev);
      hasPrev.value = docsPrev.docs.length > 0;
    } else {
      hasNext.value = false;
      hasPrev.value = false;
    }
  });
}
</script>

<template>
  <div>
    <q-list bordered separator class="q-mb-sm">
      <RecordItem
        v-for="record in records"
        :key="record.id"
        :doc="record"
      ></RecordItem>
    </q-list>
    <div v-if="hasPrev || hasNext" class="row items-center justify-center">
      <q-btn
        icon="navigate_before"
        :disable="!hasPrev"
        size="md"
        padding="xs"
        @click="loadPrev"
      />
      <q-btn
        icon="navigate_next"
        :disable="!hasNext"
        size="md"
        padding="xs"
        @click="loadNext"
      />
    </div>
  </div>
</template>
