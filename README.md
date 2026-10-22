# The Royal Atelier · 皇家维多利亚马车

基于 Three.js 的交互式三维展示网站，包含制图纸风格界面、三维马车、技术三视图与材质色板。

## 在线访问

https://jeef1109.github.io/victorian-carriage/

推送到 `main` 分支后，GitHub Actions 会自动构建并部署至 GitHub Pages。

## 启动

安装 Node.js 22 和 pnpm 10，然后运行：

```sh
pnpm install
pnpm dev
```

默认地址：http://127.0.0.1:5174

## 构建

```sh
pnpm build
pnpm preview
```

静态产物位于 `dist/`，部署时将此目录作为站点根目录。需要 HTTP 服务，请勿直接双击 index.html。

## 已实现

- 真实三维轨道旋转、滚轮/触控缩放与四个预设视角
- 整扇铰链车门、可下降车窗、暖色车灯与全页昼夜模式
- 车身实际向前行驶、镜头平滑跟随，石板路与车轮转角同步；含启停缓动及轻微悬挂起伏
- 自动环绕、线框模式
- 车顶、车厢、轮组结构分解与还原
- 车身、轮饰、金属、软垫四组材质色板与重置
- 从同一三维模型渲染的技术三视图
- 随三维位置更新的注释引线与工艺详情
- 原始参考照片弹窗、响应式移动端布局、键盘焦点与减少动态偏好支持

## 素材说明

`public/carriage-reference.png` 为用户提供的参考图，仅用于参考弹窗。
`src/carriage.js` 为程序化重建模型，非原视频/照片的原始三维资产。雕花与细节是艺术化重构，三视图标注尺寸为示意，不是实物测绘。
开发参考截图与视频不包含在公开仓库中。

英文字体使用 Cormorant Garamond，中文使用 Noto Serif SC；离线时回退至系统衬线字体。
