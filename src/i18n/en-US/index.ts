// This is just an example,
// so you can safely delete all default props below

export default {
  failed: 'Action failed',
  success: 'Action was successful',

  tabHome: 'Home',
  tabActivities: 'Activities',
  tabHistory: 'History',
  tabSettings: 'Settings',

  category: 'Category',
  activity: 'Activity',
  edit: 'Edit',
  delete: 'Delete',
  hours: 'Hours',
  total: 'Total',

  allCategories: 'All categories',
  addCategory: 'Add category',
  addActivity: 'Add activity',

  categoryName: 'Category name',
  activityName: 'Activity name',

  createCategory: 'Create category',
  modifyCategory: 'Edit category',
  createActivity: 'Create activity',
  modifyActivity: 'Edit activity',

  cancelBtn: 'Cancel',
  closeBtn: 'Close',
  deleteBtn: 'Delete',
  saveBtn: 'Save',
  addBtn: 'Add',
  updateBtn: 'Update',
  deleteRecordsBtn: 'Delete records',

  memo: "Memo (What's done, etc...)",

  // Settings
  stPreferences: 'Preferences',
  stUiLanguage: 'UI language',

  stFocusMode: 'Focus mode',
  stBlockListUrl: 'Block list (URLs)',
  stBlockListPageTitle: 'Block list (Page titles)',
  stUpdateExtensionSettings: 'Update extension settings',
  stIsRequired: ' is required.',

  stExportImport: 'Export / Import',
  stExportJson: 'Export JSON file',
  stExportJsonDesc: 'Export all stored data as JSON file.',
  stImportJson: 'Import JSON file',
  stImportJsonDesc:
    'Import data from a JSON file, which should be exported by the above button.',
  stExportCsvTogglFree: 'Export CSV file (for Toggle free plan)',
  stExportCsvTogglFreeDesc:
    'Export records as Toggl-compatible CSV data. Some imcompatible data can be missing.',
  stExportCsvTogglPaid: 'Export CSV file (for Toggle paid plan)',
  stExportCsvTogglPaidDesc:
    'Export records as Toggl-compatible CSV data. Some imcompatible data can be missing. Sumtimer activities will be exported as Toggle tasks, which requires paid paln.',
  stExportBtn: 'Export',
  stImportBtn: 'Import',

  stDeleteAccount: 'Delete account',
  stDeleteAccountDesc:
    'Delete your account from Sumtimer. It also deletes all stored data such as records, activities, and categories permanently.',
  stDeleteAccountBtn: 'Delete account',

  // Dialog/Notification messages,
  msgCategoryNameRequired: 'Category name is required',
  msgActivityNameRequired: 'Activity name is required',
  msgConfirmActivityRecords:
    'Are you OK to delete {num} records about this activity?',

  // Preset categories / activities
  catWork: 'Work',
  catStudy: 'Study',
  catExercise: 'Exercise',
  catEntertainment: 'Entertainment',
  catRest: 'Rest',
  catOthers: 'Others',

  actGeneralWork: 'General work',
  actGeneralStudy: 'General study',
  actWalking: 'Walking',
  actRunning: 'Running',
  actVideoGame: 'Video game',
  actSleep: 'Sleep',
  actShopping: 'Shopping',
  actHouseCleaning: 'House cleaning',

  ldAppDesc:
    'Sumtimer is a simple time tracker to measure and improve your personal time usage.',
  ldHowToUse: 'How to use',
  ldOrganizeActs: '1. Register activities',
  ldOrganizeActsDesc:
    'Register the activities to be recorded. All activities should be included in one of the categories such as Exercise or Study.',
  ldRecordActs: '2. Record activity times',
  ldRecordActsDesc:
    'Pressing the Play button on an activity starts the recording of the activity and the Stop button completes it.',
  ldReviewRecs: '3. Review records',
  ldReviewRecsDesc:
    'On a weekly basis, you can review the amount of time you spent on each activity and each category, as well as the progress of each weekly target.',
  ldAdditionalFeatures: 'Additional Features',
  ldFocusMode: 'Focus mode',
  ldFocusModeDesc:
    'Using Sumtimer\'s Chrome extension, you can, for example, block Twitter and Youtube while doing activities that belong to the "Study" category.',
  ldWeeklyTargets: 'Weekly targets',
  ldWeeklyTargetsDesc:
    'You can set a target activity time per week for each category and monitor its progress.',
};
