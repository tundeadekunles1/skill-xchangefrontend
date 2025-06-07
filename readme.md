  cd skil-bridgeFrontendmainProd/
  touch Dockerfile
  touch .env
  mkdir nginx
  cd nginx/
  touch nginx.conf
  cd ..
  docker build -t frontend-docker .
  docker run -p 80:80 frontend-docker
  docker run -d -p 80:80 frontend-docker
