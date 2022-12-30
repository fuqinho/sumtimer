import { ref, watch } from 'vue';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAuth, onAuthStateChanged, signInWithCustomToken, indexedDBLocalPersistence, Auth, User, signOut } from 'firebase/auth';
import { initializeFirestore, onSnapshot, getFirestore, doc, Firestore, DocumentSnapshot, Unsubscribe } from 'firebase/firestore';

const isInFocusMode = ref(false);
const ongoingCategory = ref('');

let app: FirebaseApp|null = null;
let auth: Auth|null = null;
let db: Firestore|null = null;

let urlBlockREs: RegExp[] = [];
let titleBlockREs: RegExp[] = [];
let focusCategories = [] as string[];
let redirectUrl = '';
let unsubscribe = null as Unsubscribe | null;

watch(isInFocusMode, async (newFocusMode) => {
  console.log('isInFocusMode is changed: ', newFocusMode);
  if (newFocusMode) { 
    const activeTab = await getCurrentTab();
    const tabs = await chrome.tabs.query({ active: true });
    for (const tab of tabs) {
      await checkTab(tab); 
    }
  }
});

watch(ongoingCategory, async (cid) => {
  console.log('ongoingCategory is changed to', cid);
  isInFocusMode.value = !!focusCategories.find(category => category === cid);
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function checkTab(tab: chrome.tabs.Tab) {
  if (!isInFocusMode.value) return;

  if (tab.url) {
    for (const re of urlBlockREs) {
      if(re.test(tab.url)) {
        setTimeout(() => {
          chrome.tabs.update(tab.id || 0, {
            url: redirectUrl,
          });
        }, 500);
        return;
      }
    }
  }
  if (tab.title) {
    for (const re of titleBlockREs) {
      if(re.test(tab.title)) {
        setTimeout(() => {
          chrome.tabs.update(tab.id || 0, {
            url: redirectUrl,
          });
        }, 500);
        return;
      }
    }
  }
}

chrome.tabs.onActivated.addListener(async () => {
  const activeTab = await getCurrentTab();
  console.log('chrome.tabs.onActivated url:', activeTab.url);
  await checkTab(activeTab);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.title) {
    console.log('chrome.tabs.onUpdated changeInfo:', changeInfo); 
    await checkTab(tab);
  }
});
 
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('onMessageExternal message:', message);
  if (message.type === 'version') {
    sendResponse('1.0');
    return true;
  }
  if (message.type === 'setConfiguration') {
    chrome.storage.local.set({firebaseConfig: message.firebaseConfig, redirectUrl: message.redirectUrl}).then(init);
    sendResponse(true);
    return true;
  }
  if (message.type === 'signIn') {
    if (auth) {
      signInWithCustomToken(auth, message.customToken);
      sendResponse(true);
    } else {
      sendResponse(false);
    }
    return true;
  }
  if (message.type === 'signOut') {
    console.log('signOut is called. auth:', auth);
    if (auth) {
      signOut(auth);
      sendResponse(true);
    } else {
      sendResponse(false);
    }
    return true;
  }
  if (message.type === 'setFocusModeEnabled') {
    chrome.storage.local.set({enabled: message.enabled}).then(() => {
      sendResponse(true);
    });
    return true;
  }
  if (message.type === 'isFocusModeEnabled') {
    chrome.storage.local.get(['enabled']).then((result) => {
      if (!result.enabled) {
        sendResponse(false);
      } else {
        sendResponse(result.enabled);
      }
    });
    return true;
  }
  if (message.type === 'setUrlBlockPatterns') {
    chrome.storage.local.set({urlBlockPatterns: message.patterns});
    setUrlBlockPatterns(message.patterns);
    sendResponse(true);
    return true;
  }
  if (message.type === 'setTitleBlockPatterns') {
    chrome.storage.local.set({titleBlockPatterns: message.patterns});
    setTitleBlockPatterns(message.patterns);
    sendResponse(true);
    return true;
  }
  if (message.type === 'getUrlBlockPatterns') {
    chrome.storage.local.get(['urlBlockPatterns']).then((result) => {
      if (!result.urlBlockPatterns) {
        sendResponse([]);
      } else {
        sendResponse(result.urlBlockPatterns);
      }
    })
    return true;
  }
  if (message.type === 'getTitleBlockPatterns') {
    chrome.storage.local.get(['titleBlockPatterns']).then((result) => {
      if (!result.titleBlockPatterns) {
        sendResponse([]);
      } else {
        sendResponse(result.titleBlockPatterns);
      }
    })
    return true;
  }
  if (message.type === 'setFocusCategories') {
    chrome.storage.local.set({focusCategories: message.ids}).then(() => {
      focusCategories = message.ids;
      sendResponse(true);
    });
    return true;
  }
  if (message.type === 'getFocusCategories') {
    chrome.storage.local.get(['focusCategories']).then((result) => {
      if (!result.focusCategories) {
        sendResponse([]);
      } else {
        sendResponse(result.focusCategories);
      }
    });
    return true;
  }
  return false;
});

function setUrlBlockPatterns(patterns: Array<string>) {
  urlBlockREs = patterns.map(v => new RegExp(v));
}

function setTitleBlockPatterns(patterns: string[]) {
  titleBlockREs = patterns.map(v => new RegExp(v));
}

function onAuthorizedUserChanged(user: User | null) {
  console.log('onAuthStateChanged. ', user); 
  if (user) {
    if (!unsubscribe) {
      unsubscribe = onSnapshot(doc(getFirestore(), 'ongoings', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          ongoingCategory.value = snapshot.data().cid || '';
        } else {
          ongoingCategory.value = '';
        }
      });
    };
  } else {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
      ongoingCategory.value = '';
    }
  }
}

function init() {
  console.log('init...');
  chrome.storage.local.get(['firebaseConfig', 'redirectUrl', 'urlBlockPatterns', 'titleBlockPatterns', 'focusCategories']).then((result) => {
    if (result.redirectUrl) {
      redirectUrl = result.redirectUrl;
    }
    if (result.urlBlockPatterns) {
      setUrlBlockPatterns(result.urlBlockPatterns);
    }
    if (result.titleBlockPatterns) {
      setTitleBlockPatterns(result.titleBlockPatterns);
    }
    if (result.firebaseConfig) {
      console.log('initializing firebase app. config: ', result.firebaseConfig);
      app = initializeApp(result.firebaseConfig);
      auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
      db = initializeFirestore(app, {});
      onAuthStateChanged(auth, onAuthorizedUserChanged);
    } else {
      console.warn('failed to read firebase config from storage.');
    }
    if (result.focusCategories) {
      focusCategories = result.focusCategories;
    }
  });
}

init();