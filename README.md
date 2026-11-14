# Marp Markdown Pattern Kit

ユーザー提供の技術解説スライドを参考にした、**Markdown中心**のMarpテンプレートです。

## ファイル構成

| ファイル | 目的 |
|---|---|
| `01-common-rules.md` | 共通ルール、対応表、運用上の注意 |
| `04-container-notation.md` | 次期 `:::` コンテナ表記仕様（設計案。描画処理は未実装） |
| `02-slide-patterns.md` | 用途別の16種類のスライド見本（Marp形式） |
| `03-object-patterns.md` | 再利用するオブジェクトの見本（水平・垂直・入れ子・空白カードを含む12種、Marp形式） |
| `theme.css` | 共通テーマ＋各スライド構成のCSS |
| `.vscode/settings.json` | Marp for VS Codeでテーマを認識させる設定 |

**新しい表記ルール案**：カード・横／縦配置・入れ子・白いキャンバスなどの複数行・構造的な記法を `:::` コンテナに集約し、横並びは `horizontal` / `h`、縦並びは `vertical` / `v` の両方に対応します。単語・短文の色付きラベルは `[注意]{.tone-chip .tone-yellow-dark}` のようなインラインの囲み記法を使用します。仕様は [`04-container-notation.md`](./04-container-notation.md) にまとめています。**現時点では設計案であり**、下記の既存スライドや公式VSCodeプレビューは従来のHTML方式です。 `:::` で描画するにはMarkdown-it拡張または変換処理が必要です。

## VSCodeでの使用方法

1. このフォルダをVSCodeで開く。
2. 公式の「Marp for VS Code」拡張機能を使用する。
3. `02-slide-patterns.md` を開き、Markdownプレビューを表示する。
4. 必要なスライドをコピーし、本文や `div` の配置を編集する。表紙・章扉などは `<!-- _class: ... -->` も編集する。

`theme.css` は `.vscode/settings.json` に登録済みです。同時に、ボックスの `div` を使えるよう `markdown.marp.enableHtml` も有効化しています。独立したMarkdownファイルで使うときも、先頭に後述のフロントマターを付けます。

通常スライドの背景色は `<!-- _class: background gray -->`（ヘッダー・本文とも薄グレー）と `<!-- _class: background white -->`（両方とも白）で選べます。未指定時は白です。ヘッダーと本文の境界線は表示しません。表紙と章扉は左右2分割で、章扉の左背景は濃紺（`#1B2B45`）です。

`02-slide-patterns.md` の03〜16には背景指定を明記しています。04番は `background white`、その他の通常スライドは `background gray` の見本です。

### オブジェクトの色を選ぶ

`theme.css` には青緑・水色・グレー・赤・モノクロ・黄色の6系統それぞれに濃淡2種（計12色）を定義しています。クラス一覧は `01-common-rules.md` を参照してください。

```md
> <span class="tone-token tone-coral-light"></span> **● カードのタイトル**
>
> カードの背景が薄い赤に変わります。

<span class="tone-chip tone-turquoise-dark">重要</span>
```

色指定用の空の `span` は画面に表示されません。追加の拡張機能や前処理は不要です。

カードに薄い影を付けるときだけ、引用内に `<span class="hover"></span>` を入れます。影は左右と下だけに付き、上には付きません。省略したカードには影が付きません。ボックス内の全カードに影を付ける場合は `class="box horizontal hover"` のように指定できます。

濃色カードは白文字が読める深い色に自動調整されます（ラベルの色値とは一部異なります）。淡色カードは薄い背景・同系統の濃い文字色を使用し、枠線を表示しません。

### 汎用カードの並べ方

`<div class="box horizontal">`（横並び・均等分割）と `<div class="box vertical">`（縦並び・全幅）で配置し、カードはMarkdownの引用 `>` で記述します。`div` 同士を入れ子にできるため、横2列の片側に縦3枚を並べるなど、自由な組み合わせが可能です。横3枚なら3等分で、固定幅はありません。色は従来の `tone-token` を使用できます。

```md
<div class="box horizontal">

> **カードA**
>
> Markdownの本文

<div class="box vertical">

> **カードB**

> **カードC**

</div>

</div>
```

`div` と Markdown カードの間には空行が必要です。中身が `>` だけのカードは背景・枠線・影のない透明なスペーサーとして等分幅を確保します。親ボックスに `hover` を付けても空白カードには影が付きません。実際の見本は `03-object-patterns.md` の09〜12を参照してください。

### 16スライドの共通化

`02-slide-patterns.md` は16スライド構成です。残るスライド専用レイアウトクラスは `cover`、`chapter`、`message`、`steps-vertical` の4つのみです。`bullets` と `summary` は通常のMarkdownで表現します。その他のレイアウトには `medium`、`tall`、`center`、`equal`、`flow` を共通装飾として必要な場合だけ追加します。

表紙と章扉は、左40%の `hero-media` にロゴ・図、右60%の `hero-copy` にMarkdownの `#`（タイトル）と `##`（サブタイトル）を記述します。章扉だけ左が濃紺背景です。実際のロゴ・図に差し替えるときは、左側のプレースホルダーをMarkdownの画像記法に置き換えます。連続した見出しは余白なしの一塊になり、本文を挟むと通常の余白に戻ります。`message` の強調文字は46pxです。

白いキャンバスは、通常スライドの本文に `<div class="box vertical paper">` を置けば使用できます（専用スライドはありません）。スライド幅95%、外側の上下余白とボックス内側の上下左右余白は32px。標準は影なしで、影が必要なら `class="box vertical paper hover"` とします。

### スライド下端の進捗バー

下端の濃紺バー（`#1B2B45`）は **現在のスライド番号 ÷ 総枚数** に応じて左から右へ伸びます（全幅の淡いグレーのラインが背景）。最終スライドで100%になります。`paginate: true` が必要ですが、ページ番号の文字はCSSで非表示にしています。数値の自動計算はChrome 133以降のCSS機能を利用するため、古いプレビュー・出力環境ではバーが伸びない場合があります。

```yaml
---
marp: true
theme: blackline
size: 16:9
paginate: true
footer: 'YOUR TEAM / 2026'
---
```

## CLIでの出力例

Marp CLIを利用できる環境で、このフォルダから実行します。

```bash
npx @marp-team/marp-cli 02-slide-patterns.md --theme theme.css --html -o slides.pdf
```

HTML出力に変更する場合は `slides.pdf` を `slides.html` に変更します。

## 今回の方針

- グラフ専用レイアウトは除外。表・カード・アイコン的な記号・フローは対象。
- 部品の組み合わせはMarkdownで行い、外観はCSSでまとめて管理。
- フロントマターとMarkdownのカードを基本とし、色指定では小さな `span`、縦横の配置では `div` のみを併用する。
- テキストはデモ用です。実際の業務資料では、用途に合うレイアウトを選び、内容を入れ替えます。

参考： [Marp for VS Code公式](https://github.com/marp-team/marp-vscode) / [Marpitのディレクティブ](https://github.com/marp-team/marpit/blob/main/docs/directives.md)

