export const CHARACTER_IDENTITY_FIELDS = [
  'name', 'sex', 'species', 'ageGroup', 'height', 'weight', 'bodyBuild', 'muscleType', 'ethnicity',
  'personality', 'likes', 'dislikes', 'catchphrase', 'dialogue', 'faceType', 'eyeShape', 'eyeColor',
  'makeup', 'hairStyle', 'hairColor', 'facialHair', 'glassesStyle', 'headAccessory', 'earAccessory',
  'neckAccessory', 'facePiercing', 'bodyArt', 'subhumanPart', 'skinType', 'nickname', 'organization',
  'voiceType', 'speechStyle',
];

export const applyThemePreset = (current, themeData, lockedFields) => Object.fromEntries(
  Object.entries(current).map(([key, value]) => [
    key,
    !lockedFields[key] && themeData[key] !== undefined ? themeData[key] : value,
  ]),
);

export const lockCharacterIdentity = (lockedFields) => {
  const newlyLocked = Object.fromEntries(
    CHARACTER_IDENTITY_FIELDS.filter((field) => !lockedFields[field]).map((field) => [field, true]),
  );
  return {
    lockedFields: { ...lockedFields, ...newlyLocked },
    newlyLocked,
  };
};

export const releaseCharacterIdentity = (lockedFields, newlyLocked) => ({
  ...lockedFields,
  ...Object.fromEntries(Object.keys(newlyLocked || {}).map((field) => [field, false])),
});
