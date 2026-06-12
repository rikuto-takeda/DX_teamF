import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# React(通常ポート5173等)からのアクセスを許可します
CORS(app)

# SQLiteデータベースの設定
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# dbオブジェクトの初期化
db = SQLAlchemy(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    # debug=True にすると、コードを変更した際に自動でサーバーが再起動します
    app.run(debug=True, port=5000)
