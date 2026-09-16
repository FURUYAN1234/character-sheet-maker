const PROFILE_FIELDS = [
  ['name', 'Names'],
  ['catchphrase', 'Phrases'],
  ['dialogue', 'Dialogues'],
  ['likes', 'likes'],
  ['dislikes', 'dislikes'],
  ['nickname', 'nicknames'],
];

const genderKeyFor = (sex) => {
  if (sex === '男性') return 'male';
  if (sex === '女性') return 'female';
  return 'neutral';
};

const normalizeProfileText = (value) => String(value)
  .replace(/[\s「」『』“”"]/gu, '');

const chooseDifferent = (values, currentValue, random) => {
  const normalizedCurrentValue = normalizeProfileText(currentValue);
  const candidates = values.filter((value) => normalizeProfileText(value) !== normalizedCurrentValue);
  const pool = candidates.length > 0 ? candidates : values;
  return pool[Math.floor(random() * pool.length)];
};

const fallbackValuesFor = (backupData, genderKey, suffix) => {
  if (suffix === 'likes' || suffix === 'dislikes' || suffix === 'nicknames') {
    return backupData[suffix];
  }
  return backupData[`${genderKey}${suffix}`];
};

export const applyRandomProfileText = ({ current, generated, lockedFields, backupData, random = Math.random }) => {
  const result = { ...current };
  const genderKey = genderKeyFor(current.sex);

  PROFILE_FIELDS.forEach(([field, backupSuffix]) => {
    if (lockedFields[field]) return;

    const generatedValue = typeof generated?.[field] === 'string' ? generated[field].trim() : '';
    if (generatedValue && normalizeProfileText(generatedValue) !== normalizeProfileText(current[field])) {
      result[field] = generatedValue;
      return;
    }

    result[field] = chooseDifferent(
      fallbackValuesFor(backupData, genderKey, backupSuffix),
      current[field],
      random,
    );
  });

  return result;
};
