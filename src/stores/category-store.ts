import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  updateDoc,
  where,
  QuerySnapshot,
  writeBatch,
} from 'firebase/firestore';
import { CategoryDocumentData, CategoryDoc } from 'src/types/documents';
import { PortableCategory } from 'src/types/portable';
import { useAuthStore } from 'src/stores/auth-store';

export const useCategoryStore = defineStore('catgories', () => {
  console.log('Setup categoryStore start');
  const authStore = useAuthStore();
  const { uid } = storeToRefs(authStore);

  const categories = ref([] as CategoryDoc[]);
  const idToCategory = computed(() => {
    return categories.value.reduce((res, item) => {
      res[item.id] = item.data;
      return res;
    }, {} as { [key: string]: CategoryDocumentData });
  });

  let unsubscribe = null as Unsubscribe | null;

  function onUpdateUid() {
    console.log('categoryStore::onUpdateUid() uid:', uid.value);
    if (uid.value) {
      startWatchCategories(uid.value);
    } else {
      stopWatchCatgories();
    }
  }

  function startWatchCategories(uid: string) {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    const q = query(
      collection(getFirestore(), 'categories'),
      where('uid', '==', uid),
      orderBy('order', 'asc')
    );
    unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          categories.value.splice(change.oldIndex, 1);
        } else {
          const newItem = {
            id: change.doc.id,
            data: change.doc.data() as CategoryDocumentData,
          };
          if (change.type === 'added') {
            categories.value.splice(change.newIndex, 0, newItem);
          } else if (change.type === 'modified') {
            if (change.newIndex !== change.oldIndex) {
              categories.value.splice(change.oldIndex, 1);
              categories.value.splice(change.newIndex, 0, newItem);
            } else {
              categories.value[change.newIndex] = newItem;
            }
          }
        }
      });
    });
  }

  function stopWatchCatgories() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    categories.value = [];
  }

  onUpdateUid();
  watch(uid, onUpdateUid);

  function docData(id: string) {
    return idToCategory.value[id];
  }

  async function addCategory(label: string, color: string) {
    const lastCategory = categories.value[categories.value.length - 1];
    const lastOrder = lastCategory ? lastCategory.data.order : 0;
    const data: CategoryDocumentData = {
      uid: uid.value,
      label: label,
      color: color,
      order: lastOrder + 1,
    };
    await addDoc(collection(getFirestore(), 'categories'), data);
  }

  async function deleteCategory(id: string) {
    await deleteDoc(doc(getFirestore(), 'categories', id));
  }

  async function updateCategory(id: string, change: object) {
    await updateDoc(doc(getFirestore(), 'categories', id), change);
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
      const newOrder = (order0 + order1) / 2;
      await updateDoc(doc(getFirestore(), 'categories', id), {
        order: newOrder,
      });
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
      const newOrder = (order0 + order1) / 2;
      await updateDoc(doc(getFirestore(), 'categories', id), {
        order: newOrder,
      });
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
    categories,
    idToCategory,
    docData,
    addCategory,
    deleteCategory,
    updateCategory,
    moveUp,
    moveDown,
    exportCategories,
    importCategories,
  };
});
