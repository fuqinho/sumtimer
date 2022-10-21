import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

const presetCategories = [
  {
    label: 'Work',
    color: '#ef5350',
    activities: [{ label: 'General work' }],
  },
  {
    label: 'Learning',
    color: '#29b6f6',
    activities: [{ label: 'General learning' }],
  },
  {
    label: 'Exercise',
    color: '#9ccc65',
    activities: [{ label: 'Walking' }, { label: 'Running' }],
  },
  {
    label: 'Entertainment',
    color: '#ffa726',
    activities: [{ label: 'Video game' }],
  },
  {
    label: 'Rest',
    color: '#7e57c2',
    activities: [{ label: 'Sleep' }],
  },
  {
    label: 'Chore',
    color: '#8d6e63',
    activities: [{ label: 'House cleaning' }, { label: 'Errands' }],
  },
  {
    label: 'Others',
    color: '#bdbdbd',
    activities: [{ label: 'Any other activity' }],
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
    for (const category of presetCategories) {
      const categoryDoc = {
        uid: user.uid,
        label: category.label,
        color: category.color,
      };
      const newCategoryRef = categoryCollection.doc();
      await newCategoryRef.set(categoryDoc);

      for (const activity of category.activities) {
        const activityDoc = {
          uid: user.uid,
          label: activity.label,
          cid: newCategoryRef.id,
          updated: admin.firestore.FieldValue.serverTimestamp(),
        };
        await activityCollection.add(activityDoc);
      }
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
    await admin.firestore().collection('users').doc(user.uid).delete();

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
