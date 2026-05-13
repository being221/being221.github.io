# Pre-commit Hook 设置说明

## 功能概述
项目已配置 pre-commit hook，在每次执行 `git commit` 命令之前自动触发代码格式检查。

## 触发条件
- 当执行 `git commit` 相关命令时会自动触发
- 检查暂存区的文件（已添加到暂存区的文件）

## 检查内容
1. **Prettier 格式检查**：
   - 检查文件类型：JavaScript (.js, .jsx)、TypeScript (.ts, .tsx)、CSS (.css)、JSON (.json)、Markdown (.md)、HTML (.html)
   - 使用 `prettier --check` 进行代码格式检查
   - 如果发现格式问题，会阻止提交（除非修复格式问题）

2. **ESLint 代码检查**：
   - 检查文件类型：JavaScript (.js, .jsx)、TypeScript (.ts, .tsx)
   - 使用 `eslint --fix` 自动修复可以修复的问题
   - 如果发现无法修复的问题，会阻止提交

## 使用前提
1. 需要安装 Prettier：
   ```bash
   npm install -D prettier
   ```

2. 需要安装 ESLint（可选）：
   ```bash
   npm install -D eslint
   ```

## 配置文件位置
`.claude/settings.json`

## 临时禁用 Pre-commit Hook
如果需要临时跳过代码格式检查，可以使用以下方法之一：

### 方法1：使用 --no-verify 参数
```bash
git commit --no-verify -m "your commit message"
```

### 方法2：禁用 Claude Code hooks
在执行 git 命令前暂时禁用 hooks：
```bash
# 编辑 settings.json，将 "PreToolUse" 改为其他名称或删除
```

## 自定义配置
如需修改检查的文件类型或工具，可以编辑 `.claude/settings.json` 文件中的命令部分。