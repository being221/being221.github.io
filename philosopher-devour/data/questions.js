// 诸子吞噬 — 题库
// 结构：{ id, school, tier(1-4), prerequisite(id|null), question, options[4], correct(0-3), explanation }
const QUESTION_BANK = {
  schools: {
    rujia:   { name: '儒家', color: 0xe74c3c, icon: '📖' },
    daojia:  { name: '道家', color: 0x2ecc71, icon: '🌿' },
    mojia:   { name: '墨家', color: 0x3498db, icon: '⚙️' },
    fajia:   { name: '法家', color: 0x9b59b6, icon: '⚖️' },
    bingjia: { name: '兵家', color: 0xe67e22, icon: '⚔️' },
  },

  questions: [
    // ==================== 儒家 ====================
    { id: 'r1', school: 'rujia', tier: 1, prerequisite: null,
      question: '"己所不欲，勿施于人"出自哪位思想家？',
      options: ['孔子', '孟子', '荀子', '老子'],
      correct: 0,
      explanation: '出自《论语·卫灵公》，是孔子"恕"道的核心表达。' },

    { id: 'r2', school: 'rujia', tier: 1, prerequisite: null,
      question: '儒家思想的核心概念是什么？',
      options: ['道', '仁', '法', '兼爱'],
      correct: 1,
      explanation: '"仁"是孔子学说的核心，指爱人、关怀他人的道德情感。' },

    { id: 'r3', school: 'rujia', tier: 2, prerequisite: 'r1',
      question: '孟子主张"性善论"，他认为人天生具有哪"四端"？',
      options: ['仁义礼智', '忠孝节义', '礼义廉耻', '仁义道德'],
      correct: 0,
      explanation: '孟子提出恻隐之心（仁之端）、羞恶之心（义之端）、辞让之心（礼之端）、是非之心（智之端）。' },

    { id: 'r4', school: 'rujia', tier: 2, prerequisite: 'r2',
      question: '荀子与孟子的根本分歧在于？',
      options: ['治国方略', '人性善恶', '礼乐制度', '经济政策'],
      correct: 1,
      explanation: '孟子主性善（人天生向善），荀子主性恶（人需后天教化）。这一分歧深刻影响了后世儒学发展。' },

    { id: 'r5', school: 'rujia', tier: 3, prerequisite: 'r3',
      question: '孟子见齐宣王，用"以羊易牛"的故事劝说齐宣王推行仁政。这体现了孟子的什么策略？',
      options: ['以利诱之', '推己及人，启发恻隐之心', '以武力威胁', '强调法制约束'],
      correct: 1,
      explanation: '孟子善于从君王已有的善念出发，引导其"推恩"——将对牛的恻隐之心推广到百姓身上。这是"仁政"思想的具体实践路径。' },

    { id: 'r6', school: 'rujia', tier: 4, prerequisite: 'r5',
      question: '韩非和李斯都师从荀子，却成为法家代表人物。这说明了什么？',
      options: [
        '荀子的教育方法是失败的',
        '性恶论与法家"以法治国"之间存在逻辑通道',
        '韩非背叛了老师',
        '儒家内部自然分裂'
      ],
      correct: 1,
      explanation: '荀子认为人性本恶、需外在规范约束，这为法家"以法治国"提供了逻辑起点。战国后期儒法之交融，正是思想史最精彩的篇章之一。' },

    // ==================== 道家 ====================
    { id: 'd1', school: 'daojia', tier: 1, prerequisite: null,
      question: '道家学派的创始人是？',
      options: ['庄子', '列子', '老子', '淮南子'],
      correct: 2,
      explanation: '老子（李耳），著有《道德经》，奠定了道家哲学的核心框架。' },

    { id: 'd2', school: 'daojia', tier: 1, prerequisite: null,
      question: '道家思想的核心概念是什么？',
      options: ['仁', '礼', '法', '道'],
      correct: 3,
      explanation: '"道"是道家最核心的概念，指宇宙万物的本源和运行规律。"道法自然"是道家根本精神。' },

    { id: 'd3', school: 'daojia', tier: 2, prerequisite: 'd1',
      question: '"无为而治"的真正含义是什么？',
      options: [
        '什么都不做',
        '不违背自然规律而妄为',
        '放弃所有制度',
        '让人民自行其是'
      ],
      correct: 1,
      explanation: '"无为"不是不作为，而是不妄为——顺应事物自身的规律，不做违背自然的干预。' },

    { id: 'd4', school: 'daojia', tier: 2, prerequisite: 'd2',
      question: '庄子与老子的思想有何不同侧重？',
      options: [
        '老子讲治国，庄子讲养生',
        '老子讲"道"的本体论，庄子更重精神逍遥与个体超越',
        '没有本质区别',
        '老子更消极'
      ],
      correct: 1,
      explanation: '老子偏向政治哲学（治道），庄子则发展了精神自由的维度，提出了"逍遥游"的人生境界。' },

    { id: 'd5', school: 'daojia', tier: 3, prerequisite: 'd4',
      question: '庄子在《逍遥游》中写大鹏"水击三千里，抟扶摇而上者九万里"，意在表达什么？',
      options: [
        '鸟的力量很重要',
        '人应当突破自身局限，追求精神的绝对自由',
        '大鸟比小鸟更优越',
        '自然界很壮观'
      ],
      correct: 1,
      explanation: '庄子以大鹏比喻精神的超越——真正的逍遥不在于外在的"大"，而在于突破认知和世俗的束缚，达到"无待"之境。' },

    { id: 'd6', school: 'daojia', tier: 4, prerequisite: 'd5',
      question: '道家的"无为"与儒家的"有为"在中国历史上形成了怎样的互补关系？',
      options: [
        '完全对立，互不相容',
        '儒道互补："治世用儒，乱世用道"，构成中国士人的双重精神世界',
        '道家取代儒家的功能',
        '只是学术争论，无实际影响'
      ],
      correct: 1,
      explanation: '儒道互补是中国思想史最核心的结构之一。儒家提供"入世"的行动伦理，道家提供"出世"的精神退路——"穷则独善其身，达则兼济天下"本身就是儒道融合的产物。' },

    // ==================== 墨家 ====================
    { id: 'm1', school: 'mojia', tier: 1, prerequisite: null,
      question: '墨家学派的创始人是？',
      options: ['墨翟', '韩非', '孙武', '惠施'],
      correct: 0,
      explanation: '墨子（墨翟），出身工匠阶层，创立了战国时期与儒家并称"显学"的墨家学派。' },

    { id: 'm2', school: 'mojia', tier: 1, prerequisite: null,
      question: '墨家"兼爱"与儒家"仁爱"的根本区别是什么？',
      options: [
        '没有区别',
        '兼爱是无差等的爱，仁爱是有亲疏差等的爱',
        '兼爱只爱自己人',
        '仁爱范围更大'
      ],
      correct: 1,
      explanation: '儒家仁爱以血缘亲疏为基础（"爱有差等"），墨家兼爱主张对所有人一视同仁地爱（"爱无差等"）。这是儒墨之争的核心议题。' },

    { id: 'm3', school: 'mojia', tier: 2, prerequisite: 'm1',
      question: '墨家除了"兼爱"，还有哪些核心主张？',
      options: [
        '仁政、礼治',
        '非攻、尚贤、节用、节葬、非命、天志、明鬼',
        '法治、术治、势治',
        '无为、自然'
      ],
      correct: 1,
      explanation: '墨家有十大主张，其中最核心的是兼爱和非攻（反对不义战争）。尚贤主张任人唯贤，节用节葬反对奢侈浪费。' },

    { id: 'm4', school: 'mojia', tier: 2, prerequisite: 'm2',
      question: '孟子激烈批评墨子的"兼爱"，他的核心论据是什么？',
      options: [
        '兼爱太难做到了',
        '兼爱否定父子之亲，是无父也，是禽兽也',
        '兼爱对国家不利',
        '墨子人品不好'
      ],
      correct: 1,
      explanation: '孟子认为兼爱否定人伦差等（视他人之父如己父），这是"无父"，破坏了人伦秩序的基础。这是儒墨之争最激烈的交锋点。' },

    { id: 'm5', school: 'mojia', tier: 3, prerequisite: 'm3',
      question: '墨家不仅讲理论，还擅长实践。以下哪个最能代表墨家的行动精神？',
      options: [
        '文章辩论',
        '"摩顶放踵以利天下"——为天下利益奔波劳累',
        '隐居修道',
        '游说君王'
      ],
      correct: 1,
      explanation: '墨家弟子过着极端刻苦的生活，奔走各国阻止战争、推行兼爱。这种近乎苦行的实践精神使墨家在战国成为一股强大力量。' },

    { id: 'm6', school: 'mojia', tier: 4, prerequisite: 'm5',
      question: '墨家在战国盛极一时，但秦汉以后迅速衰落。最重要的原因是？',
      options: [
        '墨家学说本身不完善',
        '墨家严密的组织性和苦行作风难以吸引大多数人，加上大一统帝国不再需要"非攻"的游说',
        '儒家故意消灭墨家',
        '墨家没有传人'
      ],
      correct: 1,
      explanation: '墨家衰落有多重原因：组织纪律过于严苛（难以持续）、"兼爱"理想过于超前（超出时代接受度）、大一统帝国消灭了"非攻"的需求空间。但墨家的逻辑学、科学精神（光学力学）仍是先秦思想未被充分发扬的遗产。' },

    // ==================== 法家 ====================
    { id: 'f1', school: 'fajia', tier: 1, prerequisite: null,
      question: '法家思想的核心治理工具是什么？',
      options: ['道德教化', '法律和制度', '宗教信仰', '军事力量'],
      correct: 1,
      explanation: '法家主张以明确的法律和制度治理国家，反对依赖道德教化。商鞅变法就是典型的法家实践。' },

    { id: 'f2', school: 'fajia', tier: 1, prerequisite: null,
      question: '法家思想的集大成者是？',
      options: ['商鞅', '申不害', '慎到', '韩非'],
      correct: 3,
      explanation: '韩非综合了商鞅的"法"、申不害的"术"、慎到的"势"，建立了完整的法家理论体系。' },

    { id: 'f3', school: 'fajia', tier: 2, prerequisite: 'f1',
      question: '韩非的"法、术、势"三者分别指什么？',
      options: [
        '法律、战术、形势',
        '法=公开的法律规章，术=君主驾驭臣下的权术，势=君主的权威和权势',
        '方法、技术、势力',
        '法则、算术、势力'
      ],
      correct: 1,
      explanation: '韩非认为三者缺一不可：法（制度）让国家有章可循，术（权术）让君主不被蒙蔽，势（权威）让法令得以推行。' },

    { id: 'f4', school: 'fajia', tier: 2, prerequisite: 'f2',
      question: '商鞅变法中最具争议的措施是什么？',
      options: [
        '奖励耕战',
        '什伍连坐制度——邻里互相监督，一人犯法邻居连坐',
        '废井田开阡陌',
        '统一度量衡'
      ],
      correct: 1,
      explanation: '什伍连坐是法家极端法治的体现：将基层社会编织成严密的监控网络。它虽然高效，但严重损害了社会信任，为法家招致了最多的批评。' },

    { id: 'f5', school: 'fajia', tier: 3, prerequisite: 'f3',
      question: '秦国采用法家路线完成了统一，但秦朝二世而亡。法家治理模式的根本问题是什么？',
      options: [
        '法律不够详细',
        '过度依赖严刑峻法而忽视道德感召，社会的服从是恐惧而非认同',
        '没有足够的军队',
        '六国残余势力太强'
      ],
      correct: 1,
      explanation: '法家的问题不在于效率（它效率极高），而在于"合法性赤字"——建立在恐惧上的秩序无法持久。秦朝用实际行动检验了纯粹法家治理的极限。' },

    { id: 'f6', school: 'fajia', tier: 4, prerequisite: 'f5',
      question: '汉代以后统治者多采取"阳儒阴法"的策略。这意味着什么？',
      options: [
        '完全放弃法家',
        '表面上推崇儒家道德教化（获取合法性），实际上沿用法家的制度框架（确保效率）',
        '儒家和法家完全融合为一体',
        '法家秘密控制儒家'
      ],
      correct: 1,
      explanation: '"阳儒阴法"是理解中国两千年政治的关键概念。儒家的"仁政"话语提供统治合法性，法家的制度框架提供治理效率。两者并非水火不容，而是在实践中形成了互补共生的关系。' },

    // ==================== 兵家 ====================
    { id: 'b1', school: 'bingjia', tier: 1, prerequisite: null,
      question: '"兵者，诡道也"出自哪部兵书？',
      options: ['《孙膑兵法》', '《孙子兵法》', '《吴子》', '《六韬》'],
      correct: 1,
      explanation: '《孙子兵法·计篇》开篇即言"兵者，诡道也"，奠定了兵家以谋略为核心的战争观。' },

    { id: 'b2', school: 'bingjia', tier: 1, prerequisite: null,
      question: '《孙子兵法》的核心思想可以概括为？',
      options: ['以多胜少', '不战而屈人之兵', '速战速决', '全面战争'],
      correct: 1,
      explanation: '"不战而屈人之兵，善之善者也"——孙子认为最高明的胜利是通过谋略和威慑使敌人屈服，而非通过流血战斗。' },

    { id: 'b3', school: 'bingjia', tier: 2, prerequisite: 'b1',
      question: '"知彼知己，百战不殆"中，"殆"的意思是？',
      options: ['死亡', '危险', '失败', '疲惫'],
      correct: 1,
      explanation: '"殆"指危险。了解对方也了解自己，打一百仗都不会陷入危险。这句话概括了情报和自知的战略核心地位。' },

    { id: 'b4', school: 'bingjia', tier: 2, prerequisite: 'b2',
      question: '孙膑与庞涓的故事中，孙膑用什么策略在桂陵之战中击败魏军？',
      options: [
        '正面强攻',
        '"围魏救赵"——佯攻魏都逼庞涓回师，在途中伏击',
        '水攻',
        '长期围城'
      ],
      correct: 1,
      explanation: '围魏救赵是兵家"攻其必救"战术的经典案例——与其正面救援赵国，不如攻击魏国本土，迫使庞涓撤军，在桂陵设伏击溃。' },

    { id: 'b5', school: 'bingjia', tier: 3, prerequisite: 'b3',
      question: '《孙子兵法》说"上兵伐谋，其次伐交，其次伐兵，其下攻城"。这句话的战略层级排序反映了什么？',
      options: [
        '孙子不喜欢打仗',
        '从成本最高到最低排列',
        '从最优到最差：谋略取胜 > 外交施压 > 野战歼敌 > 惨烈攻城',
        '随机排列'
      ],
      correct: 2,
      explanation: '孙子建立了清晰的战略优选级：最上乘是在谋略层面瓦解敌人（成本最低、收益最大），次之通过外交联盟施压，再次野外作战，最次是攻城——因为攻城代价最大。这体现了兵家"慎战"的理性精神。' },

    { id: 'b6', school: 'bingjia', tier: 4, prerequisite: 'b5',
      question: '兵家与道家在思想上有深层关联。《孙子兵法》中"奇正相生，如循环之无端"体现了哪种哲学思维？',
      options: [
        '儒家伦理',
        '道家辩证法——事物对立面相互转化、生生不息',
        '法家的规则意识',
        '墨家的实用主义'
      ],
      correct: 1,
      explanation: '兵家思想深受道家辩证法影响。"正"是常规战法，"奇"是变招，两者相互转化、无穷无尽——这正是老子"反者道之动"的军事表达。中国思想学派之间从来不是孤立的。' },
  ],

  // ===== 辅助方法 =====

  /** 根据学派获取题目列表 */
  getQuestionsBySchool(schoolKey) {
    return this.questions.filter(q => q.school === schoolKey);
  },

  /** 根据 id 获取题目 */
  getQuestionById(id) {
    return this.questions.find(q => q.id === id);
  },

  /** 获取玩家当前可接触的碎片（基于已解锁题目和层级） */
  getAvailableFragments(player) {
    const unlockedIds = new Set();
    // 收集所有已答对的题目 ID
    for (const key of Object.keys(player.schoolProgress)) {
      for (const qid of player.schoolProgress[key]) {
        unlockedIds.add(qid);
      }
    }

    // 筛选：前置题目已被解锁的题目 -> 作为可刷新碎片
    const available = this.questions.filter(q => {
      if (unlockedIds.has(q.id)) return false;     // 已答对的不再出现
      if (q.prerequisite === null) return true;     // 无前置的始终可用
      return unlockedIds.has(q.prerequisite);       // 前置已解锁
    });

    return available;
  },

  /** 获取问道链的后续题目（同脉络更深层） */
  getDeeperQuestion(currentQuestionId) {
    // 找到以当前题目为前置的题目
    return this.questions.find(q => q.prerequisite === currentQuestionId);
  },
};
