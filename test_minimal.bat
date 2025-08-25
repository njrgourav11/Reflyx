@echo off
echo Testing AI Coding Assistant Setup...

echo Testing Docker services...
docker-compose -f docker-compose.minimal.yml ps

echo Testing Qdrant...
curl -s http://localhost:6333/health

echo Testing Redis...
docker exec -it $(docker-compose -f docker-compose.minimal.yml ps -q redis) redis-cli ping

echo Testing backend...
curl -s http://localhost:8000/api/v1/health

echo Test complete!
pause
