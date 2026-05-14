# FP問題集 2級・1級

スマホで使えるFP試験対策の問題集Webアプリです。

## 機能
- 2級・1級それぞれ30問（順次追加予定）
- ランダム出題（毎回シャッフル）
- 1問1答・4択形式
- 詳細解説＋参考サイトリンク
- 間違えた問題・分野別の学習履歴
- 端末内（localStorage）に履歴を保存

---

## GitHub Pages への公開手順

### 1. リポジトリを作成する
1. GitHub にログイン
2. 右上の「＋」→「New repository」をクリック
3. Repository name に `fp-quiz`（任意）を入力
4. Public を選択
5. 「Create repository」をクリック

### 2. ファイルをアップロードする
```
index.html
css/style.css
js/app.js
js/data/questions-2kyu.js
js/data/questions-1kyu.js
README.md
.nojekyll
```

**方法A: GitHub のWeb画面からアップロード**
1. リポジトリを開き「uploading an existing file」をクリック
2. フォルダごとドラッグ＆ドロップ（またはファイルを選択）
3. 「Commit changes」をクリック

**方法B: Git コマンドを使う**
```bash
git init
git add .
git commit -m "FP問題集 初回コミット"
git remote add origin https://github.com/ユーザー名/fp-quiz.git
git push -u origin main
```

### 3. GitHub Pages を有効にする
1. リポジトリの「Settings」タブをクリック
2. 左メニューの「Pages」をクリック
3. Source → 「Deploy from a branch」
4. Branch → `main` / `/ (root)` を選択
5. 「Save」をクリック

### 4. 公開URLを確認する
数分後に以下のURLでアクセス可能になります：
```
https://ユーザー名.github.io/fp-quiz/
```

---

## 問題を追加する方法

`js/data/questions-2kyu.js` または `js/data/questions-1kyu.js` を開き、
以下の形式でオブジェクトを追加してください：

```javascript
{
  id: "2k_031",              // 一意のID
  category: "ライフプランニング", // 6分野のいずれか
  question: "問題文...",
  choices: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  answer: 0,                 // 正解の選択肢インデックス（0〜3）
  explanation: "解説文...",
  reference: {
    text: "参考サイト名",
    url: "https://..."
  }
}
```

**カテゴリの6分野：**
- `ライフプランニング`
- `リスク管理`
- `金融資産運用`
- `タックスプランニング`
- `不動産`
- `相続・事業承継`
