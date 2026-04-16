export type ItemType = 'collect' | 'interact' | 'npc';

export interface LevelItem {
  id: string;
  x: number;
  type: ItemType;
  label: string;
  message?: string;
  clue?: string;
  width?: number;
  showNpcOnInteract?: boolean;
}

export interface OrderedInteractionsPuzzle {
  mode: 'ordered-interactions';
  sequence: string[];
  hintText: string;
  wrongAttemptMessage: string;
}

export interface LevelConfig {
  id: string;
  title: string;
  subtitle: string;
  bgClass: string;
  groundClass: string;
  worldWidth: number;
  items: LevelItem[];
  baseSentence: string;
  narrativeBeats?: string[];
  instruction: string;
  theme: 'campus' | 'night' | 'code' | 'rooftop';
  typeSpeedMs?: number;
  puzzle?: OrderedInteractionsPuzzle;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 'act1',
    title: '第一幕「初见」',
    subtitle: '喜欢不是突然说出口，而是从注意你开始',
    bgClass: 'bg-gradient-to-b from-orange-300 via-pink-300 to-purple-400',
    groundClass: 'bg-gray-800 border-t-4 border-gray-700',
    worldWidth: 2400,
    theme: 'campus',
    items: [
      { id: 'h1', x: 500, type: 'collect', label: 'H' },
      { id: 'x', x: 900, type: 'collect', label: 'X' },
      { id: 'h2', x: 1300, type: 'collect', label: 'H' },
      { id: 'heart', x: 1700, type: 'collect', label: '❤️' },
      { id: 'npc1', x: 2200, type: 'npc', label: '她' },
    ],
    baseSentence: "那天以后，我开始偷偷把目光写进日常。在熙熙攘攘的校园里，我的视线总是不自觉地越过人群，只为捕捉你偶尔经过的侧影。每一次不经意的擦肩而过，都在我心里悄悄留下了特别的标记。",
    narrativeBeats: [
      '那天以后，我开始在日常里偷偷找你。',
      '人群很吵，我的目光却总会先绕到你那边。',
      '你每次经过，都像在心里轻轻敲一下。',
      '我开始记得你的侧影，也开始记得自己会紧张。',
      '等你真的朝我走来时，我才发现，喜欢早就有了名字。'
    ],
    instruction: "使用 ← → 移动，触碰收集漂浮的字符。她就在前方。"
    ,
    typeSpeedMs: 20
  },
  {
    id: 'act2',
    title: '第二幕「留意」',
    subtitle: '心动是在无数普通瞬间里被反复确认的',
    bgClass: 'bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 bg-stars',
    groundClass: 'bg-gray-900 border-t-4 border-gray-800',
    worldWidth: 2800,
    theme: 'night',
    items: [
      { id: 'mem1', x: 1200, type: 'interact', label: '路灯', clue: '擦肩', message: '你抱着书本快速走过', showNpcOnInteract: true },
      { id: 'mem2', x: 600, type: 'interact', label: '路灯', clue: '认真', message: '你低头看书的时候很认真', showNpcOnInteract: true },
      { id: 'mem3', x: 1800, type: 'interact', label: '路灯', clue: '笑意', message: '你笑的时候，像一行终于运行成功的程序', showNpcOnInteract: true },
    ],
    baseSentence: "心动是在无数普通瞬间里被反复确认的。你抱着书本匆匆走过的样子，你低头看书时专注的神情，还有你偶尔抬起头时眼底闪烁的光芒，这些微小的碎片拼凑成了我漫长岁月里最温柔的底色。",
    narrativeBeats: [
      '起初我只是以为，自己比别人多看了你几眼。',
      '第一盏灯亮起时，我开始记住你低头看书时的认真。',
      '第二盏灯亮起时，我也开始在意那次擦肩时自己的慌乱。',
      '第三盏灯亮起时，我终于承认，我会因为你的笑停顿一下。'
    ],
    instruction: "靠近路灯，按 空格/Enter 键点亮回忆。留意心里最先亮起的是哪一幕。",
    typeSpeedMs: 34,
    puzzle: {
      mode: 'ordered-interactions',
      sequence: ['mem2', 'mem1', 'mem3'],
      hintText: '认真之后，才是那次擦肩，最后留在心里的，是你笑起来的样子。',
      wrongAttemptMessage: '顺序不对，再想想最先浮现的是哪一幕。'
    }
  },
  {
    id: 'act3',
    title: '第三幕「犹豫」',
    subtitle: '喜欢里最真实的部分不是热烈，而是克制和忐忑',
    bgClass: 'bg-gray-900 bg-grid',
    groundClass: 'bg-black border-t-4 border-green-500/30',
    worldWidth: 2800,
    theme: 'code',
    items: [
      { id: 'err1', x: 1200, type: 'interact', label: 'Error: timidity', clue: '胆怯', message: '修复：胆怯' },
      { id: 'err2', x: 1800, type: 'interact', label: 'Error: unsent_message', clue: '未发送', message: '修复：未发送的消息' },
      { id: 'err3', x: 600, type: 'interact', label: 'Error: self_doubt', clue: '怀疑', message: '修复：自我怀疑' },
      { id: 'npc3', x: 2600, type: 'npc', label: '她的身影' },
    ],
    baseSentence: "我写了很多遍开头，却还是怕你看见我的认真。在无数个深夜里，我反复修改着那些未曾发送的字句，试图修复内心的胆怯与自我怀疑。即便隔着屏幕，我也能听见自己如乱码般跳动的心跳声。",
    narrativeBeats: [
      '越靠近要说出口的时候，我反而越容易沉默。',
      '先停下那句“也许只是我想太多了”。',
      '再把胆怯一点一点拆开，给勇气留出位置。',
      '最后，我决定不再删掉那句想送给你的真心。'
    ],
    instruction: "靠近红色报错，按 空格/Enter 键修复心情。先把心里最深的那一道修好。",
    typeSpeedMs: 42,
    puzzle: {
      mode: 'ordered-interactions',
      sequence: ['err3', 'err1', 'err2'],
      hintText: '先停下自我怀疑，再鼓起勇气，最后把那句想说的话送出去。',
      wrongAttemptMessage: '这一步还没到，再想想心里真正卡住的是哪一处。'
    }
  },
  {
    id: 'act4',
    title: '第四幕「靠近」',
    subtitle: '走完整段路，终于把喜欢交给你',
    bgClass: 'bg-gradient-to-b from-black via-indigo-950 to-black bg-stars',
    groundClass: 'bg-gray-900 border-t-4 border-gray-800',
    worldWidth: 2000,
    theme: 'rooftop',
    items: [
      { id: 'bench', x: 1200, type: 'interact', label: '长椅', message: '递出代码情书' },
      { id: 'npc4', x: 1260, type: 'npc', label: '她' },
    ],
    baseSentence: "一切准备就绪。我跨越了所有的犹豫与忐忑，终于走到了你的面前。这一次，我不想再做个默默注视的旁观者，我想把这份酝酿已久的心意，连同我所有的勇气，一起郑重地交给你。",
    narrativeBeats: [
      '走到这里之前，我已经在心里排练了很多遍。',
      '可真正把心意交给你时，世界反而一下安静了下来。'
    ],
    instruction: "走到她身边，按 空格/Enter 键递出情书",
    typeSpeedMs: 48
  }
];
