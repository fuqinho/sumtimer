import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { Timestamp } from 'firebase-admin/firestore';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

const presetCategories = [
  {
    label: 'Work',
    color: '#ef5350',
    order: 1,
    activities: [{ label: 'General work' }],
  },
  {
    label: 'Learning',
    color: '#29b6f6',
    order: 2,
    activities: [{ label: 'General learning' }],
  },
  {
    label: 'Exercise',
    color: '#9ccc65',
    order: 3,
    activities: [{ label: 'Walking' }, { label: 'Running' }],
  },
  {
    label: 'Entertainment',
    color: '#ffa726',
    order: 4,
    activities: [{ label: 'Video game' }],
  },
  {
    label: 'Rest',
    color: '#7e57c2',
    order: 5,
    activities: [{ label: 'Sleep' }],
  },
  {
    label: 'Chore',
    color: '#8d6e63',
    order: 6,
    activities: [{ label: 'House cleaning' }, { label: 'Errands' }],
  },
];

async function onCreateUser(user: UserRecord) {
  try {
    functions.logger.log(
      'Adding preset for a new user. uid:' +
        user.uid +
        ' name:' +
        user.displayName
    );
    const userDoc = {
      displayName: user.displayName || '',
      email: user.email || '',
    };
    const userDocRef = admin.firestore().collection('users').doc(user.uid);
    await userDocRef.create(userDoc);

    const categoryCollection = admin.firestore().collection('categories');
    const activityCollection = admin.firestore().collection('activities');
    const cacheDoc = {
      categories: {} as {
        [key: string]: {
          label: string;
          color: string;
          order: number;
          duration: number;
        };
      },
      activities: {} as {
        [key: string]: {
          label: string;
          cid: string;
          duration: number;
          count: number;
          updated: Timestamp;
        };
      },
    };
    for (let i = presetCategories.length - 1; i >= 0; i--) {
      const category = presetCategories[i];
      const categoryDoc = {
        uid: user.uid,
        label: category.label,
        color: category.color,
        order: category.order,
      };
      const newCategoryRef = categoryCollection.doc();
      await newCategoryRef.set(categoryDoc);

      cacheDoc.categories[newCategoryRef.id] = {
        label: categoryDoc.label,
        color: categoryDoc.color,
        order: categoryDoc.order,
        duration: 0,
      };

      for (const activity of category.activities) {
        const activityDoc = {
          uid: user.uid,
          label: activity.label,
          cid: newCategoryRef.id,
          updated: Timestamp.now(),
        };
        const newActivityRef = activityCollection.doc();
        await newActivityRef.set(activityDoc);

        cacheDoc.activities[newActivityRef.id] = {
          label: activityDoc.label,
          cid: activityDoc.cid,
          duration: 0,
          count: 0,
          updated: activityDoc.updated,
        };
      }

      const cacheDocRef = admin.firestore().collection('cache').doc(user.uid);
      await cacheDocRef.set(cacheDoc);
    }
    functions.logger.log('Successfully added presert for ' + user.uid);
  } catch (e) {
    functions.logger.error('Failed to write preset data for a new user.', e);
  }
}

async function onDeleteUser(user: UserRecord) {
  try {
    functions.logger.log(
      'Deleting data for a leaving user. uid:' +
        user.uid +
        ' name:' +
        user.displayName
    );

    const records = await admin
      .firestore()
      .collection('records')
      .where('uid', '==', user.uid)
      .get();
    for (const doc of records.docs) {
      await doc.ref.delete();
    }

    const activities = await admin
      .firestore()
      .collection('activities')
      .where('uid', '==', user.uid)
      .get();
    for (const doc of activities.docs) {
      await doc.ref.delete();
    }

    const categories = await admin
      .firestore()
      .collection('categories')
      .where('uid', '==', user.uid)
      .get();
    for (const doc of categories.docs) {
      await doc.ref.delete();
    }

    await admin.firestore().collection('cache').doc(user.uid).delete();
    await admin.firestore().collection('users').doc(user.uid).delete();

    functions.logger.log('Successfully deleted data for ' + user.uid);
  } catch (e) {
    functions.logger.error('Failed to delete data for uid: ' + user.uid);
  }
}

const region = 'asia-northeast2'; // Osaka as default in dev.
export const addPresetForNewUser = functions
  .region(region)
  .auth.user()
  .onCreate(onCreateUser);
export const deleteDetaForUser = functions
  .region(region)
  .auth.user()
  .onDelete(onDeleteUser);
export const createCustomToken = functions
  .region(region)
  .https.onCall((data, context) => {
    if (!context.auth) return '';
    return admin.auth().createCustomToken(context.auth.uid);
  });
