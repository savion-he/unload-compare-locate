# CLAUDE.md

本文件为 Claude Code 提供本项目的背景信息。

---

## 1. 项目是什么

卸车数据集指标对比工具，供 XYZ Robotics 算法团队使用，用于记录、管理和对比卸车算法在不同版本、不同硬件配置下的测试指标，支持版本间横向对比与历史趋势查看。

技术栈：Node.js 18+、Express 4、better-sqlite3、React 18（CDN，无构建步骤）

---

## 2. 关键文件

| 路径 | 用途 |
|------|------|
| `server.js` | Express 入口，提供静态文件服务和全部 REST API |
| `db.js` | SQLite 初始化，建表，导出 db 实例 |
| `public/index.html` | 单文件前端，所有 UI 逻辑、组件、样式全在此一个文件 |
| `data/records.db` | SQLite 数据库文件，运行时自动生成，已 gitignore |
| `unload-compare.service` | systemd 服务配置，用于工控机开机自启 |

---

## 3. 常用命令

```bash
# 安装依赖
npm install

# 启动服务（开发）
node server.js
# 本机访问：http://localhost:3000
# 局域网访问：http://<工控机IP>:3000

# 注册为系统服务（生产部署）
sudo cp unload-compare.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now unload-compare

# 查看服务日志
sudo journalctl -u unload-compare -f

# 重启服务（修改 server.js / db.js 后需执行）
sudo systemctl restart unload-compare
```

---

## 4. 数据模型

### SQLite 表结构（`records` 表）

```sql
CREATE TABLE IF NOT EXISTS records (
  id       TEXT PRIMARY KEY,   -- Date.now() 生成的时间戳字符串
  env      TEXT NOT NULL,      -- JSON 字符串，存环境配置
  data     TEXT NOT NULL,      -- JSON 字符串，存解析后的指标数值
  raw      TEXT,               -- 原始粘贴文本
  saved_at TEXT NOT NULL       -- 入库时间，格式：2026-05-20 14:30
)
```

### `env` 字段结构示例

```json
{
  "robotModel": "Rocky One",
  "placeType": "非指定位姿放置",
  "cpu": "i9-13900K",
  "gpu": "RTX 4060 Ti",
  "maxVer": "1.13.0 pre 52",
  "mapVer": "20260422"
}
```

### `data` 字段结构示例

```json
{
  "total_num": 32682,
  "mf_fail_times": 12,
  "task_avg_time": 3.14,
  "_time": "2026-04-22 00:00 to 2026-04-23 12:00",
  "_dataset": "dataset_v3"
}
```

> `_` 开头的字段（`_time`、`_dataset`）为元信息，不参与指标对比计算。所有指标字段由 `public/index.html` 中的 `FIELD_META` 常量定义。

---

## 5. API 接口

| 方法   | 路径           | 说明     |
|--------|----------------|----------|
| GET    | `/records`     | 获取所有记录（按时间倒序） |
| POST   | `/records`     | 新增记录，body: `{ env, data, raw }` |
| PUT    | `/records/:id` | 更新记录，body: `{ env, data, raw }` |
| DELETE | `/records/:id` | 删除记录 |

---

## 6. 开发注意事项

**无构建步骤**：前端 JSX 由 Babel Standalone 在浏览器中实时编译，不需要也不能运行 `npm run build`。修改 `public/index.html` 后刷新浏览器即可生效。

**无热重载**：修改 `server.js` 或 `db.js` 后需手动重启服务（`node server.js` 或 `systemctl restart`）。

**字段名映射**：SQLite 中存储为 `saved_at`（下划线），`server.js` 的 GET 接口返回时统一映射为 `savedAt`（驼峰）供前端使用。新增字段时注意保持一致。

**删除密码**：删除记录的密码 `robot2018sh` 硬编码在 `public/index.html` 的 `handleDelete` 函数中。

**无测试套件**：当前项目没有自动化测试，修改后需手动验证核心流程（新增、编辑、删除、对比）。

**防火墙**：首次部署需放行端口：`sudo ufw allow 3000`。

**服务配置**：`unload-compare.service` 中的 `User` 和 `WorkingDirectory` 需根据实际部署机器的用户名和路径修改。
