---
title: Zizai Slides
theme: blackline
size: 16:9
paginate: true
---

<!-- _class: background gray -->

# Zizai Slides

MarpもNode.jsも不要。Python標準ライブラリで独自Markdownを解析します。

:::: h

::: card turquoise-light hover

**● Markdown編集**

任意のテキストからスライドを作成。

[簡単]{.turquoise-dark}

:::

::: card coral-light

**● ライブプレビュー**

VSCode上でスライドを確認。

[独立配色]{.yellow-light}

:::

::::

---

<!-- _class: background white -->

# 縦横の入れ子

外側は横、右側は縦に分割します。

::::: h tall

:::: card turquoise-light hover

**● 左カード**

- 重要項目
- 詳細説明
- [進行中]{.coral-dark}

::::

:::: v equal

::: card aqua-light

**● 右上**

上側の説明。

:::

::: card yellow-light

**● 右下**

下側の説明。

:::

::::

:::::

---

<!-- _class: background gray -->

# 表・文章・ラベル

標準Markdownと独自記法を混在させられます。

| 評価軸 | 状態 | メモ |
|---|---|---|
| UX | [完了]{.turquoise-light} | リアルタイム表示 |
| Parser | [完了]{.turquoise-light} | Python標準ライブラリ |
| PDF | [対応]{.aqua-light} | Edge / Chrome |

