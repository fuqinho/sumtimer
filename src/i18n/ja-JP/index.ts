// This is just an example,
// so you can safely delete all default props below

export default {
  failed: '失敗しました',
  success: '成功しました',

  tabHome: 'ホーム',
  tabActivities: 'アクティビティ一覧',
  tabHistory: '履歴',
  tabSettings: '設定',

  category: 'カテゴリー',
  activity: 'アクティビティ',
  edit: '編集',
  delete: '削除',
  hours: '時間',
  total: '合計',

  allCategories: '全てのカテゴリー',
  addCategory: 'カテゴリーを追加',
  addActivity: 'アクティビティを追加',

  categoryName: 'カテゴリー名',
  activityName: 'アクティビティ名',

  createCategory: 'カテゴリーを新規作成',
  modifyCategory: 'カテゴリーを編集',
  createActivity: 'アクティビティを新規作成',
  modifyActivity: 'アクティビティを編集',

  cancelBtn: 'キャンセル',
  closeBtn: '閉じる',
  deleteBtn: '削除',
  saveBtn: '保存',
  addBtn: '追加',
  updateBtn: '更新',
  deleteRecordsBtn: '記録を削除する',

  memo: 'メモ（やったこと等）',

  // Settings
  stPreferences: 'ユーザー設定',
  stUiLanguage: 'UI言語',

  stFocusMode: 'フォーカスモード',
  stBlockListUrl: 'ブロックするURL',
  stBlockListPageTitle: 'ブロックするページタイトル',
  stUpdateExtensionSettings: 'Chrome拡張機能に設定を保存する',
  stIsRequired: 'が必要です。',

  stExportImport: 'エクスポート / インポート',
  stExportJson: 'JSONファイルをエクスポート',
  stExportJsonDesc:
    '保存されている全ての記録をJSON形式でファイルにエクスポートします。',
  stImportJson: 'JSONファイルのインポート',
  stImportJsonDesc: '上記の機能で出力されたJSONファイルをインポートします。',
  stExportCsvTogglFree: 'CSVファイルのエクスポート(Togglフリープラン向け)',
  stExportCsvTogglFreeDesc:
    'Togglと互換性のある形式でCSVファイルをエクスポートします。Sumtimer独自で互換性の無いデータは出力されません。',
  stExportCsvTogglPaid: 'CSVファイルのエクスポート(Toggl有料プラン向け)',
  stExportCsvTogglPaidDesc:
    'Togglと互換性のある形式でCSVファイルをエクスポートします。Sumtimer独自で互換性の無いデータは出力されません。各アクティビティはTogglタスクとして出力されます。',
  stExportBtn: 'エクスポート',
  stImportBtn: 'インポート',

  stDeleteAccount: 'アカウント削除',
  stDeleteAccountDesc:
    'あなたのアカウントをSumtimerから削除します。アカウント削除に伴い、保存されている記録・アクティビティ・カテゴリ等のデータは永久に消去されます。',
  stDeleteAccountBtn: 'アカウントを削除する',
  stDeleteAccountConfirm:
    'アカウントと全てのデータを削除します。確認のため、アカウントのEmailアドレスを入力してください。',

  // Dialog/Notification messages,
  msgCategoryNameRequired: 'カテゴリー名は必須です',
  msgActivityNameRequired: 'アクティビティ名は必須です',
  msgConfirmActivityRecords:
    'このアクティビティに関連付いている{num}個の記録も削除してよいですか？',

  // Preset categories / activities
  catWork: '仕事',
  catStudy: '学習',
  catExercise: '運動',
  catEntertainment: '娯楽',
  catRest: '休養',
  catOthers: 'その他',

  actGeneralWork: '仕事（一般）',
  actGeneralStudy: '学習（一般）',
  actWalking: 'ウォーキング',
  actRunning: 'ランニング',
  actVideoGame: 'ゲーム',
  actSleep: '睡眠',
  actShopping: '買い物',
  actHouseCleaning: '掃除',

  ldAppDesc:
    'Sumtimerは日々の時間の使い方を計測して改善するためのシンプルな活動時間記録アプリです',
  ldHowToUse: '使い方',
  ldOrganizeActs: '1. アクティビティを登録する',
  ldOrganizeActsDesc:
    '記録対象にするアクティビティを登録します。全てのアクティビティは運動や勉強といったカテゴリーのいずれかに含めます。',
  ldRecordActs: '2. アクティビティを記録する',
  ldRecordActsDesc:
    'アクティビティのプレイボタンを押すことで活動の記録を始め、停止ボタンで完了します。',
  ldReviewRecs: '3. 記録を振り返る',
  ldReviewRecsDesc:
    '週単位で、各アクティビティや各カテゴリーにかけた時間や目標の達成度を振り返ることができます。',
  ldAdditionalFeatures: 'その他の機能',
  ldFocusMode: 'フォーカスモード',
  ldFocusModeDesc:
    'SumtimerのChrome extensionを使うことで、例えば"勉強"カテゴリーに属するアクティビティをしてる間はTwitterやYoutubeをブロックすることができます。',
  ldWeeklyTargets: '週間目標の追跡',
  ldWeeklyTargetsDesc:
    'カテゴリー毎に1週間での目標活動時間を設定し、その進捗を確認することができます。',
};
