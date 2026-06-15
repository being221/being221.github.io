-- 格言墙
CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT,
  source TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  approved BOOLEAN DEFAULT false,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每日一题 - 问题
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  tags TEXT DEFAULT '[]',
  used BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT true,
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每日一题 - 回答
CREATE TABLE IF NOT EXISTS answers (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT REFERENCES questions(id),
  text TEXT NOT NULL,
  author TEXT,
  device_id TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每日一题 - 每日分配
CREATE TABLE IF NOT EXISTS daily_question (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT REFERENCES questions(id),
  date DATE NOT NULL UNIQUE
);

-- 权限：允许 anon 角色操作
GRANT INSERT, SELECT, UPDATE ON quotes TO anon;
GRANT USAGE ON SEQUENCE quotes_id_seq TO anon;
GRANT INSERT, SELECT, UPDATE ON questions TO anon;
GRANT USAGE ON SEQUENCE questions_id_seq TO anon;
GRANT INSERT, SELECT, UPDATE ON answers TO anon;
GRANT USAGE ON SEQUENCE answers_id_seq TO anon;
GRANT INSERT, SELECT ON daily_question TO anon;
GRANT USAGE ON SEQUENCE daily_question_id_seq TO anon;

-- 插入预置格言（30 条）
INSERT INTO quotes (text, author, source, tags, approved, device_id) VALUES
('万物皆有裂痕，那是光照进来的地方。', '莱昂纳德·科恩', NULL, '["哲学","人生"]', true, 'admin'),
('一个人知道自己为什么而活，就可以忍受任何一种生活。', '尼采', NULL, '["哲学","人生"]', true, 'admin'),
('你能在浪费时间中获得乐趣，就不是浪费时间。', '罗素', NULL, '["哲学","生活"]', true, 'admin'),
('当你凝视深渊时，深渊也在凝视你。', '尼采', NULL, '["哲学","人性"]', true, 'admin'),
('海底月是天上月，眼前人是心上人。', '张爱玲', NULL, '["文学","爱情"]', true, 'admin'),
('所谓自由，不是随心所欲，而是自我主宰。', '康德', NULL, '["哲学","人生"]', true, 'admin'),
('重要的不是治愈，而是带着病痛活下去。', '加缪', NULL, '["哲学","人生"]', true, 'admin'),
('在最深的绝望里，遇见最美的意外。', '几米', NULL, '["文学","人生"]', true, 'admin'),
('悲剧将人生的有价值的东西毁灭给人看，喜剧将那无价值的撕破给人看。', '鲁迅', NULL, '["文学","思考"]', true, 'admin'),
('爱情太短，遗忘太长。', '聂鲁达', NULL, '["文学","爱情"]', true, 'admin'),
('人的真正价值首先决定于他在什么程度上和在什么意义上从自我解放出来。', '爱因斯坦', NULL, '["哲学","人生"]', true, 'admin'),
('我们读诗写诗，并不是因为它们好玩，而是因为我们是人类的一分子。', '《死亡诗社》', NULL, '["电影","文学"]', true, 'admin'),
('未来已经到来，只是分布不均。', '威廉·吉布森', NULL, '["科幻","思考"]', true, 'admin'),
('道可道，非常道；名可名，非常名。', '老子', '《道德经》', '["哲学","东方"]', true, 'admin'),
('知其不可而为之。', NULL, '《论语》', '["哲学","东方"]', true, 'admin'),
('凡所有相，皆是虚妄。', NULL, '《金刚经》', '["哲学","东方"]', true, 'admin'),
('人不能两次踏入同一条河流。', '赫拉克利特', NULL, '["哲学","思考"]', true, 'admin'),
('我思故我在。', '笛卡尔', NULL, '["哲学"]', true, 'admin'),
('存在先于本质。', '萨特', NULL, '["哲学","存在主义"]', true, 'admin'),
('未经审视的人生不值得过。', '苏格拉底', NULL, '["哲学","人生"]', true, 'admin'),
('善良一点，因为每个人都在打一场硬仗。', '柏拉图（伪托）', NULL, '["人生"]', true, 'admin'),
('人要诗意地栖居在这片大地上。', '荷尔德林', NULL, '["哲学","生活"]', true, 'admin'),
('不要温和地走进那个良夜。', '迪伦·托马斯', NULL, '["文学","生命"]', true, 'admin'),
('满地都是六便士，他却抬头看见了月亮。', '毛姆', '《月亮与六便士》', '["文学","人生"]', true, 'admin'),
('生活不止眼前的苟且，还有诗和远方。', '高晓松', NULL, '["人生","文学"]', true, 'admin'),
('Stay hungry, stay foolish.', '乔布斯', NULL, '["人生","英文"]', true, 'admin'),
('好看的皮囊千篇一律，有趣的灵魂万里挑一。', NULL, NULL, '["人生"]', true, 'admin'),
('It is only with the heart that one can see rightly.', '圣-埃克苏佩里', '《小王子》', '["文学","英文"]', true, 'admin'),
('生如夏花之绚烂，死如秋叶之静美。', '泰戈尔', NULL, '["文学","生命"]', true, 'admin'),
('诗和远方，不如门前一树桃花。', NULL, NULL, '["生活","文学"]', true, 'admin')
ON CONFLICT DO NOTHING;

-- 插入预置问题（30 道）
INSERT INTO questions (text, tags, approved, device_id) VALUES
('如果你能回到十年前，你会做什么不同的选择？', '["人生","回忆"]', true, 'admin'),
('什么是真正的自由？你自由吗？', '["哲学","人生"]', true, 'admin'),
('你相信命运吗？为什么？', '["哲学","思考"]', true, 'admin'),
('如果可以给小时候的自己写一封信，你会写什么？', '["人生","回忆"]', true, 'admin'),
('你觉得人活着的意义是什么？', '["哲学","人生"]', true, 'admin'),
('你最庆幸自己做过的一件事是什么？', '["人生","回忆"]', true, 'admin'),
('如果明天是世界末日，你今天会怎么过？', '["想象","人生"]', true, 'admin'),
('你心中完美的周末是什么样子的？', '["生活"]', true, 'admin'),
('有没有一句话改变了你的人生？', '["人生","思考"]', true, 'admin'),
('你觉得友情和爱情最大的区别是什么？', '["人际关系","思考"]', true, 'admin'),
('你最近一次哭是因为什么？', '["人生","回忆"]', true, 'admin'),
('如果不考虑钱，你最想做什么工作？', '["人生","想象"]', true, 'admin'),
('你觉得一个人成熟的标志是什么？', '["思考","人生"]', true, 'admin'),
('你会给正在迷茫的年轻人什么建议？', '["人生","思考"]', true, 'admin'),
('有没有一本书改变过你？是哪本？', '["文学","思考"]', true, 'admin'),
('你愿意用十年的生命换一次回到过去的机会吗？', '["想象","人生"]', true, 'admin'),
('你最想和谁吃一顿饭？（古今中外都可以）', '["想象","人际关系"]', true, 'admin'),
('如果有一种超能力可以拥有三天，你想要什么？', '["想象"]', true, 'admin'),
('你觉得幸福可以被量化吗？你的幸福指数是多少？', '["哲学","生活"]', true, 'admin'),
('你相信一见钟情还是日久生情？', '["爱情","人际关系"]', true, 'admin'),
('如果你知道自己只能再活一年，你会改变现在的生活方式吗？', '["人生","思考"]', true, 'admin'),
('你认为什么是善良？人可以过于善良吗？', '["哲学","人性"]', true, 'admin'),
('你觉得自己身上最宝贵的品质是什么？', '["人生","思考"]', true, 'admin'),
('除了人类，你最想成为什么动物？为什么？', '["想象","生活"]', true, 'admin'),
('你对 AI 的看法是乐观还是悲观？', '["科技","思考"]', true, 'admin'),
('你最想念童年里的什么？', '["回忆","生活"]', true, 'admin'),
('什么样的时刻让你觉得生活是值得的？', '["人生","思考"]', true, 'admin'),
('如果你可以删除一段记忆，你会删掉吗？删哪段？', '["想象","人生"]', true, 'admin'),
('你觉得孤独是好事还是坏事？', '["思考","人生"]', true, 'admin'),
('今天你学到了什么新东西？', '["生活","思考"]', true, 'admin')
ON CONFLICT DO NOTHING;
