# Marp表記ルール v2 — `:::` コンテナ方式（設計案）

> 状態：**表記仕様の整理案**。既存の `theme.css`、`02-slide-patterns.md`、`03-object-patterns.md` はまだ変換していない。`:::` の描画には拡張パーサーまたは前処理が必要。

## 1. 基本方針

- **文章の意味**はMarkdownで表す：`#`、`##`、`###`、`**太字**`、段落、リスト、表、コード、リンク、画像。
- **部品と配置**は `:::` コンテナで表す：カード、色、影、縦横分割、入れ子、白いキャンバス、色付きラベル、空白、表紙・章扉のパネル。
- **スライド単位の設定**はMarp標準を維持する：YAMLフロントマター、`---`、`<!-- _class: ... -->`。
- `div` と空の `span` の直接記述は新規原稿では原則廃止する。
- コンテナ名と修飾子は半角英数字・ハイフンで統一する。修飾子の順番は、**色 → 影／サイズ／レイアウト**を基本とする。

## 2. 既存記法とv2記法の対応

| 対象 | 現行 | v2の原稿 | 変換先の考え方 |
|---|---|---|---|
| カード | 引用 `>` | `::: card` | `<blockquote class="card">` |
| カードの色 | `<span class="tone-token tone-turquoise-light"></span>` | `::: card turquoise-light` | 当該カード自身に色クラス |
| カードの影 | `<span class="hover"></span>` | `::: card turquoise-light hover` | カード自身に`hover`クラス |
| 横並び | `<div class="box horizontal">` | `::: horizontal` | `<div class="box horizontal">` |
| 縦並び | `<div class="box vertical">` | `::: vertical` | `<div class="box vertical">` |
| コンテンツキャンバス | `<div class="box vertical paper">` | `::: paper` | `<div class="box vertical paper">` |
| 空白カード | 中身のない `>` | `::: blank` | 空のカード／占位要素 |
| 色付きラベル | `<span class="tone-chip tone-yellow-dark">注意</span>` | `::: chip yellow-dark` | ラベル用要素 |
| 表紙・章扉の構成 | `.box.horizontal.hero`、`.hero-media`、`.hero-copy` | `::: hero`、`::: hero-media`、`::: hero-copy` | 従来の専用レイアウト |
| スライド背景 | `<!-- _class: background gray -->` | **変更なし** | Marpディレクティブ |
| 専用スライド | `<!-- _class: cover -->`など | **変更なし** | Marpディレクティブ |
| 通常のラベル | `` `ラベル` `` | **変更なし** | CSSによるピル型表示 |

`card`、`horizontal`、`vertical`、`paper`、`blank`、`chip`、`hero`、`hero-media`、`hero-copy` は**プロジェクト独自のコンテナ名**であり、Marp標準の構文ではない。

## 3. 基本コンテナ

### 3.1 カード

~~~md
::: card turquoise-light hover

**● カードの見出し**

説明文は普通のMarkdownで記載します。

- 箇条書きA
- 箇条書きB

`ラベルA` `ラベルB`

:::
~~~

- `card` だけなら通常の白いカード。
- `turquoise-light` は色。`hover` を付けた場合のみ影を表示する。
- 色はカード自身に適用し、**子カードの色を親カードに伝播させない**。
- 薄色カードは枠線なし。濃色カードは白文字で十分なコントラストを確保する。

### 3.2 横・縦の配置

~~~md
:::: horizontal medium

::: card aqua-light
**● 左**

説明A
:::

::: card coral-light
**● 右**

説明B
:::

::::
~~~

先頭を `:::: vertical` に変更すれば縦積みになる。`horizontal` は子要素を等幅分割し、`vertical` は全幅で縦積みする。

修飾子は既存の `medium`（中程度の高さ）、`tall`（大きな高さ）、`center`（中央揃え）、`equal`（縦方向の均等割り）、`flow`（矢印付き横フロー）、`hover`（影の一括指定）を引き継ぐ。`flow` は基本的に横並びに使用する。

### 3.3 入れ子：親カード → 横並び → 右側だけ縦並び

~~~md
:::::: card turquoise-light hover

**● 親カード**

親カードの説明

::::: horizontal

:::: card aqua-light
**● 左カード**

説明A
::::

:::: vertical

::: card coral-light
**● 右上**

説明B
:::

::: card yellow-light
**● 右下**

説明C
:::

::::

:::::

::::::
~~~

**入れ子のルール**：外側ほどコロンの個数を多くする。上記は外から6個 → 5個 → 4個 → 3個。開始と終了は同じ数で閉じる。`markdown-it-container` は終了フェンスに開始フェンス以上の長さを要求するため、内側を短くする。

### 3.4 空白カード・大きな白いキャンバス

~~~md
:::: horizontal

::: card aqua-light
**左**
:::

::: blank
:::

::: card coral-light
**右**
:::

::::

::: paper hover

**白い大きなキャンバス**

文章とカードを配置できます。

:::
~~~

- `blank` は均等分割の幅だけを確保し、背景・枠線・影を表示しない。
- `paper` はスライド幅95%、左右余白各2.5%、内側余白32px。標準は影なし。`hover` で影を付ける。

### 3.5 色付きラベル

~~~md
::: chip yellow-dark
注意
:::
~~~

色付きラベルはプロジェクト独自の `chip` コンテナを利用する。通常のラベルは従来どおりインラインコード `` `ラベル` `` を推奨する。

> 補足：`:::` はブロック記法なので、色付きラベルを**文章の途中にインラインで挿入**する構文ではない。表示上はCSSで小さいラベルにする。複数ラベルの横並びは実装時に検証する。

### 3.6 表紙・章扉

~~~md
<!-- _class: chapter -->

:::: hero

::: hero-media

**［図を配置］**

:::

::: hero-copy

# 第1章 基本設計

## 構造と見た目を分離する

:::

::::
~~~

`cover` と `chapter` の左右比率は左40%、右60%。章扉の左パネルは濃紺。既存のMarpディレクティブを維持する。

## 4. 維持するMarkdown・Marp記法

- 見出し：`#`（スライドタイトル）、`##`、`###`。タイトル左の濃色縦バーをCSSで表示する。
- 通常スライドではタイトル直後の段落がリード文。本文との境界線は表示しない。リード文の下に16pxの余白。
- 強調：`**文字**`、箇条書き：`-`、番号付き：`1.`。表、コードフェンス、リンク、画像も通常のMarkdownを使用。
- スライド分割：`---`。
- スライドクラス：`<!-- _class: message background gray -->` など。`message`、`steps-vertical`、`object-callout`、`object-guide`、`dense` を引き続き使用する。
- フロントマター：`marp: true`、`theme: blackline`、`size: 16:9`、`paginate: true`、`footer: ...`。

## 5. デザイン仕様（現行を維持）

| 項目 | 仕様 |
|---|---|
| 通常スライドの背景 | 白 `#FFFFFF`（標準）、薄グレー `#FBFBFB`（`background gray`） |
| ヘッダー／本文 | 同じ背景色。境界線なし |
| 影 | `hover` 指定時のみ左右・下に表示。上側には出さない。空白カードは影なし |
| ボックス | 横は等幅、縦は全幅。任意に入れ子可能 |
| 表紙／章扉 | 左40%／右60%。章扉の左は濃紺 `#1B2B45` |
| 進捗バー | 下端の濃紺 `#1B2B45`。スライド番号／総枚数に応じた幅 |
| 白キャンバス | スライド幅95%、パディング32px、標準は影なし |
| 見本 | スライド16種類・オブジェクト12種類を維持 |

### カラーパレット（6系統 × 濃淡2）

| 色系統 | dark | light |
|---|---|---|
| 青緑（turquoise） | `#009287` | `#EDFDFC` |
| 水色（aqua） | `#44B3BA` | `#D8F4F1` |
| グレー（gray） | `#95999A` | `#F6F6F6` |
| 赤（coral） | `#DE5251` | `#FBE6E5` |
| モノクロ（mono） | `#171717` | `#D9D9D9` |
| 黄色（yellow） | `#EAE68C` | `#FAF8E0` |

実際の濃色カードの背景は白文字が読めるよう、既存 `theme.css` で一部をより濃い色に補正している。

## 6. 実装要件・互換性

1. **標準のMarpやCSSだけでは `:::` を解釈できない。** `markdown-it-container` 等でコンテナを定義する必要がある。
2. **Marp CLI** は `marp.config.mjs` のカスタムエンジンからMarkdown-itプラグインを登録できる。`card`、`horizontal`、`vertical` などを各クラス・HTML要素に写像する。
3. **Marp for VS Code公式プレビュー** はユーザー独自のMarkdown-itプラグインを読み込めない。従来の公式プレビューを維持するには、`:::` 原稿を従来のMarp互換Markdownへ変換してからプレビューする工程が必要。
4. CSSの `:has(.tone-token)` のような子孫検索は、入れ子カードで親に子の色が伝播する問題がある。新形式は**自身のカードクラスのみで配色**する。
5. この文書は**表記ルールの提案**であり、`::: card` の描画・プレビュー・CLIエクスポートが現行リポジトリで既に動くことを意味しない。

## 7. 参照元

- [marp-css-design / 01-common-rules.md](https://github.com/tomohiro-ono-works/marp-css-design/blob/main/01-common-rules.md)
- [marp-css-design / 02-slide-patterns.md](https://github.com/tomohiro-ono-works/marp-css-design/blob/main/02-slide-patterns.md)
- [marp-css-design / 03-object-patterns.md](https://github.com/tomohiro-ono-works/marp-css-design/blob/main/03-object-patterns.md)
- [Marp CLI — Configuration](https://github.com/marp-team/marp-cli#configuration-file)
- [markdown-it-container](https://github.com/markdown-it/markdown-it-container)
- [Marp for VS Codeのプラグイン制限（公式ディスカッション）](https://github.com/orgs/marp-team/discussions/432)