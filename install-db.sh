docker kill $(docker ps -q)
docker rm $(docker images -q) -f
docker build -t tellus-mongo .
docker run -d tellus-mongo