# LOVE_BY_CODE

> 代码书心意 —— 一款像素风互动叙事游戏

一款浪漫像素风格的四幕互动故事游戏。玩家在不同的主题关卡中收集角色、与物体互动，逐步揭开一段从初遇到告白的完整爱情故事。

![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.14-06B6D4?logo=tailwindcss)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动开发服务器，默认访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建

```bash
npm run preview
```

在本地预览生产构建效果（通常 http://localhost:4173）。

### 类型检查

```bash
npm run lint
```

运行 TypeScript 类型检查（tsc --noEmit）。

### 清理构建产物

```bash
npm run clean
```

删除 `dist/` 目录。

## 项目结构

```
love_by_code/
├── src/
│   ├── App.tsx              # 根组件，场景状态管理，音频控制
│   ├── main.tsx             # React 入口
│   ├── index.css            # 全局样式，Tailwind CSS 配置
│   ├── components/
│   │   ├── GameLevel.tsx    # 核心游戏组件：移动、碰撞、交互、UI
│   │   ├── Intro.tsx        # 标题画面（开场）
│   │   ├── Outro.tsx        # 告白信展示（结尾）
│   │   ├── HeroSpineSprite.tsx   # 男主角像素精灵动画
│   │   └── FemaleLeadSprite.tsx   # 女主角像素精灵动画
│   ├── data/
│   │   └── levels.ts        # 四幕关卡配置（主题、物品、谜题、叙事）
│   ├── hooks/
│   │   └── usePerformanceMode.ts  # FPS 监控，动态性能模式
│   └── assets/              # 静态图片资源
├── demo/
│   ├── music/               # 背景音乐（开幕、各关卡、情书展示）
│   ├── img/                 # SVG 素材（路灯、长椅）
│   └── *-frames/            # 像素角色帧动画序列图
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 游戏内容

### 四幕结构

| 幕 | 标题 | 主题 | 核心玩法 |
|---|---|---|---|
| 第一幕 | 初见 | 校园（campus） | 收集漂浮字符 H、X、H、❤️，走向 NPC |
| 第二幕 | 留意 | 夜晚（night） | 按正确顺序点亮路灯，唤醒记忆碎片 |
| 第三幕 | 犹豫 | 代码（code） | 按正确顺序修复心情 bug |
| 第四幕 | 靠近 | 天台（rooftop） | 走向女主角，递出代码情书 |

### 游戏操作

- **← →** 方向键移动角色
- **空格 / Enter** 与物体交互（互动型物品）或确认（对话）

### 场景流转

```
Intro (-1) → Act 1 (0) → Act 2 (1) → Act 3 (2) → Act 4 (3) → Outro (4)
```

- `sceneIndex = -1`：开场标题画面
- `sceneIndex = 0~3`：四个游戏关卡
- `sceneIndex = 4`：结尾告白信展示

## 核心系统

### 场景管理（App.tsx）

根组件通过 `sceneIndex` 状态控制场景切换，同时管理：
- 背景音乐切换（带淡入淡出效果）
- 信封展开状态（ Outro 场景）

### 游戏循环（GameLevel.tsx）

使用 `motion/react` 的 `useAnimationFrame` 实现 60fps 游戏循环：

- 键盘输入处理（移动 + 互动）
- 碰撞检测（收集型 / 互动型 / NPC）
- 相机跟随（clamp 到世界边界）
- 关卡完成判断

### 关卡配置（levels.ts）

每幕关卡包含：

```typescript
interface LevelConfig {
  id: string;
  title: string;           // 幕标题
  subtitle: string;         // 副标题
  bgClass: string;          // Tailwind 背景样式
  groundClass: string;     // 地面样式
  worldWidth: number;       // 世界宽度（像素）
  theme: 'campus'|'night'|'code'|'rooftop';
  items: LevelItem[];      // 可交互物品
  baseSentence: string;     // 基础叙事句
  narrativeBeats?: string[]; // 分段叙事（随进度逐步显示）
  instruction: string;      // 操作提示
  typeSpeedMs?: number;    // 打字机效果速度
  puzzle?: OrderedInteractionsPuzzle; // 顺序解谜配置
}
```

### 顺序解谜系统

第二幕和第三幕包含需要按特定顺序互动的谜题：

```typescript
interface OrderedInteractionsPuzzle {
  mode: 'ordered-interactions';
  sequence: string[];           // 正确顺序的物品 ID 列表
  hintText: string;             // 提示文本
  wrongAttemptMessage: string;  // 错误顺序提示
}
```

### 音频系统

- 开幕音乐、各关卡音乐、情书展示音乐
- 切换场景时带 900ms 淡入淡出过渡
- 背景音乐循环播放
- 自动处理浏览器自动播放策略（等待用户手势）

### 像素精灵动画

使用 `import.meta.glob` 懒加载帧序列图：

- **HeroSpineSprite**：男主角走路动画（24帧，解析文件名时间戳计算帧时长）
- **FemaleLeadSprite**：女主角看书动画（24帧，支持「记忆模式」滤镜效果）

精灵宽高比：
- 男主角：278 / 651
- 女主角：364 / 672

### 动画与素材制作工具

| 工具 | 用途 |
|---|---|
| **CodeX + Gemini 3** | 动画帧生成、补帧优化、像素风格调校 |
| **即梦（Jimeng）** | 像素风角色立绘、场景素材生成 |
| **Nano Banana** | 像素风角色立绘、动态素材优化 |

### 性能模式

`usePerformanceMode` hook 实时监控 FPS：

- 每 30 帧计算一次平均帧率
- FPS < 30 时自动切换到低性能模式
- 低性能模式下减少星空粒子数量（50 → 20）

### 视觉效果

- **CRT 扫描线**：开场和关卡场景覆盖扫描线叠加层
- **CRT 闪烁**：微妙的画面闪烁效果
- **像素心形**：CSS 绘制的跳动心形动画
- **夜空背景**：使用 radial-gradient 随机分布的星点
- **代码网格**：代码主题场景的背景网格线
- **路灯光锥**：夜晚场景点亮的路灯投射光锥效果

## 技术栈

- **Vite 6.2.0** —— 构建工具
- **React 19.0.0** —— UI 框架
- **TypeScript 5.8.2** —— 类型系统
- **Tailwind CSS 4.1.14** —— 原子化 CSS
- **Motion 12.x** —— 动画库（React Spring 继任者）
- **Express 4.21** —— 后端框架（本项目中未深入使用）
- **Lucide React** —— 图标库
- **CodeX + Gemini 3** —— 动画生成与优化
- **即梦 / Nano Banana** —— 像素风素材生成
- **Minimax Music 2.6** —— 背景音乐生成

## 自定义配置

### 音乐生成

背景音乐使用 **Minimax Music 2.6** 生成。将 `.mp3` 文件放入 `demo/music/` 目录，当前音乐文件：

| 文件名 | 用途 |
|---|---|
| `开幕.mp3` | 开场标题画面 |
| `demo1.mp3` | 第一幕（校园） |
| `demo2.mp3` | 第二幕（夜晚） |
| `demo3.mp3` | 第三幕（代码） |
| `demo4.mp3` | 第四幕（天台） |
| `情书展示.mp3` | 结尾告白信展开时 |

### 像素精灵帧

像素风角色立绘由 **即梦（Jimeng）** 和 **Nano Banana** 生成，动画序列由 **CodeX + Gemini 3** 辅助生成与优化。

- **男主角走路**：将帧图片放入 `demo/男主-固定镜头-走路动作-frames/`
- **女主角看书**：将帧图片放入 `demo/女主-固定镜头-看书动作-身体不要动-frames/`

帧图片命名格式：`*-frame-001-00-00-109.png`
- `001` = 帧序号
- `00-00-109` = 时间戳（分-秒-毫秒），用于计算帧时长

### 添新关卡

在 `src/data/levels.ts` 的 `LEVELS` 数组中追加新的 `LevelConfig` 对象即可。

## 环境变量

可选配置 `.env` 文件：

| 变量 | 说明 |
|---|---|
| `GEMINI_API_KEY` | Gemini API 密钥（当前版本未深入使用 AI 功能） |
| `DISABLE_HMR` | 设为 `true` 可禁用 Vite 热模块替换（AI Studio 环境使用） |

## License

Private - 仅供个人/学习使用
