export interface VocabItem {
  word: string;
  phonetic: string;
  translation: string;
  emoji: string;
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  character: 'dino' | 'bear';
  text: string;
  translation: string;
  phonetic: string;
}

export interface LessonData {
  id: number;
  title: string;
  englishTitle: string;
  emoji: string;
  description: string;
  color: string;
  borderColor: string;
  vocab: VocabItem[];
  dialogue: DialogueLine[];
  tip: string;
}

export const LESSONS: LessonData[] = [
  {
    id: 1,
    title: 'Hello! ทักทายเพื่อนๆ',
    englishTitle: 'Hello Friends, Welcome to Trang',
    emoji: '👋',
    description: 'ทักทายเพื่อนๆ ยินดีต้อนรับสู่จังหวัดตรัง และแนะนำตัวกันจ้า',
    color: 'emerald',
    borderColor: 'border-emerald-300',
    vocab: [
      { word: 'hello', phonetic: 'เฮลโล', translation: 'สวัสดี', emoji: '👋' },
      { word: 'friend', phonetic: 'เฟรนด์', translation: 'เพื่อน', emoji: '👦' },
      { word: 'name', phonetic: 'เนม', translation: 'ชื่อ', emoji: '📛' },
      { word: 'boy', phonetic: 'บอย', translation: 'เด็กผู้ชาย', emoji: '👦' },
      { word: 'girl', phonetic: 'เกิร์ล', translation: 'เด็กผู้หญิง', emoji: '👧' },
      { word: 'city', phonetic: 'ซิตี้', translation: 'เมือง', emoji: '🏙️' },
      { word: 'Trang', phonetic: 'ตรัง', translation: 'จังหวัดตรัง', emoji: '🏛️' },
      { word: 'Thailand', phonetic: 'ไทยแลนด์', translation: 'ประเทศไทย', emoji: '🇹🇭' },
      { word: 'from', phonetic: 'ฟรอม', translation: 'มาจาก', emoji: '📍' },
      { word: 'live', phonetic: 'ลิฟ', translation: 'อาศัยอยู่', emoji: '🏠' }
    ],
    dialogue: [
      { speaker: 'A', character: 'dino', text: 'Hello! My name is Dino. Welcome to Trang.', phonetic: 'เฮลโล! มาย เนม อีส ไดโน. เวลคัม ทู ตรัง.', translation: 'สวัสดีครับ! ผมชื่อไดโน ยินดีต้อนรับสู่จังหวัดตรังครับ' },
      { speaker: 'B', character: 'bear', text: 'Hi Dino! I am from Thailand. I live in Trang.', phonetic: 'ไฮ ไดโน! ไอ แอม ฟรอม ไทยแลนด์. ไอ ลิฟ อิน ตรัง.', translation: 'สวัสดีไดโน! ฉันมาจากประเทศไทย ฉันอาศัยอยู่ในตรังค่ะ' },
      { speaker: 'A', character: 'dino', text: 'Hello friend! Nice to meet you.', phonetic: 'เฮลโล เฟรนด์! ไนซ์ ทู มีท ยู.', translation: 'สวัสดีเพื่อน! ยินดีที่ได้รู้จักครับ' }
    ],
    tip: 'พูดทักทายเพื่อนใหม่ด้วยรอยยิ้มหวานๆ และสบตาอย่างเป็นกันเองนะคนเก่ง!'
  },
  {
    id: 2,
    title: 'โรงเรียนและอาหารแสนอร่อย',
    englishTitle: 'My Classroom & Food at School',
    emoji: '🏫',
    description: 'เรียนรู้คำศัพท์โรงเรียน ห้องเรียน และอาหารสุดอร่อยเมืองตรังกันจ้า',
    color: 'orange',
    borderColor: 'border-orange-300',
    vocab: [
      { word: 'school', phonetic: 'สคูล', translation: 'โรงเรียน', emoji: '🏫' },
      { word: 'classroom', phonetic: 'คลาสรูม', translation: 'ห้องเรียน', emoji: '📖' },
      { word: 'teacher', phonetic: 'ทีเชอร์', translation: 'ครู', emoji: '👩‍🏫' },
      { word: 'student', phonetic: 'สตูเดนท์', translation: 'นักเรียน', emoji: '🎒' },
      { word: 'book', phonetic: 'บุ๊ก', translation: 'หนังสือ', emoji: '📚' },
      { word: 'pencil', phonetic: 'เพนซิล', translation: 'ดินสอ', emoji: '✏️' },
      { word: 'lunch', phonetic: 'ลันช์', translation: 'อาหารกลางวัน', emoji: '🍱' },
      { word: 'food', phonetic: 'ฟูด', translation: 'อาหาร', emoji: '🍲' },
      { word: 'roasted pork', phonetic: 'โรสเต็ด พอร์ก', translation: 'หมูย่างตรัง', emoji: '🥓' },
      { word: 'cake', phonetic: 'เค้ก', translation: 'เค้กเมืองตรัง', emoji: '🍰' }
    ],
    dialogue: [
      { speaker: 'A', character: 'bear', text: 'This is my classroom in the school.', phonetic: 'ดิส อีส มาย คลาสรูม อิน เดอะ สคูล.', translation: 'นี่คือห้องเรียนของฉันในโรงเรียนค่ะ' },
      { speaker: 'B', character: 'dino', text: 'I have a book and a pencil. I love food!', phonetic: 'ไอ แฮฟ อะ บุ๊ก แอนด์ อะ เพนซิล. ไอ ลัฟ ฟูด!', translation: 'ผมมีหนังสือและดินสอครับ ผมรักอาหารมากเลย!' },
      { speaker: 'A', character: 'bear', text: "Let's eat roasted pork and cake for lunch.", phonetic: 'เล็ทส์ อีท โรสเต็ด พอร์ก แอนด์ เค้ก ฟอร์ ลันช์.', translation: 'มากินหมูย่างและเค้กเป็นอาหารกลางวันกันเถอะ' }
    ],
    tip: 'ออกเสียงคำว่า "school" และ "pencil" ให้ชัดเจนและถูกต้องนะคนเก่ง!'
  },
  {
    id: 3,
    title: 'ครอบครัวและบ้านเกิดแสนสวย',
    englishTitle: 'Family Members, My Hometown & Trang Landmarks',
    emoji: '👨‍👩‍👧‍👦',
    description: 'พูดแนะนำครอบครัว บ้านเกิด และสถานที่ท่องเที่ยวสำคัญในจังหวัดตรัง',
    color: 'sky',
    borderColor: 'border-sky-300',
    vocab: [
      { word: 'family', phonetic: 'แฟมิลี', translation: 'ครอบครัว', emoji: '👨‍👩‍👧‍👦' },
      { word: 'father', phonetic: 'ฟาเธอร์', translation: 'พ่อ', emoji: '👨' },
      { word: 'mother', phonetic: 'มัทเธอร์', translation: 'แม่', emoji: '👩' },
      { word: 'brother', phonetic: 'บราเธอร์', translation: 'พี่ชาย/น้องชาย', emoji: '👦' },
      { word: 'sister', phonetic: 'ซิสเทอร์', translation: 'พี่สาว/น้องสาว', emoji: '👧' },
      { word: 'hometown', phonetic: 'โฮมทาวน์', translation: 'บ้านเกิด', emoji: '🏡' },
      { word: 'clock tower', phonetic: 'คล็อก ทาวเวอร์', translation: 'หอนาฬิกา', emoji: '⏰' },
      { word: 'island', phonetic: 'ไอแลนด์', translation: 'เกาะ', emoji: '🏝️' },
      { word: 'cave', phonetic: 'เคฟ', translation: 'ถ้ำ', emoji: '🧗' },
      { word: 'waterfall', phonetic: 'วอเทอร์ฟอล', translation: 'น้ำตก', emoji: '🌊' }
    ],
    dialogue: [
      { speaker: 'A', character: 'dino', text: 'This is my family in my hometown.', phonetic: 'ดิส อีส มาย แฟมิลี อิน มาย โฮมทาวน์.', translation: 'นี่คือครอบครัวของผมในบ้านเกิดของผมครับ' },
      { speaker: 'B', character: 'bear', text: 'My father and mother love the clock tower.', phonetic: 'มาย ฟาเธอร์ แอนด์ มัทเธอร์ ลัฟ เดอะ คล็อก ทาวเวอร์.', translation: 'คุณพ่อและคุณแม่ของฉันชอบหอนาฬิกามากค่ะ' },
      { speaker: 'A', character: 'dino', text: 'We can visit the island, cave, and waterfall!', phonetic: 'วี แคน วิสิท ดิ ไอแลนด์, เคฟ, แอนด์ วอเทอร์ฟอล!', translation: 'พวกเราไปเที่ยวเกาะ ถ้ำ และน้ำตกได้นะครับ!' }
    ],
    tip: 'ฝึกออกเสียงคำว่า "family" และ "hometown" โดยเน้นพยางค์แรกดังขึ้นเล็กน้อยนะจ๊ะ!'
  },
  {
    id: 4,
    title: 'สีสันและผลไม้แสนอร่อย',
    englishTitle: 'What Colour Is It? & Fruits',
    emoji: '🎨',
    description: 'เรียนรู้เรื่องสีสันที่สวยงาม และผลไม้แสนอร่อยรอบตัวเรากันจ้า',
    color: 'purple',
    borderColor: 'border-purple-300',
    vocab: [
      { word: 'red', phonetic: 'เรด', translation: 'สีแดง', emoji: '🔴' },
      { word: 'blue', phonetic: 'บลู', translation: 'สีน้ำเงิน', emoji: '🔵' },
      { word: 'green', phonetic: 'กรีน', translation: 'สีเขียว', emoji: '🟢' },
      { word: 'yellow', phonetic: 'เยลโล', translation: 'สีเหลือง', emoji: '🟡' },
      { word: 'purple', phonetic: 'เพอร์เพิล', translation: 'สีม่วง', emoji: '🟣' },
      { word: 'apple', phonetic: 'แอปเปิล', translation: 'แอปเปิล', emoji: '🍎' },
      { word: 'banana', phonetic: 'บานานา', translation: 'กล้วย', emoji: '🍌' },
      { word: 'mango', phonetic: 'แมงโก', translation: 'มะม่วง', emoji: '🥭' },
      { word: 'watermelon', phonetic: 'วอเทอร์เมลอน', translation: 'แตงโม', emoji: '🍉' },
      { word: 'fruit', phonetic: 'ฟรุต', translation: 'ผลไม้', emoji: '🍇' }
    ],
    dialogue: [
      { speaker: 'A', character: 'bear', text: 'What colour is this fruit? Is it red?', phonetic: 'ว็อท คัลเลอร์ อีส ดิส ฟรุต? อิท อีส เรด?', translation: 'ผลไม้นี้สีอะไรหรอคะ? มันคือสีแดงใช่ไหม?' },
      { speaker: 'B', character: 'dino', text: 'No, it is a yellow banana. I like fruit.', phonetic: 'โน, อิท อีส อะ เยลโล บานานา. ไอ ไลค์ ฟรุต.', translation: 'ไม่ใช่ครับ มันคือกล้วยสีเหลือง ผมชอบผลไม้ครับ' },
      { speaker: 'A', character: 'bear', text: 'I like green mango and red watermelon!', phonetic: 'ไอ ไลค์ กรีน แมงโก แอนด์ เรด วอเทอร์เมลอน!', translation: 'ฉันชอบมะม่วงสีเขียวและแตงโมสีแดงค่ะ!' }
    ],
    tip: 'ออกเสียงตัว R ในคำว่า "Red" และ "Fruit" ม้วนลิ้นเข้าไปด้านในเล็กน้อยโดยริมฝีปากไม่แตะกันนะจ๊ะ!'
  },
  {
    id: 5,
    title: 'ของเล่นแสนสนุกและเทศกาลลูกลม',
    englishTitle: 'Fun with Toys & Trang Look Lom Festival',
    emoji: '🧸',
    description: 'เล่นของเล่นแสนสนุกและสนุกกับเทศกาลลูกลมจังหวัดตรัง',
    color: 'pink',
    borderColor: 'border-pink-300',
    vocab: [
      { word: 'toy', phonetic: 'ทอย', translation: 'ของเล่น', emoji: '🧸' },
      { word: 'ball', phonetic: 'บอล', translation: 'ลูกบอล', emoji: '⚽' },
      { word: 'doll', phonetic: 'ดอล', translation: 'ตุ๊กตา', emoji: '🧸' },
      { word: 'kite', phonetic: 'ไคท์', translation: 'ว่าว', emoji: '🪁' },
      { word: 'robot', phonetic: 'โรบอท', translation: 'หุ่นยนต์', emoji: '🤖' },
      { word: 'game', phonetic: 'เกม', translation: 'เกม', emoji: '🎮' },
      { word: 'festival', phonetic: 'เฟสติวัล', translation: 'เทศกาล', emoji: '🎪' },
      { word: 'seed', phonetic: 'ซีด', translation: 'เมล็ด', emoji: '🌱' },
      { word: 'whistle', phonetic: 'วิสเซิล', translation: 'เป่านกหวีด', emoji: '😗' },
      { word: 'fun', phonetic: 'ฟัน', translation: 'ความสนุก', emoji: '😀' }
    ],
    dialogue: [
      { speaker: 'A', character: 'dino', text: 'Look at my toy robot and toy ball!', phonetic: 'ลุค แอ็ท มาย ทอย โรบอท แอนด์ ทอย บอล!', translation: 'ดูหุ่นยนต์ของเล่นและลูกบอลของเล่นของผมสิครับ!' },
      { speaker: 'B', character: 'bear', text: 'We can play a game. It is so much fun.', phonetic: 'วี แคน เพลย์ อะ เกม. อิท อีส โซ มัช ฟัน.', translation: 'พวกเรามาเล่นเกมกันได้นะ มันสนุกมากเลยค่ะ' },
      { speaker: 'A', character: 'dino', text: "Let's fly a kite at the Look Lom festival!", phonetic: 'เล็ทส์ ฟลาย อะ ไคท์ แอ็ท เดอะ ลุค ลม เฟสติวัล!', translation: 'ไปเล่นว่าวในเทศกาลลูกลมกันเถอะครับ!' }
    ],
    tip: 'ออกเสียงตัว T ท้ายเสียงคำว่า "Robot" และ "Kite" เบาๆ เพื่อความชัดเจนยิ่งขึ้นนะลูก!'
  },
  {
    id: 6,
    title: 'คำศัพท์ท้องถิ่นจังหวัดตรัง',
    englishTitle: 'Trang Local Vocabulary',
    emoji: '🌴',
    description: 'เรียนรู้เรื่องราวสถานที่สำคัญ ดอกไม้ประจำจังหวัด และของดีเมืองตรังเพิ่มเติมกันจ้า',
    color: 'cyan',
    borderColor: 'border-cyan-300',
    vocab: [
      { word: 'Phraya Ratsadanupradit', phonetic: 'พระยา รัษฎานุประดิษฐ์', translation: 'พระยารัษฎานุประดิษฐ์', emoji: '🏛️' },
      { word: 'Si Trang flower', phonetic: 'สี ตรัง ฟลาวเวอร์', translation: 'ดอกศรีตรัง', emoji: '🌸' },
      { word: 'rubber tree', phonetic: 'รับเบอร์ ทรี', translation: 'ต้นยางพารา', emoji: '🌳' },
      { word: 'dim sum', phonetic: 'ติ่มซำ', translation: 'ติ่มซำ', emoji: '🥟' },
      { word: 'Koh Kradan', phonetic: 'เกาะ กระดาน', translation: 'เกาะกระดาน', emoji: '🏝️' },
      { word: 'Emerald Cave', phonetic: 'เอมเมอรัลด์ เคฟ', translation: 'ถ้ำมรกต', emoji: '🧗' },
      { word: 'Ton Te Waterfall', phonetic: 'ต้นเตะ วอเทอร์ฟอล', translation: 'น้ำตกโตนเตะ', emoji: '🌊' },
      { word: 'Underwater Wedding Festival', phonetic: 'อันเดอร์วอเทอร์ เวดดิง เฟสติวัล', translation: 'งานวิวาห์ใต้สมุทร', emoji: '🤵👰' },
      { word: 'Look Lom Festival', phonetic: 'ลุค ลม เฟสติวัล', translation: 'เทศกาลลูกลม', emoji: '🪁' }
    ],
    dialogue: [
      { speaker: 'A', character: 'bear', text: 'Trang is famous for the dim sum and rubber tree.', phonetic: 'ตรัง อีส เฟมัส ฟอร์ เดอะ ติ่มซำ แอนด์ รับเบอร์ ทรี.', translation: 'จังหวัดตรังมีชื่อเสียงในเรื่องติ่มซำและต้นยางพาราค่ะ' },
      { speaker: 'B', character: 'dino', text: 'We can visit Koh Kradan and Emerald Cave!', phonetic: 'วี แคน วิสิท เกาะ กระดาน แอนด์ เอมเมอรัลด์ เคฟ!', translation: 'พวกเราไปเที่ยวเกาะกระดานและถ้ำมรกตได้นะครับ!' },
      { speaker: 'A', character: 'bear', text: 'Look at the beautiful Si Trang flower.', phonetic: 'ลุค แอ็ท เดอะ บิวตี้ฟูล สี ตรัง ฟลาวเวอร์.', translation: 'ดูดอกศรีตรังที่แสนสวยงามนี้สิคะ' }
    ],
    tip: 'ออกเสียงคำศัพท์สถานที่สำคัญ เช่น "Emerald Cave" และ "Koh Kradan" ด้วยความมั่นใจนะคนเก่ง!'
  }
];
