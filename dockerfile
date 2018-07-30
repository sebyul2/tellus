FROM mongo:latest

EXPOSE 27017

ENV MONGODB_USERNAME admin
ENV MONGODB_PASSWORD password 
ENV MONGODB_DBNAME=tellus

CMD ["--port 27017", "--smallfiles"]

ENTRYPOINT usr/bin/mongod