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
} from 'firebase/firestore';
import { CategoryChange, CategoryDocumentData } from 'src/types/documents';
import { PortableCategory } from 'src/types/portable';
import { useAuthStore } from 'src/stores/auth-store';
import { useCacheStore } from 'src/stores/cache-store';

export const useCategoryStore = defineStore('catgories', () => {
  console.log('Setup categoryStore start');
  const authStore = useAuthStore();
  const cacheStore = useCacheStore();
  const { uid } = storeToRefs(authStore);
  const { categories } = storeToRefs(cacheStore);

  async function addCategory(label: string, color: string) {
    const lastCategory = categories.value[categories.value.length - 1];
    const lastOrder = lastCategory ? lastCategory.data.order : 0;
    const data: CategoryDocumentData = {
      uid: uid.value,
      label: label,
      color: color,
      order: lastOrder + 1,
    };
    const batch = writeBatch(getFirestore());
    const docRef = doc(collection(getFirestore(), 'categories'));
    cacheStore.onCategoryAdded(batch, docRef.id, data);
    batch.set(docRef, data);
    await batch.commit();
  }

  async function deleteCategory(id: string) {
    const colRef = collection(getFirestore(), 'categories');
    const docRef = doc(colRef, id) as DocumentReference<CategoryDocumentData>;
    const batch = writeBatch(getFirestore());
    cacheStore.onCategoryDeleted(batch, docRef.id);
    batch.delete(docRef);
    await batch.commit();
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
      const data: CategoryDocumentData = {
        uid: uid.value,
        label: cats[i].label,
        color: cats[i].color,
        order: i + 1,
      };
      batch.set(doc(getFirestore(), 'categories', cats[i].id), data);
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
