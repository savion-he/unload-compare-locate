# 卸车数据集指标对比工具

用于记录、管理和对比卸车算法在不同数据集上的测试指标。

## 功能

- **记录管理**：新增、编辑、删除测试记录，支持按机器人型号、放置方式、CPU/GPU 配置分类
- **指标对比**：选择基准版本与测试版本，按维度（基础/失败/耗时/超时/质量）对比各项指标变化
- **趋势图**：查看单项指标在历史版本中的变化趋势

## 架构

```
unload-compare/
├── server.js               # Express 服务（静态文件 + REST API）
├── db.js                   # SQLite 初始化
├── public/
│   └── index.html          # 前端（React via CDN，无构建步骤）
├── data/
│   └── records.db          # SQLite 数据库（运行时自动生成）
├── package.json
└── unload-compare.service  # systemd 服务配置
```

## 部署

### 环境要求

- Node.js 18+
- Ubuntu（工控机本地部署）

### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd unload-compare

# 安装依赖
npm install
```

### 启动（临时）

```bash
node server.js
# 浏览器访问 http://localhost:3000
```

### 注册为系统服务（开机自启）

编辑 `unload-compare.service`，将 `User` 和 `WorkingDirectory` 改为实际用户名和路径：

```ini
User=your-username
WorkingDirectory=/path/to/unload-compare
```

然后注册并启动：

```bash
sudo cp unload-compare.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable unload-compare
sudo systemctl start unload-compare
```

查看运行状态：

```bash
sudo systemctl status unload-compare
```

## API

| 方法   | 路径           | 说明     |
|--------|----------------|----------|
| GET    | `/records`     | 获取所有记录 |
| POST   | `/records`     | 新增记录 |
| PUT    | `/records/:id` | 更新记录 |
| DELETE | `/records/:id` | 删除记录 |

## 指标说明

| 维度 | 指标 |
|------|------|
| 基础 | 总数据集数量、实际执行次数、无效数据量 |
| 失败 | 运动规划失败、二次规划失败、抓放处理失败、超时次数 |
| 耗时 | 任务/单次/抓放/执行平均耗时，MP 超过 PP 耗时比 |
| 超时 | MP 任务/单次超时次数、PP 超时次数 |
| 质量 | 碰撞次数、每次平均抓取箱数、多抓率、侧抓拉出次数 |
