# Marp Markdown Pattern Kit

Markdown主体で資料を作るMarpスライドデザイン集です。**v2ではカード・縦横配置を `:::`、ラベルをインラインの囲み記法**で作成できます。Node.js以外の変換用ライブラリは不要です。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `02-slide-patterns.source.md` | 編集用：16種類のスライド見本（新記法） |
| `03-object-patterns.source.md` | 編集用：12種類のオブジェクト見本（新記法） |
| `02-slide-patterns.md` | 自動生成：公式Marpプレビュー・PDF出力用 |
| `03-object-patterns.md` | 自動生成：公式Marpプレビュー・PDF出力用 |
| `theme.css` | テーマ・カラー・配置・影の共通CSS |
| `scripts/build-marp.mjs` | `:::` とインラインラベルの変換プログラム |
| `04-container-notation.md` | 新しい表記ルール・入れ子構文 |
| `01-common-rules.md` | 既存テーマの共通デザインルール |
| `.vscode/settings.json` | Marp for VS Codeに `theme.css` を設定 |
| `.vscode/tasks.json` | VSCodeのビルド／監視タスク |
| `tests/build-marp.test.mjs` | 新記法の変換テスト |

## VSCodeでの使用方法

1. このリポジトリをVSCodeで開き、公式 **Marp for VS Code** 拡張機能を使用します。
2. `02-slide-patterns.source.md` または `03-object-patterns.source.md` を編集します。
3. ターミナルで `npm run build` を実行します。継続的に編集する場合は **`npm run watch`** を実行すると、保存時に自動でプレビュー用Markdownが更新されます。
4. `02-slide-patterns.md` または `03-object-patterns.md` を開き、Marpプレビューを表示します。

VSCodeの **「ターミナル → タスクの実行」** からも `Marp: Build preview` と `Marp: Watch preview` を選択できます。

**注意：`*.source.md` が編集対象、通常の `*.md` は生成結果です。** 生成結果を直接編集しても、次のビルドで上書きされます。変換プログラムはNode.js 18以降で動作し、依存パッケージのインストールは不要です。

## 新しい表記の例

~~~md
<!-- _class: background gray -->

# カードの比較

内容を横に並べて比較します。

:::: h

::: card turquoise-light hover

**● 左カード**

進捗：[完了]{.coral-dark}

:::

::: card coral-light

**● 右カード**

進捗：[確認中]{.yellow-light}

:::

::::
~~~

- `h` / `horizontal`：等幅の横並び
- `v` / `vertical`：縦並び
- `card 色名 hover`：カードの色と影（`hover` は省略可能）
- `[文字]{.coral-dark}`：ラベル。**親カードから色を継承せず、色を個別に指定**
- `blank`：幅を占める透明な空白カード（背景・枠線・影なし）
- `paper`：スライド幅95%の大きな白いキャンバス

`:::` は外側より**内側のコロン数を少なく**し、開始と終了の数を一致させます。任意の深さに入れ子にできます。詳しくは [04-container-notation.md](./04-container-notation.md) を参照してください。

## 従来の外観と互換性

テーマ名は `blackline`。標準の背景は白 `#FFFFFF`、`background gray` で薄灰色 `#FBFBFB` になります。ヘッダーと本文の仕切り線はありません。カード・ラベルは青緑／水色／灰色／赤／モノクロ／黄色の**6色×濃淡2種類**、`hover` は左右と下にのみ影を付けます。表紙・章扉は40:60分割、下部には進捗バーを表示します。

旧式のMarkdown `>` カードや `div` レイアウト用CSSも残しているため、従来の原稿は引き続き使用できます。

## PDF／HTML出力

プレビュー用Markdownを生成してから、Marp CLIで出力します。

~~~bash
npm run build
npx @marp-team/marp-cli 02-slide-patterns.md --theme theme.css --html -o slides.pdf
~~~

テストは `npm test` で実行できます。

**互換性**：新記法の `:::` と `[文字]{.色名}` は標準Marpでは直接解析できません。本リポジトリの `npm run build` が通常のMarkdownとHTMLへ変換するため、**生成後の .md はMarp for VS Code公式プレビュー／Marp CLIでそのまま利用できます**。

参考：[Marp for VS Code](https://github.com/marp-team/marp-vscode) / [Marp CLI](https://github.com/marp-team/marp-cli)
