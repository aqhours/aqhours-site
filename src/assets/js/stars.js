/**
 * 星星飘落效果系统
 * 重构版本 - 使用面向对象设计和现代JavaScript特性
 */

class StarfallEffect {
  // 配置常量
  static CONFIG = {
    STAR_SYMBOL: '⭐',
    BASE_STAR_COUNT: 30,
    GRID_SIZE: 50,
    BASE_DENSITY: 5,
    ANIMATION_EASING: 'cubic-bezier(0.4, 0, 1, 1)',
    ANIMATION_SPEED_FACTOR: 60,
    DELAY_MULTIPLIER: 2,
    BREAKPOINTS: {
      SMALL: 500,
      MEDIUM: 700,
      LARGE: 1200
    }
  };

  // 可选的文本内容（当前保持为空以维持原功能）
  static OPTIONAL_TEXTS = [
    '我最喜欢Aqours了!!!',
    '高海千歌激推🍊',
    '南昌航空大学',
    '信息工程学院',
    '计算机科学与技术',
    '努力成为一名优秀的Web开发工程师',
    'LLer',
    '不要关掉啊，你眼里的光!',
    '遂川中学',
    '君子之交淡如水',
    '它如同我的生命',
    '肖火火同学',
    '我不要你管啊！！！！！',
    '你管我啊！少管我！',
    '我们都是追梦人',
    '为闪耀的自我而生',
    '闪耀暖暖',
    '火铳QAQ',
    'Arch Linux 喜欢',
    '不要吃月亮',
    '来自江西吉安',
    'Catch Our Dream!^_^👋',
    '心里有火，眼里有光',
    'Mystery of Love',
    '命里有时终须有，命里无时某强求',
    '一切皆有命数',
    '喜欢狮子座',
    '勇敢做自己',
    '接单中...',
    '《我怀念的》',
    '梦想 + 未来 = 无限大',
    '闪闪发光心动不已',
    '理想遨游在蓝色的天空',
  ];

  constructor(containerSelector = '.star-container') {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`Container "${containerSelector}" not found`);
      return;
    }

    this.windowDimensions = this.getWindowDimensions();
    this.responsiveConfig = this.calculateResponsiveConfig();
    this.texts = this.generateTexts();
    this.positionGenerator = this.createPositionGenerator();
    this.zIndex = 0;

    this.init();
  }

  /**
   * 获取窗口尺寸信息
   */
  getWindowDimensions() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * 计算响应式配置
   */
  calculateResponsiveConfig() {
    const { width } = this.windowDimensions;
    const { BREAKPOINTS, BASE_DENSITY } = StarfallEffect.CONFIG;

    let density = BASE_DENSITY;
    let multiplier = 1;

    if (width > BREAKPOINTS.SMALL) density = 7;
    if (width > BREAKPOINTS.MEDIUM) multiplier = 2;
    if (width > BREAKPOINTS.LARGE) {
      density = 9;
      multiplier = 4; // 2 * 2
    }

    return { density, multiplier };
  }

  /**
   * 生成文本数组
   */
  generateTexts() {
    const { BASE_STAR_COUNT, STAR_SYMBOL } = StarfallEffect.CONFIG;
    const { multiplier } = this.responsiveConfig;

    // 创建基础文本数组（当前为空字符串以保持原功能）
    let baseTexts = Array(BASE_STAR_COUNT).fill('').map(text => STAR_SYMBOL + text);

    // 根据屏幕尺寸增加数量
    for (let i = 1; i < multiplier; i++) {
      baseTexts = baseTexts.concat([...baseTexts]);
    }

    return this.shuffleArray(baseTexts);
  }

  /**
   * Fisher-Yates 洗牌算法（比 Math.random() - 0.5 更随机）
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 创建不重复位置生成器
   */
  createPositionGenerator() {
    const { height } = this.windowDimensions;
    const { GRID_SIZE } = StarfallEffect.CONFIG;
    const levelCount = Math.floor(height / GRID_SIZE);
    
    return new UniqueRandomGenerator(levelCount);
  }

  /**
   * 创建单个星星元素
   */
  createStarElement(text, index) {
    const element = document.createElement('p');
    const styles = this.calculateStarStyles(index);

    element.textContent = text;
    element.className = 'text';

    // 批量设置样式
    Object.assign(element.style, styles);

    return element;
  }

  /**
   * 计算星星的样式属性
   */
  calculateStarStyles(index) {
    const { GRID_SIZE, ANIMATION_EASING, ANIMATION_SPEED_FACTOR, DELAY_MULTIPLIER } = StarfallEffect.CONFIG;
    const { density } = this.responsiveConfig;
    const { width } = this.windowDimensions;

    const bottomPosition = this.positionGenerator.getNext() * GRID_SIZE;
    const animationDelay = (index / density) * DELAY_MULTIPLIER;
    const animationDuration = width / ANIMATION_SPEED_FACTOR;

    return {
      height: `${GRID_SIZE}px`,
      bottom: `${bottomPosition}px`,
      animation: `move ${animationDuration}s infinite ${ANIMATION_EASING}`,
      animationDelay: `${animationDelay}s`,
      zIndex: this.zIndex++
    };
  }

  /**
   * 批量创建并插入星星元素
   */
  createAndInsertStars() {
    const fragment = document.createDocumentFragment();

    this.texts.forEach((text, index) => {
      const starElement = this.createStarElement(text, index);
      fragment.appendChild(starElement);
    });

    this.container.appendChild(fragment);
  }

  /**
   * 初始化星星飘落效果
   */
  init() {
    try {
      this.createAndInsertStars();
      console.log(`🌟 星星飘落效果初始化完成:`);
      console.log(`  - 屏幕尺寸: ${this.windowDimensions.width} × ${this.windowDimensions.height}`);
      console.log(`  - 星星总数: ${this.texts.length}`);
      console.log(`  - 显示密度: ${this.responsiveConfig.density}`);
      console.log(`  - 倍增系数: ${this.responsiveConfig.multiplier}`);
      console.log(`  - 垂直层数: ${Math.floor(this.windowDimensions.height / StarfallEffect.CONFIG.GRID_SIZE)}`);
      console.log(`  - 位置分配: 随机不重复循环分布`);
    } catch (error) {
      console.error('Failed to initialize starfall effect:', error);
    }
  }

  /**
   * 销毁效果（清理DOM）
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * 重新初始化（响应窗口大小变化）
   */
  reinitialize() {
    this.destroy();
    this.windowDimensions = this.getWindowDimensions();
    this.responsiveConfig = this.calculateResponsiveConfig();
    this.texts = this.generateTexts();
    this.positionGenerator = this.createPositionGenerator();
    this.zIndex = 0;
    this.init();
  }
}

/**
 * 顺序位置生成器（从下到上）
 */
class SequentialPositionGenerator {
  constructor(range) {
    this.range = range;
    this.currentIndex = 0;
  }

  getNext() {
    // 从 0 开始，依次递增（0 = 最下面，range-1 = 最上面）
    const position = this.currentIndex % this.range;
    this.currentIndex++;
    return position;
  }
}

/**
 * 不重复随机数生成器（优化版原始算法）
 */
class UniqueRandomGenerator {
  constructor(range) {
    this.numbers = [];
    this.index = 0;
    
    // 将数字从 0 到 range-1 添加到数组中
    for (let i = 0; i < range; i++) {
      this.numbers.push(i);
    }
    
    // 打乱数组顺序（使用更好的洗牌算法）
    this.shuffleArray(this.numbers);
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  getNext() {
    // 返回不重复的随机数
    if (this.index >= this.numbers.length) {
      this.index = 0; // 重置索引，但不重新洗牌
    }
    
    return this.numbers[this.index++];
  }
}

// 初始化星星飘落效果
const starfallEffect = new StarfallEffect('.star-container');

// 响应窗口大小变化（防抖处理）
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    starfallEffect.reinitialize();
  }, 250);
});

// 导出供外部使用（如果需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StarfallEffect, SmartPositionGenerator, SequentialPositionGenerator };
}

// 示例：21层高度，60个星星
// 每层最多：ceil(60/21) = 3个星星

// 星星1: 层级5, 延迟0s    ⭐
// 星星2: 层级12, 延迟0.4s       ⭐
// 星星3: 层级5, 延迟0.8s + 0.5s ⭐  (同层偏移)
// 星星4: 层级8, 延迟1.2s              ⭐
// 星星5: 层级5, 延迟1.6s + 1.0s ⭐  (同层偏移)
