---
marp: true
theme: blackline
size: 16:9
paginate: true
footer: 'Marp Object Patterns / 2026'
---

<!-- _class: object-guide -->

# 01｜見出し・リード文

スライド共通の見出し表現です。この段落がリード文になります。

## ● 中見出し

説明文では、**重要な語句**を太字にして強調します。

### 小見出し

必要な補足だけを短く記述します。

---

<!-- _class: object-guide -->

# 02｜カード

`::: card` のコンテナ記法でカードを作成します。淡色カードは枠線なしです。

<div class="card tone-turquoise-light hover">

**● カードの見出し（影あり）**

説明文をここに記述します。1〜3行を目安にします。

`ラベルA` `ラベルB`

</div>

<div class="card tone-turquoise-dark">

**● 濃い色のカード**

同じ記法でカードを追加できます。

</div>

---

<!-- _class: object-guide -->

# 03｜ラベル・強調

短い分類語や補助的な情報は、ピル型のラベルで表現します。

**6色のカラーパレット（濃色・淡色）**

<span class="tone-chip tone-turquoise-dark">青緑・濃</span> <span class="tone-chip tone-turquoise-light">青緑・淡</span>
<span class="tone-chip tone-aqua-dark">水色・濃</span> <span class="tone-chip tone-aqua-light">水色・淡</span>
<span class="tone-chip tone-gray-dark">灰色・濃</span> <span class="tone-chip tone-gray-light">灰色・淡</span>
<span class="tone-chip tone-coral-dark">赤・濃</span> <span class="tone-chip tone-coral-light">赤・淡</span>
<span class="tone-chip tone-mono-dark">黒・濃</span> <span class="tone-chip tone-mono-light">黒・淡</span>
<span class="tone-chip tone-yellow-dark">黄・濃</span> <span class="tone-chip tone-yellow-light">黄・淡</span>

- **太字**：文中の重要な概念に使う。
- `ラベル`：カテゴリやステータスの表示に使う。
- 通常文：説明を読みやすく保つ。

---

<!-- _class: object-guide -->

# 04｜表・分類一覧

Markdown標準の表を、黒罫線・薄灰色の見出しで表示します。

| 項目 | 内容 | 状態 |
|---|---|---|
| データ取得 | 入力ファイルの読み込み | `完了` |
| データ変換 | 形式・型の統一 | `進行中` |
| 検証 | 入力と出力の比較 | `未着手` |

---

<!-- _class: steps-vertical -->

# 05｜番号付きステップ

順番を持つ作業にはMarkdownの番号付きリストを利用します。

1. **確認** — 前提と目的を整理する。
2. **設計** — 構成を決める。
3. **実装** — Markdownで内容を書く。
4. **検証** — プレビューで確認する。

---

<!-- _class: object-callout -->

# 06｜注記・コールアウト

本文から独立して目立たせたい補足をカードで表現します。

<div class="card">

**重要：ルールと内容を分離する**

共通CSSを変えるだけで、同じMarkdownを別の見た目に変更できます。

</div>

通常の説明文は、カードの外側に配置します。

---

<!-- _class: object-guide -->

# 07｜コード・コマンド

実行コマンドなどは、Markdownのコードフェンスで表現します。

```bash
npx @marp-team/marp-cli \
  02-slide-patterns.md \
  --theme theme.css \
  --html \
  -o slides.pdf
```

コマンド名だけなら `marp` のようにインラインで表現できます。

---

<!-- _class: object-guide -->

# 08｜リンク・補足資料

参照元や関連情報は、リンクとして記述します。

- [Marp公式サイト](https://marp.app/)
- [Marp for VS Code](https://github.com/marp-team/marp-vscode)
- [Marpitのディレクティブ](https://github.com/marp-team/marpit/blob/main/docs/directives.md)

<div class="card">

**出典の記載**

必要な場合は、URLや文献名をカード・フッターに短く記述します。

</div>

---

<!-- _class: object-guide -->

# 09｜水平ボックス（横並び）

利用可能な幅をカード数で均等に分割します（3枚なら3等分）。

<div class="box horizontal">

<div class="card tone-turquoise-light">

**● カードA**

内容を入力します。

</div>

<div class="card tone-aqua-light">

**● カードB**

内容を入力します。

</div>

<div class="card tone-coral-dark">

**● カードC**

内容を入力します。

</div>

</div>

---

<!-- _class: object-guide -->

# 10｜垂直ボックス（縦並び）

利用可能な横幅いっぱいの同じ幅で、カードを上から下へ積み重ねます。

<div class="box vertical">

<div class="card tone-turquoise-light">

**● ステップ1**

内容を入力します。

</div>

<div class="card tone-aqua-light">

**● ステップ2**

内容を入力します。

</div>

<div class="card tone-yellow-light">

**● ステップ3**

内容を入力します。

</div>

</div>

---

<!-- _class: object-guide -->

# 11｜入れ子のボックス

横・縦のボックスを自由に組み合わせます。カード本体はMarkdownのままです。

<div class="box horizontal">

<div class="box vertical">

<div class="card tone-turquoise-light">

**● 左上**

親の横ボックスの左半分。

</div>

<div class="card tone-aqua-light">

**● 左下**

縦方向に積み重ねる。

</div>

</div>

<div class="box vertical">

<div class="card tone-coral-light">

**● 右上**

親の横ボックスの右半分。

</div>

<div class="box horizontal">

<div class="card tone-yellow-light">

**● 右下A**

</div>

<div class="card tone-gray-light">

**● 右下B**

</div>

</div>

</div>

</div>

---

<!-- _class: object-guide -->

# 12｜空白カード（スペーサー）

`::: blank` は背景・枠線・影のない空白として、分割幅だけ確保します。

<div class="box horizontal">

<div class="card tone-turquoise-light">

**● 左カード**

1列目

</div>

<div class="blank">

</div>

<div class="card tone-coral-light">

**● 右カード**

3列目

</div>

</div>
