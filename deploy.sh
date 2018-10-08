ssh -i ~/.ssh/20180718_tellus.pem ubuntu@ec2-54-180-77-117.ap-northeast-2.compute.amazonaws.com <<\EOF
cd /data/tellus
sudo su
git checkout develop
git pull origin develop
git add .
git commit -m "pull"
npm install
npm run db-script
npm run server-start
EOF