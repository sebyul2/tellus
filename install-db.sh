docker kill $(docker ps -q)
docker rm $(docker ps -a -q)
docker rmi $(docker images -q) -f
docker build -t tellus-mongo .
docker run -d tellus-mongo -p 27017:27017