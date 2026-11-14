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

Markdownの引用記法をカードとして扱います。淡色カードは枠線なしです。

::: card turquoise-light hover

 **● カードの見出し（影あり）**

説明文をここに記述します。1〜3行を目安にします。

`ラベルA` `ラベルB`

:::

::: card turquoise-dark

 **● 濃い色のカード**

同じ記法でカードを追加できます。

:::

---

<!-- _class: object-guide -->

# 03｜ラベル・強調

短い分類語や補助的な情報は、ピル型のラベルで表現します。

**6色のカラーパレット（濃色・淡色）**

[青緑・濃]{.turquoise-dark} [青緑・淡]{.turquoise-light}
[水色・濃]{.aqua-dark} [水色・淡]{.aqua-light}
[灰色・濃]{.gray-dark} [灰色・淡]{.gray-light}
[赤・濃]{.coral-dark} [赤・淡]{.coral-light}
[黒・濃]{.mono-dark} [黒・淡]{.mono-light}
[黄・濃]{.yellow-dark} [黄・淡]{.yellow-light}

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

本文から独立して目立たせたい補足を引用記法で表現します。

::: card

**重要：ルールと内容を分離する**

共通CSSを変えるだけで、同じMarkdownを別の見た目に変更できます。

:::

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

::: card

**出典の記載**

必要な場合は、URLや文献名をカード・フッターに短く記述します。

:::

---

<!-- _class: object-guide -->

# 09｜水平ボックス（横並び）

利用可能な幅をカード数で均等に分割します（3枚なら3等分）。

:::: h

::: card turquoise-light

 **● カードA**

内容を入力します。

:::

::: card aqua-light

 **● カードB**

内容を入力します。

:::

::: card coral-dark

 **● カードC**

内容を入力します。

:::

::::

---

<!-- _class: object-guide -->

# 10｜垂直ボックス（縦並び）

利用可能な横幅いっぱいの同じ幅で、カードを上から下へ積み重ねます。

:::: v

::: card turquoise-light

 **● ステップ1**

内容を入力します。

:::

::: card aqua-light

 **● ステップ2**

内容を入力します。

:::

::: card yellow-light

 **● ステップ3**

内容を入力します。

:::

::::

---

<!-- _class: object-guide -->

# 11｜入れ子のボックス

横・縦のボックスを自由に組み合わせます。カード本体はMarkdownのままです。

:::::: h

:::: v

::: card turquoise-light

 **● 左上**

親の横ボックスの左半分。

:::

::: card aqua-light

 **● 左下**

縦方向に積み重ねる。

:::

::::

::::: v

::: card coral-light

 **● 右上**

親の横ボックスの右半分。

:::

:::: h

::: card yellow-light

 **● 右下A**

:::

::: card gray-light

 **● 右下B**

:::

::::

:::::

::::::

---

<!-- _class: object-guide -->

# 12｜空白カード（スペーサー）

中身のない `>` は背景・枠線なしの空白として、分割幅だけ確保します。

:::: h

::: card turquoise-light

 **● 左カード**

1列目

:::

::: blank

:::

::: card coral-light

 **● 右カード**

3列目

:::

::::
