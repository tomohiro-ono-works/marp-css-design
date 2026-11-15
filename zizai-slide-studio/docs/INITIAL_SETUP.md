# 初期設定 — Zizai Slide Studio v0.6.1

## 必要なもの

- Windows 11 / Visual Studio Code（拡張の対応条件は VS Code 1.90以上）
- Python 3.10以上（既存のPythonまたは `.venv` を使用）
- `zizai-slides-engine-0.6.1.zip` と `zizai-slide-studio-0.6.1.vsix`

編集可能なPPTXの生成には、Node.js、Marp、pipで追加するPythonライブラリ、ローカルHTTPサーバーは不要です。PDFまたは画像化PPTXの生成にはEdge/Chromeが必要です。

## はじめて使う場合（毎回のコマンド入力は不要）

1. PythonエンジンのZIPを `C:\tools\zizai-slides-engine-0.6.1` など任意の場所に解凍します。`zizai_slides/worker.py` があるフォルダーを確認してください。
2. VSCodeの拡張機能ビューから「VSIXからインストール」を選び、VSIXファイルをインストールします。
3. `Ctrl+Shift+P` でコマンドパレットを開き、「**Zizai Slides: Pythonエンジンのフォルダーを設定**」を選びます。手順1のエンジンのルートフォルダーを指定してください。
4. Pythonの自動検出が可能なら追加設定は不要です。仮想環境を指定する場合は「**Zizai Slides: Python実行環境を選択**」で `.venv\Scripts\python.exe` を選びます。
5. 「**Zizai Slides: Pythonエンジンの接続確認**」で接続を確認します。
6. `samples/quickstart.slide.md` をVSCodeで開き、「**Zizai Slides: プレビューを開く**」を実行します。プレビューの「PPTX（編集）」ボタンから書き出します。

エンジンを編集した場合は、VSIXを再インストールする必要はありません。次回の実行から読み込まれます。

## 設定ファイルに直接書く場合（任意）

VSCodeの `settings.json` に以下を設定できます。パスは自分のPCに合わせて置き換えてください。

```json
{
  "zizaiSlides.enginePath": "C:\\tools\\zizai-slides-engine-0.6.1",
  "zizaiSlides.pythonPath": "${workspaceFolder}\\.venv\\Scripts\\python.exe"
}
```

`.venv` を使用しない場合、`pythonPath` は省略できます。VSIXはワークスペース内 `.venv` を優先し、Windowsでは `py -3`、`python`、`python3` の順に探します。

## サンプルを編集する

- `samples/quickstart.slide.md`：`::: header` と `::: body` の基本、カードとラベルの例
- `samples/quickstart.slide.css`：サンプル専用の色・余白設定（Markdownと同名のCSSとして自動適用）
- `samples/header-body.slide.md`：最小限のヘッダー・ボディ記法
- `samples/multiproduct-faithful.slide.md`：元画像に近いレイアウトのデモ（対応CSSとセット）

Markdownの中身を変更したら、プレビューを更新してください。隣接する同名CSSがあれば、そのCSSが自動的に読み込まれます。

## 他のPythonプログラムから利用する

Pythonの実行環境ごとに初回のみ、エンジンZIPの解凍先で次を実行します。

```powershell
python tools\link_engine.py
```

仮想環境なら、代わりに `.venv\Scripts\python.exe tools\link_engine.py` を使用します。これは環境の `site-packages` にエンジンのパスを記した `.pth` を作成するだけで、pipは使いません。

別のPythonプログラム：

```python
from zizai_slides import convert
convert("slides.md", "slides.pptx", mode="editable")
```

### 仕様上の注意

編集可能PPTXが再現するのはエンジン対応のCSSトークンと自由配置ルールです。一般的なブラウザCSSの全機能には対応していません。実際のVSCode画面操作は配布環境ごとの確認が必要です。
