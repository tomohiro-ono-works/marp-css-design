# Zizai Slide Studio v0.6.1 — 分離構成

**Marp非依存のMarkdown＋CSSスライドエンジンを、PythonライブラリとVSCode拡張（VSIX）に分離しました。**

## 最初に読むもの

- [初期設定（Windows / VSCode / 仮想環境）](docs/INITIAL_SETUP.md)
- [初回サンプルMarkdown](samples/quickstart.slide.md) と [対応CSS](samples/quickstart.slide.css)
- [ヘッダー／ボディの最小サンプル](samples/header-body.slide.md)

## ダウンロードするもの

| 成果物 | 中身 | 設置場所 |
|---|---|---|
| `zizai-slides-engine-0.6.1.zip` | 独立した `zizai_slides` Pythonパッケージ、スライド用CSS、サンプル | 好きなフォルダーに解凍。例：`C:\tools\zizai-slides-engine-0.6.1` |
| `zizai-slide-studio-0.6.1.vsix` | 起動、UI、ボタン、プレビュー用JavaScript | VSCodeの「VSIXからインストール」で導入 |
| ソースZIP | Python＋VSIX両方の開発用コード、テスト、梱包スクリプト | 必要な場合のみ |

**PythonエンジンはVSIXに同梱されません。** エンジンへのパスをVSCodeで選択します。PythonはPCにインストールされているものを使います。Python 3.10以上・外部Pythonパッケージなし。

## 最初の設定（コマンドを毎回打つ必要なし）

1. PythonエンジンZIPを解凍します。フォルダーの直下に `zizai_slides/` があることを確認してください。
2. VSIXをVSCodeにインストールします。
3. コマンドパレットから **「Zizai Slides: Pythonエンジンのフォルダーを設定」** を選び、手順1のフォルダーを選びます。設定は保持されます。
4. 必要なら **「Zizai Slides: Python実行環境を選択」** から、既存のPythonや仮想環境の `python.exe` を選びます（省略時はワークスペースの `.venv` を優先して自動検索）。
5. `.md` を開き、 **「Zizai Slides: プレビューを開く」** を実行します。以後はプレビューの **PPTX（編集）** ボタンでPPTXを生成できます。

接続を検証したいときは **「Zizai Slides: Pythonエンジンの接続確認」** を実行してください。

### settings.json に直接書く場合

```json
{
  "zizaiSlides.enginePath": "C:\\tools\\zizai-slides-engine-0.6.1",
  "zizaiSlides.pythonPath": "${workspaceFolder}\\.venv\\Scripts\\python.exe",
  "zizaiSlides.slideCssPath": "slides-theme.css"
}
```

`enginePath` はフォルダーを指定します。`zizai_slides` の親フォルダーと、`zizai_slides` フォルダー自体の両方に対応します。`enginePath` を変更したときはプレビューを開き直してください。`slideCssPath` は省略でき、Markdownの隣に同名の `.css` があれば自動読み込みします。

### 内部処理を修正したいとき

解凍先の `zizai_slides/*.py` を編集するだけです。VSIXは実行のたびにそのファイルを起動するため、**VSIXを再作成・再インストールする必要はありません**。Pythonは `-I -S` で起動し、対象エンジン以外の追加Pythonパッケージを読み込まない構成です。ローカルHTTPポートは使用しません。

## 別のPythonプログラムから利用する

Pythonエンジンのフォルダー内ではそのまま `from zizai_slides import convert` ができます。他の場所からインポートする場合は、使用するPython環境に1回だけパスを登録してください。

```powershell
# Pythonエンジンの解凍先で、使いたいPython環境を指定
.venv\Scripts\python.exe tools\link_engine.py
```

（グローバル環境なら `python tools\link_engine.py`）。`link_engine.py` はそのPython環境の `site-packages` に `.pth` ファイルを書き込み、ソースの場所を参照させます。**pip・setuptools・外部依存なし**で、Pythonファイルを編集した内容も次回Python起動時に使えます。登録解除は `--remove` です。

他のPythonプログラム：

```python
from zizai_slides import convert

convert("slides.md", "slides.pptx", mode="editable", style_path="slide.css")
```

CLIからの利用も引き続き可能です。

```powershell
python -m zizai_slides slides.md slides.pptx --mode editable
```


## 新しい header / body コンテナ（v0.6.1）

`header` と `body` を別々に記述すると、Pythonエンジンが1枚のスライドを上下2領域として配置します。内容はMarkdown、配置はCSSが担当します。

```md
::: header
# スライドのタイトル

補足説明文
:::

::::: body
:::: h
::: card turquoise-light
**左側**

図
:::
::: card aqua-light
**右側**

図
:::
::::
:::::
```

外側のコンテナほどコロンを多くします（`::::: body` ＞ `:::: h` ＞ `::: card`）。`header` / `body` はそれぞれスライド直下に1つまで置けます。入れ子が不要なら、両方とも `::: header` / `::: body` で記述できます。既存のスライド記法は変更不要です。

スライド用CSS（Pythonが読んでHTML/PPTX両方に反映）：

```css
.slide {
  --zs-header-height: 140px;
  --zs-header-body-gap: 14px;
}
```

上記は既定値です。bodyの開始位置は上余白＋header高さ＋間隔で決まります。`samples/header-body.slide.md` は実際に編集可能PPTXへ変換できるサンプルです。

## デザインと担当の分離

| 区分 | ファイル | 役割 |
|---|---|---|
| Pythonライブラリ | `zizai_slides/*.py` | Markdown解析、レイアウト、HTML・PDF・PPTX生成 |
| スライド内部CSS | `zizai_slides/assets/slide.css` | 配色・余白・カード・位置などスライドのデザイン |
| 印刷用CSS | `zizai_slides/assets/print.css` | PDF・ページ設定 |
| VSIX UI用CSS | `media/ui.css` | VSCodeツールバー、ボタン、サイドバー |
| VSIX連携 | `extension.js`, `runtime/engine_bridge.js` | エンジン呼び出し・UIイベント・ファイル操作 |

Pythonはスライド用CSSの対応プロパティを解釈してPPTXを作成します。UI用CSSはスライド・PPTXへ影響しません。サンプルに `multiproduct-faithful.slide.md` と `.css` を同梱しています。

**制約：** Python標準ライブラリで任意のCSSを完全再現するエンジンではありません。編集可能PPTXに反映するのは対応する `--zs-*` トークンと自由配置用CSSです。画像PPTXとPDFにはEdge/Chromeが必要で、Marpと完全なピクセル一致は保証しません。

## テスト・梱包（開発者向け）

```powershell
python -m unittest discover -s tests -v
# VSCodeユーザーにはNode.js不要。開発時だけJSテスト実施可能。
node --test tests/engine-bridge.test.js
python tools/package_engine.py
python tools/package_vsix.py
```

PythonパッケージもVSIXも、Python標準の `zipfile` だけで配布用ZIPを生成します。ユーザー側のNode.jsインストールは不要です。
