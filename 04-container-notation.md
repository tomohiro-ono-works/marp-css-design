# Marp表記ルール v2 — `:::` コンテナ方式（設計案）

> 状態：**実装済み**。`02-slide-patterns.source.md` と `03-object-patterns.source.md` が編集用、通常の `.md` は `npm run build` で生成するMarp公式プレビュー用です。`:::` は同梱のNode.js変換プログラムでHTMLへ変換します。

## 1. 基本方針

- **文章の意味**はMarkdownで表す：`#`、`##`、`###`、`**太字**`、段落、リスト、表、コード、リンク、画像。
- **複数行・構造を持つ部品**は `:::` コンテナで表す：カード、色、影、縦横分割、入れ子、白いキャンバス、空白、表紙・章扉のパネル。
- **単語や短文に適用する装飾**はインラインの囲み形式で表す。色付きラベルは `[注意]{.yellow-dark}` のように、色名だけを指定する。ラベルは親カードから色を継承せず、**常にラベル自身に指定した色**を使用する。
- **既存の長い表記を維持し、省略表記も追加する**：`horizontal` と `h`、`vertical` と `v` はそれぞれ同じ意味。
- **スライド単位の設定**はMarp標準を維持する：YAMLフロントマター、`---`、`<!-- _class: ... -->`。
- `div` と空の `span` の直接記述は新規原稿では原則廃止する。
- コンテナ名と修飾子は半角英数字・ハイフンで統一する。修飾子の順番は、**色 → 影／サイズ／レイアウト**を基本とする。

## 2. 既存記法とv2記法の対応

| 対象 | 現行 | v2の原稿 | 変換先の考え方 |
|---|---|---|---|
| カード | 引用 `>` | `::: card` | `<div class="card">` |
| カードの色 | `<span class="tone-token tone-turquoise-light"></span>` | `::: card turquoise-light` | 当該カード自身に色クラス |
| カードの影 | `<span class="hover"></span>` | `::: card turquoise-light hover` | カード自身に`hover`クラス |
| 横並び | `<div class="box horizontal">` | `::: horizontal` または `::: h` | `<div class="box horizontal">` |
| 縦並び | `<div class="box vertical">` | `::: vertical` または `::: v` | `<div class="box vertical">` |
| コンテンツキャンバス | `<div class="box vertical paper">` | `::: paper` | `<div class="box vertical paper">` |
| 空白カード | 中身のない `>` | `::: blank` | 空のカード／占位要素 |
| 色付きラベル | `<span class="tone-chip tone-yellow-dark">注意</span>` | `[注意]{.yellow-dark}` | `<span class="tone-chip tone-yellow-dark">注意</span>` |
| 表紙・章扉の構成 | `.box.horizontal.hero`、`.hero-media`、`.hero-copy` | `::: hero`、`::: hero-media`、`::: hero-copy` | 従来の専用レイアウト |
| スライド背景 | `<!-- _class: background gray -->` | **変更なし** | Marpディレクティブ |
| 専用スライド | `<!-- _class: cover -->`など | **変更なし** | Marpディレクティブ |
| 通常のラベル | `` `ラベル` `` | **変更なし** | CSSによるピル型表示 |

`card`、`horizontal` / `h`、`vertical` / `v`、`paper`、`blank`、`hero`、`hero-media`、`hero-copy` は**プロジェクト独自のコンテナ名・省略形**であり、Marp標準の構文ではない。インラインラベルの `[文字]{.色名}` も独自記法で、同梱の変換プログラムがHTMLの `span` に変換する。ラベルは色名から変換時に `tone-chip tone-<色名>` のHTMLクラスを生成する。

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

先頭を `:::: vertical` または `:::: v` に変更すれば縦積みになる。横並びは `horizontal` または `h`、縦並びは `vertical` または `v` を使用できる。**長い表記も廃止しない**。横は子要素を等幅分割し、縦は全幅で縦積みする。

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

**入れ子のルール**：外側ほどコロンの個数を多くする。上記は外から6個 → 5個 → 4個 → 3個。開始と終了は同じ数で閉じる。**同梱コンパイラーは開始・終了の個数一致を検証**する。

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

### 3.5 色付きラベル（インライン形式）

~~~md
[注意]{.yellow-dark}

ステータスは [完了]{.turquoise-light}、優先度は [高]{.coral-dark} です。

::: card turquoise-light

**● カードA**

[重要]{.coral-dark} [確認中]{.yellow-light}

:::
~~~

- 単語・短文に適用する装飾は `[文字]{.色名-dark/light}` という**囲み記法**に統一する。`tone-` および `tone-chip` の記述は不要。
- `::: chip` は**採用しない**。インラインで複数のラベルを同一行に書いたり、文章の途中に配置したりできる。
- **色はオブジェクト単位で独立指定**する。親のカードが `turquoise-light` であっても、ラベル `[重要]{.coral-dark}` は赤色となる。`.tone-dark` / `.tone-light` のような親色継承の省略表記は採用しない。
- 変換時には `[重要]{.coral-dark}` を `<span class="tone-chip tone-coral-dark">重要</span>` に写像する。表示スタイルは既存の `tone-chip` と同等とする。
- 既存のインラインコード `` `ラベル` `` は、無指定の通常ラベルとしてそのまま利用できる。
- `[文字]{.色名}` は標準Markdownではない。同梱の `scripts/build-marp.mjs` がHTMLへ変換するため、外部のMarkdown-itプラグインは不要。

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

### 3.7 省略表記の使用例

~~~md
:::: h medium

::: card aqua-light
**左カード**
:::

::: card coral-light
**右カード**
:::

::::

:::: v

::: card turquoise-light
**上カード**
:::

::: card yellow-light
**下カード**
:::

::::
~~~

`h` と `horizontal`、`v` と `vertical` は**同一のレイアウトを生成**する。文書内でどちらを使用してもよい。

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
| 色付きラベル | `[文字]{.色名-dark/light}`。カードと独立して色を選択。`tone-` 接頭辞不要 |
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

## 6. 実装済みの構成・互換性

1. **編集対象**：`02-slide-patterns.source.md`（16スライド）および `03-object-patterns.source.md`（12部品見本）。
2. **変換プログラム**：`scripts/build-marp.mjs`。ブロックコンテナとインラインラベルをMarp互換のMarkdown＋HTMLに変換する。Node.js 18以降で動作し、追加パッケージは不要。
3. **手動ビルド**：`npm run build`。生成先は `02-slide-patterns.md` と `03-object-patterns.md`。既存の成果物を上書きするため、編集は必ず `*.source.md` に対して行う。
4. **自動更新**：`npm run watch`。編集用ファイルを保存するたびにプレビュー用Markdownが再生成される。VSCodeの「タスクの実行」から `Marp: Watch preview` を選択する方法もある。
5. **Marp公式プレビュー**：生成された `02-slide-patterns.md` / `03-object-patterns.md` をVSCodeの公式Marpプレビューで開く。標準Marpでは編集元の `:::` を直接描画できない点に注意。
6. **PDF出力**：`npm run build` の後、`npx @marp-team/marp-cli 02-slide-patterns.md --theme theme.css --html -o slides.pdf` を実行。
7. **色の独立性**：変換先カードには自身の `tone-色名` クラスを割り当てる。ラベルも `tone-chip tone-色名` クラスを直接持つ。親カードの色からラベルの色を推測・継承しない。
8. **互換性**：`theme.css` には従来の引用 `>` とHTML `div` 用のCSSも残し、旧形式の原稿を読み込めるようにする。
9. **検証**：`npm test` で、`h/v` と正式表記の同値、入れ子、ラベル色の独立性、空白、構文エラー、コードフェンス保護を確認できる。

\n## 7. 参照元

- [marp-css-design / 01-common-rules.md](https://github.com/tomohiro-ono-works/marp-css-design/blob/main/01-common-rules.md)
- [marp-css-design / 02-slide-patterns.md](https://github.com/tomohiro-ono-works/marp-css-design/blob/main/02-slide-patterns.md)
- [marp-css-design / 03-object-patterns.md](https://github.com/tomohiro-ono-works/marp-css-design/blob/main/03-object-patterns.md)
- [Marp CLI — Configuration](https://github.com/marp-team/marp-cli#configuration-file)
- [Marp for VS Code](https://github.com/marp-team/marp-vscode)