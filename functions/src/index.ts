import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

const presetCategories = [
  {
    id: 'work',
    label: 'Work',
    color: '#ef5350',
  },
  {
    id: 'learning',
    label: 'Learning',
    color: '#29b6f6',
  },
  {
    id: 'exercise',
    label: 'Exercise',
    color: '#9ccc65',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    color: '#ffa726',
  },
  {
    id: 'rest',
    label: 'Rest',
    color: '#7e57c2',
  },
  {
    id: 'chore',
    label: 'Chore',
    color: '#8d6e63',
  },
  {
    id: 'others',
    label: 'Others',
    color: '#bdbdbd',
  },
];

const presetUserData = {
  categories: presetCategories,
};

const presetActivities = [
  {
    cid: 'work',
    label: 'General work',
  },
  {
    cid: 'learning',
    label: 'General learning',
  },
  {
    cid: 'exercise',
    label: 'Walking',
  },
  {
    cid: 'entertainment',
    label: 'Video game',
  },
  {
    cid: 'rest',
    label: 'Sleep',
  },
  {
    cid: 'chore',
    label: 'Room cleaning',
  },
  {
    cid: 'chore',
    label: 'Errands',
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
    const userDocRef = admin.firestore().collection('users').doc(user.uid);
    await userDocRef.create(presetUserData);

    for (const activity of presetActivities) {
      const docData = {
        uid: user.uid,
        label: activity.label,
        cid: activity.cid,
        updated: admin.firestore.FieldValue.serverTimestamp(),
      };
      await admin.firestore().collection('activities').add(docData);
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

    const activities = await admin
      .firestore()
      .collection('activities')
      .where('uid', '==', user.uid)
      .get();
    for (const doc of activities.docs) {
      await doc.ref.delete();
    }

    const records = await admin
      .firestore()
      .collection('records')
      .where('uid', '==', user.uid)
      .get();
    for (const doc of records.docs) {
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
