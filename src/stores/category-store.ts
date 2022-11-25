import { computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
  QuerySnapshot,
  writeBatch,
  getDoc,
  DocumentReference,
  WriteBatch,
} from 'firebase/firestore';
import type { CategoryChange, CategoryDocumentData } from '@/types/documents';
import type { PortableCategory } from '@/types/portable';
import { useAuthStore } from '@/stores/auth-store';
import { useCacheStore } from '@/stores/cache-store';
import {
  DeleteActivityResult,
  useActivityStore,
} from '@/stores/activity-store';

export const enum DeleteCategoryResult {
  Success,
  ErrorHasRecords,
}

export const useCategoryStore = defineStore('catgories', () => {
  console.log('Setup categoryStore start');
  const authStore = useAuthStore();
  const cacheStore = useCacheStore();
  const activityStore = useActivityStore();
  const { uid } = storeToRefs(authStore);
  const { categories } = storeToRefs(cacheStore);

  const lastOrder = computed(() => {
    if (!categories.value || categories.value.length == 0) return 0;
    return categories.value[categories.value.length - 1].data.order;
  });

  async function addCategory(
    label: string,
    color: string,
    cid?: string,
    order?: number,
    inBatch?: WriteBatch
  ) {
    const data: CategoryDocumentData = {
      uid: uid.value,
      label: label,
      color: color,
      order: order !== undefined ? order : lastOrder.value + 1,
    };
    const batch = inBatch || writeBatch(getFirestore());
    const colRef = collection(getFirestore(), 'categories');
    const docRef = cid ? doc(colRef, cid) : doc(colRef);
    cacheStore.onCategoryAdded(batch, docRef.id, data);
    batch.set(docRef, data);
    if (!inBatch) await batch.commit();
  }

  async function deleteCategory(id: string): Promise<DeleteCategoryResult> {
    const activities = await activityStore.getActivitiesByCategory(id);
    if (activities.length > 0) {
      for (const act of activities) {
        const result = await activityStore.deleteActivity(act.id);
        if (result != DeleteActivityResult.Success) {
          return DeleteCategoryResult.ErrorHasRecords;
        }
      }
    }
    const colRef = collection(getFirestore(), 'categories');
    const docRef = doc(colRef, id) as DocumentReference<CategoryDocumentData>;
    const batch = writeBatch(getFirestore());
    cacheStore.onCategoryDeleted(batch, docRef.id);
    batch.delete(docRef);
    await batch.commit();
    return DeleteCategoryResult.Success;
  }

  async function updateCategory(id: string, change: CategoryChange) {
    const colRef = collection(getFirestore(), 'categories');
    const docRef = doc(colRef, id) as DocumentReference<CategoryDocumentData>;
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      console.error('Trying to update a category which does not exist.');
      return;
    }
    const oldData = snapshot.data();
    const newData = { ...oldData, ...change };
    const batch = writeBatch(getFirestore());
    cacheStore.onCategoryUpdated(batch, id, oldData, newData);
    batch.set(docRef, newData);
    await batch.commit();
  }

  async function moveUp(id: string) {
    let index = -1;
    for (let i = 0; i < categories.value.length; i++) {
      if (categories.value[i].id == id) {
        index = i;
        break;
      }
    }
    if (index > 0) {
      const order0 =
        index - 2 >= 0 ? categories.value[index - 2].data.order : 0;
      const order1 = categories.value[index - 1].data.order;
      await updateCategory(id, { order: (order0 + order1) / 2 });
    }
  }

  async function moveDown(id: string) {
    let index = -1;
    for (let i = 0; i < categories.value.length; i++) {
      if (categories.value[i].id == id) {
        index = i;
        break;
      }
    }
    if (index != -1 && index < categories.value.length - 1) {
      const order0 = categories.value[index + 1].data.order;
      const order1 =
        index + 2 < categories.value.length
          ? categories.value[index + 2].data.order
          : categories.value[index + 1].data.order + 2;
      await updateCategory(id, { order: (order0 + order1) / 2 });
    }
  }

  async function exportCategories() {
    const q = query(
      collection(getFirestore(), 'categories'),
      where('uid', '==', uid.value),
      orderBy('order', 'asc')
    );
    const snapshot = (await getDocs(q)) as QuerySnapshot<CategoryDocumentData>;

    const res = [] as PortableCategory[];
    for (const doc of snapshot.docs) {
      res.push({
        id: doc.id,
        label: doc.data().label,
        color: doc.data().color,
      });
    }
    return res;
  }

  async function importCategories(cats: PortableCategory[]) {
    const batch = writeBatch(getFirestore());
    for (let i = 0; i < cats.length; i++) {
      const order = lastOrder.value + 1 + i;
      await addCategory(cats[i].label, cats[i].color, cats[i].id, order, batch);
    }
    await batch.commit();
  }

  console.log('Setup categoryStore end');

  return {
    addCategory,
    deleteCategory,
    updateCategory,
    moveUp,
    moveDown,
    exportCategories,
    importCategories,
  };
});
