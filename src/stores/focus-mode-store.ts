/// <reference types="chrome"/>
import { defineStore } from 'pinia';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

export const useFocusModeStore = defineStore('focus-mode', () => {
  const extensionId = import.meta.env.VITE_SUMTIMER_EXTENSION_ID;
  const funcRegion = 'asia-northeast2';

  const functions = getFunctions(getApp(), funcRegion);
  const createCustomToken = httpsCallable(functions, 'createCustomToken');

  function sendMessage(message: any) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(extensionId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  async function getExtensionVersion(): Promise<string> {
    if (!chrome.runtime) return '';

    const version = await sendMessage({ type: 'version' });
    if (typeof version === 'string') return version;
    return '';
  }

  async function hasValidExtension(): Promise<boolean> {
    const version = await getExtensionVersion();
    return version === '1.0';
  }

  async function getConfiguration() {
    console.log('hoge');
  }

  async function setConfiguration(): Promise<boolean> {
    const message = {
      type: 'setConfiguration',
      firebaseConfig: {
        apiKey: import.meta.env.VITE_SUMTIMER_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_SUMTIMER_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_SUMTIMER_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_SUMTIMER_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env
          .VITE_SUMTIMER_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_SUMTIMER_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_SUMTIMER_FIREBASE_MEASUREMENT_ID,
      },
      redirectUrl: location.origin,
    };
    const result = await sendMessage(message);
    console.log('result of setFirebaseConfig: ', result);
    if (typeof result === 'boolean') return result;
    return false;
  }

  async function signIn() {
    const token = await createCustomToken();
    const result = await sendMessage({
      type: 'signIn',
      customToken: token.data,
    });
    if (typeof result === 'boolean' && result) {
      console.log('signin succeeded.');
      return true;
    } else {
      console.log('signin failed.');
      return false;
    }
  }

  async function signOut() {
    const result = await sendMessage({ type: 'signOut' });
    if (typeof result === 'boolean' && result) {
      console.log('signout succeeded.');
      return true;
    } else {
      console.error('signout failed.');
      return false;
    }
  }

  async function setUrlBlockPatterns(patterns: string[]) {
    const result = await sendMessage({
      type: 'setUrlBlockPatterns',
      patterns: patterns,
    });
    if (typeof result !== 'boolean' && !result) {
      console.warn('setUrlBlockPatterns failed.');
      return false;
    }
    return true;
  }

  async function setTitleBlockPatterns(patterns: string[]) {
    const result = await sendMessage({
      type: 'setTitleBlockPatterns',
      patterns: patterns,
    });
    if (typeof result !== 'boolean' || !result) {
      console.warn('setTitleBlockPatterns failed.');
      return false;
    }
    return true;
  }

  function isArrayOfStrings(value: unknown): value is string[] {
    return (
      Array.isArray(value) && value.every((item) => typeof item === 'string')
    );
  }

  async function getUrlBlockPatterns(): Promise<string[]> {
    const result = await sendMessage({ type: 'getUrlBlockPatterns' });
    if (result === undefined || !isArrayOfStrings(result)) {
      console.warn('getUrlBlockPatterns failed.');
      return [];
    }
    return result;
  }

  async function getTitleBlockPatterns(): Promise<string[]> {
    const result = await sendMessage({ type: 'getTitleBlockPatterns' });
    if (result === undefined || !isArrayOfStrings(result)) {
      console.warn('getTitleBlockPatterns failed.');
      return [];
    }
    return result;
  }

  async function setFocusCategories(categories: string[]) {
    const result = await sendMessage({
      type: 'setFocusCategories',
      ids: categories,
    });
    if (typeof result !== 'boolean' || !result) {
      console.warn('setFocusCategories failed.');
      return false;
    }
    return true;
  }

  async function getFocusCategories() {
    const result = await sendMessage({ type: 'getFocusCategories' });
    if (result === undefined || !isArrayOfStrings(result)) {
      console.warn('getFocusCategories failed.');
      return [];
    }
    return result;
  }

  async function isEnabled() {
    const result = await sendMessage({ type: 'isFocusModeEnabled' });
    return !!result;
  }

  async function setEnabled(enabled: boolean) {
    const result = await sendMessage({
      type: 'setFocusModeEnabled',
      enabled: enabled,
    });
    return !!result;
  }

  return {
    getExtensionVersion,
    hasValidExtension,
    getConfiguration,
    setConfiguration,
    signIn,
    signOut,
    setUrlBlockPatterns,
    getUrlBlockPatterns,
    setTitleBlockPatterns,
    getTitleBlockPatterns,
    setFocusCategories,
    getFocusCategories,
    isEnabled,
    setEnabled,
  };
});
