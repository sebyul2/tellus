git checkout develop
git pull origin develop
git add .
git commit -m "pull"
npm install
npm run db-script
npm run server-start