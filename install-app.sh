cd /data/tellus
sudo su
git checkout develop
git pull origin develop
# add는 스테이지에 올려주는 것
git add .
# 소스트리에는 메세지 쓰는것 처럼 m은 메세지 "내용"
git commit -m "pull"
npm install
npm run db-script
npm run server-start