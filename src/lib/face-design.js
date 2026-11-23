export const FACE_AUTO = 'おまかせ';

export const FACE_PARTS = [
  { key: 'eyeSpacing', label: '目の間隔', promptLabel: 'Distance between the eyes', values: ['目と目の間が狭い', '目の横幅と同じくらいの間隔', '目と目の間が広い', '目と目の間がかなり広い'] },
  { key: 'faceOutline', label: '輪郭', promptLabel: 'Face outline', values: ['横幅のある丸顔', '縦に長い面長', '頬骨が張ったひし形', '幅広の四角顔', '卵形', '上が広い逆三角形'] },
  { key: 'jawShape', label: '顎・あご先', promptLabel: 'Jaw and chin', values: ['短く丸い顎', '角張った幅広の顎', '長く四角い顎先', '小さく尖った顎先', '浅い割れ顎', '後ろに引いた顎先'] },
  { key: 'browShape', label: '眉の形', promptLabel: 'Eyebrows', values: ['太い直線眉', '細いアーチ眉', '短くまばらな眉', '眉尻が下がった眉', '眉間が狭い濃眉', '眉間が広い薄眉'] },
  { key: 'noseShape', label: '鼻の形', promptLabel: 'Nose', values: ['幅広で丸い鼻先', '高い鼻筋と尖った鼻先', '低い鼻筋と広い小鼻', '下向きに曲がった鼻先', '小さく上向きの鼻先', '鼻筋の中央に段差がある'] },
  { key: 'philtrumLength', label: '鼻から上唇までの距離（人中）', promptLabel: 'Distance from nose base to upper lip (philtrum length)', values: ['鼻の下から上唇までが短い', '鼻の下から上唇までが標準的', '鼻の下から上唇までが長い', '鼻の下から上唇までがかなり長い'] },
  { key: 'mouthShape', label: '口・唇の形', promptLabel: 'Mouth and lips', values: ['横幅の広い薄い唇', '幅が狭く下唇が厚い口', '上下とも厚い唇', '小さく薄い唇', '上唇の山がはっきりした口', '口角が平らで長い口'] },
  { key: 'faceDetails', label: '顔の特徴・左右差', promptLabel: 'Distinctive facial details', values: ['鼻の上だけにそばかす', '左目の下に小さなほくろ', '片方の頬にえくぼ', '左眉だけ右眉より少し高い', '右眉に短い傷跡', '頬の高い位置に細かなしわ'] },
];

export const FACE_PRESETS = [
  { label: '丸顔・細目', data: { faceOutline: '横幅のある丸顔', jawShape: '短く丸い顎', eyeShape: '横長の小さな細目', browShape: '短くまばらな眉', noseShape: '幅広で丸い鼻先', mouthShape: '横幅の広い薄い唇' } },
  { label: '面長・太眉', data: { faceOutline: '縦に長い面長', jawShape: '長く四角い顎先', eyeShape: 'まぶたが重い奥目', browShape: '太い直線眉', noseShape: '高い鼻筋と尖った鼻先', mouthShape: '幅が狭く下唇が厚い口' } },
  { label: '四角い顎・幅広の鼻', data: { faceOutline: '幅広の四角顔', jawShape: '角張った幅広の顎', eyeShape: '大きめの丸目', eyeSpacing: '目と目の間が広い', browShape: '細いアーチ眉', noseShape: '低い鼻筋と広い小鼻', mouthShape: '上下とも厚い唇' } },
  { label: '頬骨が高い・下がり眉', data: { faceOutline: '頬骨が張ったひし形', jawShape: '小さく尖った顎先', eyeShape: '上まぶたが平らな一重', browShape: '眉尻が下がった眉', noseShape: '下向きに曲がった鼻先', mouthShape: '小さく薄い唇' } },
];

export const applyFacePreset = (preset, lockedFields) => Object.fromEntries(
  Object.entries({ faceType: FACE_AUTO, eyeSpacing: FACE_AUTO, philtrumLength: FACE_AUTO, ...preset.data })
    .filter(([key]) => !lockedFields[key]),
);

export const randomFace = (current, lockedFields, eyeOptions, random = Math.random) => {
  const fields = [
    ...FACE_PARTS.filter(({ key }) => key !== 'faceDetails'),
    { key: 'eyeShape', values: eyeOptions },
  ];
  const changes = {};
  for (const { key, values } of fields) {
    if (lockedFields[key]) continue;
    const choices = values.filter(value => value !== FACE_AUTO && value !== current[key]);
    if (choices.length) changes[key] = choices[Math.floor(random() * choices.length)];
  }
  if (Object.keys(changes).length && !lockedFields.faceType) changes.faceType = FACE_AUTO;
  return changes;
};

export const faceValue = (value) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text === FACE_AUTO ? '' : text;
};
