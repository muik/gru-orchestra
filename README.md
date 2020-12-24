# 그루 오케스트라
아이가 흥미 있어 하는 [오케스트라 책](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=186203697)의 여러 악기 음악을 QR코드 스캔해서 들려주기 정말 불편했어요. 그래서 쉽게 악기 소리를 들려주기 위해 만든 웹앱입니다.

## 개발
https://cloud.google.com/appengine/docs/standard/python3/quickstart

### 환경 초기화
```
python3 -m venv env
source env/bin/activate
pip install  -r requirements.txt
```

### 환경 로드
```
source env/bin/activate
```

### 로컬 개발 서버
```
python main.py
open http://localhost:8080
```

### 배포
```
gcloud app deploy
```

### 테스트
```
pytest
```
