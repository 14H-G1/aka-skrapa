FROM node
RUN apt-get update
RUN apt-get install -y git git-core
ADD start.sh /tmp/
RUN chmod +x /tmp/start.sh
CMD ./tmp/start.sh
COPY books.json /books/
