# Zizai Slides Python Engine 0.6.1

**VSCode/VSIX なしで単独利用できるスライド生成ライブラリです。**
Python 3.10以降・Python標準ライブラリのみ。PyPIやnpmパッケージは不要です。

初めての方は [初期設定](docs/INITIAL_SETUP.md) と [サンプルMarkdown](samples/quickstart.slide.md) を参照してください。

## ディレクトリ構成

- `zizai_slides/`：Markdown解析、Pythonによるレイアウト、編集可能PPTX、HTML/PDF生成。
- `zizai_slides/assets/slide.css`：スライド内のデザイン（エンジン唯一の既定テーマ）。
- `zizai_slides/assets/print.css`：PDF・印刷向け設定。
- `tools/link_engine.py`：使用中のPython環境に、このエンジンの場所を登録するための1回限りの処理。
- `samples/`：Markdownと独立したCSSの見本。

## Pythonライブラリとして使う

解凍したフォルダーでそのまま実行できます。

```powershell
python -m zizai_slides samples\multiproduct-faithful.slide.md output.pptx --mode editable
```

他のディレクトリのPythonプログラムから `import zizai_slides` したい場合は、**利用するPython環境ごとに1回だけ**次を実行してください。

```powershell
# 通常のPython環境
python tools\link_engine.py

# 仮想環境で使う場合（上記ではなく、こちらのPythonで実行）
.venv\Scripts\python.exe tools\link_engine.py
```

この操作は、対象Python環境の `site-packages` にエンジンの絶対パスを記した `.pth` ファイルを置くだけです。**pip、管理外のライブラリ、ビルド処理は使用しません。** エンジンの `.py` を修正すると、次回のPython起動からその変更が反映されます。別Python環境に切り替えたら、その環境で1回登録してください。登録解除は `python tools\link_engine.py --remove` です。

別のPythonファイルから：

```python
from zizai_slides import convert
convert('slides.md', 'slides.pptx', mode='editable', style_path='custom.css')
```

Pythonのsite-packagesが書き込み禁止の場合、アクセス権のある仮想環境のPythonを選択して登録してください。VSIX経由だけなら `.pth` 登録は不要です。


## スライドのheader/body記法（v0.6.1）

````md
::: header
# タイトル
説明文
:::

::::: body
:::: h
::: card turquoise-light
左カード
:::
::: card coral-light
右カード
:::
::::
:::::
````

`header` と `body` は別々のスライド領域です。親コンテナほどコロンを多く指定します。スライドのCSSトークン `--zs-header-height`（既定140px）と `--zs-header-body-gap`（既定14px）で配置を調整できます。HTMLと編集可能PPTXで共通の配置計算を使います。

## VSIXとの連携

VSIXの設定 `zizaiSlides.enginePath` に、この解凍先のルートフォルダーを指定してください。VSIXは同梱エンジンを持たず、指定した場所の `zizai_slides/worker.py` を直接実行します。

仮想環境を使うときは `zizaiSlides.pythonPath` に、その環境の `python.exe` を指定します。

エンジンの変更を反映するためにVSIXを再インストールする必要はありません（Pythonの実行ごとに外部エンジンを読み込みます）。

**機能と品質の制約：** 既定のCSSトークンと対応する自由配置CSSのみをPPTXへ反映します。任意のCSSを完全にネイティブPowerPoint図形へ変換するものではありません。画像版PPTX/PDFにはインストール済みEdge/Chromeが必要です。
