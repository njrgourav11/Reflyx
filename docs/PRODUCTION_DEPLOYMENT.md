# 🚀 Production Deployment Guide - AI Coding Assistant

This comprehensive guide covers deploying the AI Coding Assistant to production environments with enterprise-grade security, scalability, and monitoring.

## 📋 Table of Contents

1. [Cloud Hosting Options](#cloud-hosting-options)
2. [Docker Containerization](#docker-containerization)
3. [Environment Configuration](#environment-configuration)
4. [Security Best Practices](#security-best-practices)
5. [Load Balancing & Scaling](#load-balancing--scaling)
6. [SSL/TLS Setup](#ssltls-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Backup & Recovery](#backup--recovery)
10. [Performance Optimization](#performance-optimization)

## 🌐 Cloud Hosting Options

### AWS Deployment

#### Option 1: ECS with Fargate (Recommended)
```yaml
# docker-compose.prod.yml for AWS ECS
version: '3.8'
services:
  ai-assistant-backend:
    image: your-registry/ai-assistant:latest
    cpu: 1024
    memory: 2048
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    secrets:
      - openai_api_key
      - anthropic_api_key
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/ai-assistant
        awslogs-region: us-east-1
        awslogs-stream-prefix: backend

  qdrant:
    image: qdrant/qdrant:v1.7.0
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__CLUSTER__ENABLED=true

volumes:
  qdrant_data:
    driver: rexray/ebs
```

#### AWS Infrastructure Setup
```bash
# 1. Create ECS Cluster
aws ecs create-cluster --cluster-name ai-assistant-prod

# 2. Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name ai-assistant-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345

# 3. Create RDS Instance for PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier ai-assistant-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --allocated-storage 100 \
  --storage-encrypted

# 4. Create ElastiCache Redis Cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id ai-assistant-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

#### Option 2: EC2 with Auto Scaling
```bash
# Launch Template
aws ec2 create-launch-template \
  --launch-template-name ai-assistant-template \
  --launch-template-data '{
    "ImageId": "ami-0abcdef1234567890",
    "InstanceType": "t3.medium",
    "SecurityGroupIds": ["sg-12345"],
    "UserData": "base64-encoded-startup-script",
    "IamInstanceProfile": {"Name": "ai-assistant-role"}
  }'

# Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name ai-assistant-asg \
  --launch-template LaunchTemplateName=ai-assistant-template \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --vpc-zone-identifier "subnet-12345,subnet-67890"
```

### Google Cloud Platform (GCP)

#### GKE Deployment
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-assistant-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-assistant-backend
  template:
    metadata:
      labels:
        app: ai-assistant-backend
    spec:
      containers:
      - name: backend
        image: gcr.io/your-project/ai-assistant:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ai-assistant-secrets
              key: database-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ai-assistant-service
spec:
  selector:
    app: ai-assistant-backend
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

#### GCP Setup Commands
```bash
# 1. Create GKE Cluster
gcloud container clusters create ai-assistant-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10

# 2. Create Cloud SQL Instance
gcloud sql instances create ai-assistant-db \
  --database-version POSTGRES_13 \
  --tier db-f1-micro \
  --region us-central1

# 3. Create Memorystore Redis
gcloud redis instances create ai-assistant-redis \
  --size 1 \
  --region us-central1
```

### Microsoft Azure

#### Azure Container Instances (ACI)
```yaml
# azure-container-group.yaml
apiVersion: 2019-12-01
location: eastus
name: ai-assistant-group
properties:
  containers:
  - name: ai-assistant-backend
    properties:
      image: your-registry.azurecr.io/ai-assistant:latest
      resources:
        requests:
          cpu: 1.0
          memoryInGb: 2.0
      ports:
      - port: 8000
        protocol: TCP
      environmentVariables:
      - name: NODE_ENV
        value: production
      - name: DATABASE_URL
        secureValue: your-database-connection-string
  - name: qdrant
    properties:
      image: qdrant/qdrant:v1.7.0
      resources:
        requests:
          cpu: 0.5
          memoryInGb: 1.0
      ports:
      - port: 6333
        protocol: TCP
  osType: Linux
  restartPolicy: Always
  ipAddress:
    type: Public
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 6333
```

#### Azure Setup Commands
```bash
# 1. Create Resource Group
az group create --name ai-assistant-rg --location eastus

# 2. Create Container Registry
az acr create --resource-group ai-assistant-rg \
  --name aiassistantregistry --sku Basic

# 3. Create PostgreSQL Database
az postgres server create \
  --resource-group ai-assistant-rg \
  --name ai-assistant-db \
  --location eastus \
  --admin-user admin \
  --sku-name GP_Gen5_2

# 4. Create Redis Cache
az redis create \
  --resource-group ai-assistant-rg \
  --name ai-assistant-redis \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

### DigitalOcean

#### App Platform Deployment
```yaml
# .do/app.yaml
name: ai-assistant
services:
- name: backend
  source_dir: /
  github:
    repo: your-username/ai-coding-assistant
    branch: main
  run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
  environment_slug: python
  instance_count: 2
  instance_size_slug: basic-xxs
  http_port: 8080
  health_check:
    http_path: /api/v1/health
  envs:
  - key: DATABASE_URL
    scope: RUN_TIME
    type: SECRET
  - key: REDIS_URL
    scope: RUN_TIME
    type: SECRET

databases:
- name: ai-assistant-db
  engine: PG
  version: "13"
  size: db-s-1vcpu-1gb

- name: ai-assistant-redis
  engine: REDIS
  version: "6"
  size: db-s-1vcpu-1gb
```

#### DigitalOcean Setup
```bash
# 1. Install doctl CLI
snap install doctl

# 2. Deploy app
doctl apps create --spec .do/app.yaml

# 3. Create Kubernetes cluster (alternative)
doctl kubernetes cluster create ai-assistant-k8s \
  --region nyc1 \
  --version 1.21.5-do.0 \
  --count 3 \
  --size s-2vcpu-2gb
```

## 🐳 Docker Containerization

### Production Dockerfile
```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS extension-builder
WORKDIR /app/extension
COPY extension/package*.json ./
RUN npm ci --only=production
COPY extension/ ./
RUN npm run compile && npm run package

FROM python:3.11-slim AS backend-builder
WORKDIR /app
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim AS production
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy application code
COPY server/ ./
COPY --from=extension-builder /app/extension/out ./static/extension

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Multi-Stage Build Optimization
```dockerfile
# Dockerfile.optimized
FROM python:3.11-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
WORKDIR /app
COPY server/requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

FROM base AS production
WORKDIR /app
COPY --from=dependencies /root/.local /root/.local
COPY server/ ./

# Make sure scripts in .local are usable:
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose for Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - QDRANT_URL=http://qdrant:6333
    depends_on:
      - qdrant
      - redis
      - postgres
    networks:
      - ai-assistant-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.backend.tls=true"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"

  qdrant:
    image: qdrant/qdrant:v1.7.0
    restart: unless-stopped
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__CLUSTER__ENABLED=false
    networks:
      - ai-assistant-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - ai-assistant-network

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ai-assistant-network

  traefik:
    image: traefik:v2.10
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt_data:/letsencrypt
    networks:
      - ai-assistant-network

  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    networks:
      - ai-assistant-network

  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - ai-assistant-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`monitoring.yourdomain.com`)"
      - "traefik.http.routers.grafana.tls=true"

volumes:
  qdrant_data:
  redis_data:
  postgres_data:
  letsencrypt_data:
  prometheus_data:
  grafana_data:

networks:
  ai-assistant-network:
    driver: bridge
```

## ⚙️ Environment Configuration

### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
DEBUG=false

# Database Configuration
DATABASE_URL=postgresql://user:password@postgres:5432/ai_assistant
REDIS_URL=redis://:password@redis:6379/0
QDRANT_URL=http://qdrant:6333

# API Keys (use secrets management in production)
OPENAI_API_KEY=${OPENAI_API_KEY}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
GROQ_API_KEY=${GROQ_API_KEY}

# Security
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Performance
MAX_WORKERS=4
MAX_CONNECTIONS=100
CACHE_TTL=3600

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
LOG_LEVEL=INFO
METRICS_ENABLED=true

# SSL/TLS
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=3600

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=/app/uploads

# Email Configuration (for notifications)
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASSWORD=${SMTP_PASSWORD}
```

### Secrets Management

#### AWS Secrets Manager
```python
# app/core/secrets.py
import boto3
import json
from botocore.exceptions import ClientError

class SecretsManager:
    def __init__(self, region_name="us-east-1"):
        self.client = boto3.client('secretsmanager', region_name=region_name)
    
    def get_secret(self, secret_name: str) -> dict:
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            return json.loads(response['SecretString'])
        except ClientError as e:
            raise e
    
    def get_api_keys(self) -> dict:
        return self.get_secret("ai-assistant/api-keys")
```

#### HashiCorp Vault
```python
# app/core/vault.py
import hvac

class VaultClient:
    def __init__(self, url: str, token: str):
        self.client = hvac.Client(url=url, token=token)
    
    def get_secret(self, path: str) -> dict:
        response = self.client.secrets.kv.v2.read_secret_version(path=path)
        return response['data']['data']
```

#### Kubernetes Secrets
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ai-assistant-secrets
type: Opaque
data:
  openai-api-key: <base64-encoded-key>
  anthropic-api-key: <base64-encoded-key>
  database-url: <base64-encoded-url>
  jwt-secret: <base64-encoded-secret>
```

## 🔒 Security Best Practices

### Network Security
```yaml
# docker-compose.security.yml
version: '3.8'

services:
  backend:
    # ... other config
    networks:
      - internal
      - external
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp

networks:
  internal:
    driver: bridge
    internal: true
  external:
    driver: bridge
```

### Application Security
```python
# app/core/security.py
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import bcrypt
from datetime import datetime, timedelta

security = HTTPBearer()

class SecurityManager:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
    
    def create_access_token(self, data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm="HS256")
        return encoded_jwt
    
    def verify_token(self, credentials: HTTPAuthorizationCredentials = Depends(security)):
        try:
            payload = jwt.decode(credentials.credentials, self.secret_key, algorithms=["HS256"])
            return payload
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
```

### Rate Limiting
```python
# app/middleware/rate_limit.py
from fastapi import Request, HTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@limiter.limit("100/minute")
async def api_endpoint(request: Request):
    return {"message": "API response"}
```

### Input Validation
```python
# app/models/validation.py
from pydantic import BaseModel, validator, Field
from typing import Optional
import re

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    max_results: int = Field(default=10, ge=1, le=100)
    
    @validator('query')
    def validate_query(cls, v):
        # Prevent injection attacks
        if re.search(r'[<>"\']', v):
            raise ValueError('Query contains invalid characters')
        return v.strip()
```

## ⚖️ Load Balancing & Scaling

### Horizontal Pod Autoscaler (Kubernetes)
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-assistant-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-assistant-backend
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### NGINX Load Balancer Configuration
```nginx
# nginx.conf
upstream ai_assistant_backend {
    least_conn;
    server backend1:8000 max_fails=3 fail_timeout=30s;
    server backend2:8000 max_fails=3 fail_timeout=30s;
    server backend3:8000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location /api/ {
        proxy_pass http://ai_assistant_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /health {
        access_log off;
        proxy_pass http://ai_assistant_backend/api/v1/health;
    }
}
```

### AWS Application Load Balancer
```bash
# Create target group
aws elbv2 create-target-group \
  --name ai-assistant-targets \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-12345 \
  --health-check-path /api/v1/health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 5

# Create load balancer
aws elbv2 create-load-balancer \
  --name ai-assistant-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

## 🔐 SSL/TLS Setup

### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Certificate
```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate certificate signing request
openssl req -new -key private.key -out certificate.csr

# Generate self-signed certificate (for testing)
openssl x509 -req -days 365 -in certificate.csr -signkey private.key -out certificate.crt
```

### SSL Configuration for Docker
```yaml
# docker-compose.ssl.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl/cert.pem:/etc/ssl/certs/cert.pem
      - ./ssl/key.pem:/etc/ssl/private/key.pem
    depends_on:
      - backend
```

## 📊 Monitoring & Logging

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'ai-assistant-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'qdrant'
    static_configs:
      - targets: ['qdrant:6333']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Alert Rules
```yaml
# monitoring/alert_rules.yml
groups:
- name: ai-assistant-alerts
  rules:
  - alert: HighCPUUsage
    expr: cpu_usage_percent > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for more than 5 minutes"

  - alert: HighMemoryUsage
    expr: memory_usage_percent > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"

  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service is down"
      description: "{{ $labels.instance }} has been down for more than 1 minute"

  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "AI Coding Assistant - Production Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100"
          }
        ]
      }
    ]
  }
}
```

### Centralized Logging with ELK Stack
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.8.0
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

### Application Metrics
```python
# app/middleware/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Request, Response
import time

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active connections')

async def metrics_middleware(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time
    REQUEST_DURATION.observe(duration)
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()

    return response

@app.get("/metrics")
async def get_metrics():
    return Response(generate_latest(), media_type="text/plain")
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        cd server
        pip install -r requirements.txt
        pip install pytest pytest-cov

    - name: Run tests
      run: |
        cd server
        pytest tests/ --cov=app --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile.prod
        push: true
        tags: |
          ghcr.io/${{ github.repository }}:latest
          ghcr.io/${{ github.repository }}:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to production
      run: |
        # Update Kubernetes deployment
        kubectl set image deployment/ai-assistant-backend \
          backend=ghcr.io/${{ github.repository }}:${{ github.sha }}

        # Wait for rollout
        kubectl rollout status deployment/ai-assistant-backend

    - name: Run smoke tests
      run: |
        # Wait for deployment
        sleep 30

        # Test health endpoint
        curl -f https://api.yourdomain.com/api/v1/health

        # Test main functionality
        curl -f -X POST https://api.yourdomain.com/api/v1/query \
          -H "Content-Type: application/json" \
          -d '{"query": "test", "max_results": 5}'
```

### GitLab CI/CD
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com
  DOCKER_IMAGE: $DOCKER_REGISTRY/$CI_PROJECT_PATH

test:
  stage: test
  image: python:3.11
  script:
    - cd server
    - pip install -r requirements.txt
    - pip install pytest pytest-cov
    - pytest tests/ --cov=app --cov-report=term --cov-report=xml
  coverage: '/TOTAL.*\s+(\d+%)$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: server/coverage.xml

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -f Dockerfile.prod -t $DOCKER_IMAGE:$CI_COMMIT_SHA .
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
    - docker tag $DOCKER_IMAGE:$CI_COMMIT_SHA $DOCKER_IMAGE:latest
    - docker push $DOCKER_IMAGE:latest
  only:
    - main

deploy:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/ai-assistant-backend backend=$DOCKER_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/ai-assistant-backend
  environment:
    name: production
    url: https://api.yourdomain.com
  only:
    - main
```

## 💾 Backup & Recovery

### Database Backup Strategy
```bash
# PostgreSQL backup script
#!/bin/bash
# backup_db.sh

DB_NAME="ai_assistant"
DB_USER="admin"
DB_HOST="localhost"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f "$BACKUP_DIR/ai_assistant_$DATE.backup"

# Compress backup
gzip "$BACKUP_DIR/ai_assistant_$DATE.backup"

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.backup.gz" -mtime +30 -delete

# Upload to S3
aws s3 cp "$BACKUP_DIR/ai_assistant_$DATE.backup.gz" s3://your-backup-bucket/postgresql/
```

### Qdrant Vector Database Backup
```bash
# Qdrant backup script
#!/bin/bash
# backup_qdrant.sh

QDRANT_URL="http://localhost:6333"
BACKUP_DIR="/backups/qdrant"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Create snapshot
curl -X POST "$QDRANT_URL/collections/codebase/snapshots"

# Download snapshot
SNAPSHOT_NAME=$(curl -s "$QDRANT_URL/collections/codebase/snapshots" | jq -r '.result[-1].name')
curl -o "$BACKUP_DIR/qdrant_snapshot_$DATE.snapshot" \
  "$QDRANT_URL/collections/codebase/snapshots/$SNAPSHOT_NAME"

# Upload to S3
aws s3 cp "$BACKUP_DIR/qdrant_snapshot_$DATE.snapshot" s3://your-backup-bucket/qdrant/
```

### Automated Backup with Kubernetes CronJob
```yaml
# k8s/backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f /backup/backup_$(date +%Y%m%d_%H%M%S).backup
              aws s3 cp /backup/backup_$(date +%Y%m%d_%H%M%S).backup s3://your-backup-bucket/
            env:
            - name: DB_HOST
              value: "postgres-service"
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: username
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

### Disaster Recovery Plan
```yaml
# disaster-recovery.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: disaster-recovery-plan
data:
  recovery-steps.md: |
    # Disaster Recovery Steps

    ## 1. Assess the Situation
    - Identify the scope of the outage
    - Determine if it's a partial or complete failure
    - Check monitoring dashboards for root cause

    ## 2. Immediate Response
    - Switch traffic to backup region (if available)
    - Notify stakeholders via incident management system
    - Begin recovery procedures

    ## 3. Database Recovery
    ```bash
    # Restore from latest backup
    pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME /backup/latest.backup

    # Verify data integrity
    psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM users;"
    ```

    ## 4. Vector Database Recovery
    ```bash
    # Restore Qdrant snapshot
    curl -X PUT "$QDRANT_URL/collections/codebase/snapshots/recover" \
      -H "Content-Type: application/json" \
      -d '{"location": "s3://backup-bucket/qdrant/latest.snapshot"}'
    ```

    ## 5. Application Recovery
    - Deploy latest known good version
    - Run health checks
    - Gradually restore traffic

    ## 6. Post-Incident
    - Conduct post-mortem
    - Update runbooks
    - Implement preventive measures
```

## ⚡ Performance Optimization

### Database Optimization
```sql
-- PostgreSQL performance tuning
-- postgresql.conf optimizations

# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Connection settings
max_connections = 200

# Indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_queries_created_at ON queries(created_at);
CREATE INDEX CONCURRENTLY idx_files_workspace_id ON files(workspace_id);
```

### Redis Optimization
```conf
# redis.conf optimizations
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# Network optimizations
tcp-keepalive 300
timeout 0

# Performance
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
```

### Application Performance
```python
# app/core/performance.py
import asyncio
from functools import wraps
import time
from typing import Dict, Any
import aioredis
from sqlalchemy.ext.asyncio import AsyncSession

class PerformanceOptimizer:
    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client
        self.cache_ttl = 3600  # 1 hour

    def cache_result(self, key_prefix: str, ttl: int = None):
        """Decorator to cache function results."""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"

                # Try to get from cache
                cached = await self.redis.get(cache_key)
                if cached:
                    return json.loads(cached)

                # Execute function
                result = await func(*args, **kwargs)

                # Cache result
                await self.redis.setex(
                    cache_key,
                    ttl or self.cache_ttl,
                    json.dumps(result, default=str)
                )

                return result
            return wrapper
        return decorator

    async def batch_database_operations(self, operations: list, session: AsyncSession):
        """Batch multiple database operations."""
        try:
            for operation in operations:
                session.add(operation)
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
```

### CDN Configuration
```yaml
# CloudFront distribution for static assets
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
        - DomainName: your-s3-bucket.s3.amazonaws.com
          Id: S3Origin
          S3OriginConfig:
            OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${OriginAccessIdentity}'
        Enabled: true
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad  # CachingOptimized
          OriginRequestPolicyId: 88a5eaf4-2fd4-4709-b370-b4c650ea3fcf  # CORS-S3Origin
        PriceClass: PriceClass_100
        ViewerCertificate:
          AcmCertificateArn: !Ref SSLCertificate
          SslSupportMethod: sni-only
```

## 🎯 Production Checklist

### Pre-Deployment Checklist
- [ ] **Security Review**
  - [ ] All secrets stored securely (not in code)
  - [ ] HTTPS/TLS configured properly
  - [ ] Rate limiting implemented
  - [ ] Input validation in place
  - [ ] Security headers configured

- [ ] **Performance Testing**
  - [ ] Load testing completed
  - [ ] Database queries optimized
  - [ ] Caching strategy implemented
  - [ ] CDN configured for static assets

- [ ] **Monitoring Setup**
  - [ ] Application metrics configured
  - [ ] Log aggregation working
  - [ ] Alerting rules defined
  - [ ] Health checks implemented

- [ ] **Backup & Recovery**
  - [ ] Automated backups configured
  - [ ] Recovery procedures tested
  - [ ] Disaster recovery plan documented

- [ ] **Infrastructure**
  - [ ] Auto-scaling configured
  - [ ] Load balancer health checks
  - [ ] SSL certificates valid
  - [ ] DNS configuration correct

### Post-Deployment Checklist
- [ ] **Smoke Tests**
  - [ ] Health endpoints responding
  - [ ] Core functionality working
  - [ ] Authentication working
  - [ ] Database connectivity verified

- [ ] **Monitoring Verification**
  - [ ] Metrics being collected
  - [ ] Logs being aggregated
  - [ ] Alerts firing correctly
  - [ ] Dashboards displaying data

- [ ] **Performance Validation**
  - [ ] Response times acceptable
  - [ ] Error rates within limits
  - [ ] Resource utilization normal
  - [ ] Scaling working correctly

## 📞 Support & Maintenance

### Incident Response Runbook
```yaml
# incident-response.yml
severity_levels:
  P0: # Critical - Complete service outage
    response_time: 15 minutes
    escalation: Immediate
    communication: All stakeholders

  P1: # High - Major functionality impaired
    response_time: 1 hour
    escalation: 2 hours
    communication: Technical team + management

  P2: # Medium - Minor functionality impaired
    response_time: 4 hours
    escalation: 8 hours
    communication: Technical team

  P3: # Low - Cosmetic issues
    response_time: 24 hours
    escalation: 48 hours
    communication: Development team

escalation_contacts:
  - name: "On-call Engineer"
    phone: "+1-555-0123"
    email: "oncall@company.com"
  - name: "Engineering Manager"
    phone: "+1-555-0124"
    email: "eng-manager@company.com"
  - name: "CTO"
    phone: "+1-555-0125"
    email: "cto@company.com"
```

### Maintenance Windows
```bash
# maintenance-window.sh
#!/bin/bash
# Scheduled maintenance script

echo "Starting maintenance window at $(date)"

# 1. Put application in maintenance mode
kubectl patch deployment ai-assistant-backend -p '{"spec":{"replicas":0}}'

# 2. Deploy maintenance page
kubectl apply -f maintenance-page.yaml

# 3. Perform maintenance tasks
echo "Running database migrations..."
kubectl exec -it postgres-pod -- psql -U admin -d ai_assistant -f /migrations/latest.sql

echo "Updating vector database..."
curl -X POST http://qdrant:6333/collections/codebase/optimize

# 4. Deploy new version
echo "Deploying new version..."
kubectl set image deployment/ai-assistant-backend backend=new-image:tag

# 5. Wait for deployment
kubectl rollout status deployment/ai-assistant-backend

# 6. Remove maintenance page
kubectl delete -f maintenance-page.yaml

# 7. Run smoke tests
echo "Running smoke tests..."
curl -f https://api.yourdomain.com/api/v1/health

echo "Maintenance window completed at $(date)"
```

---

## 🎉 Conclusion

This comprehensive production deployment guide provides everything needed to deploy the AI Coding Assistant to enterprise-grade production environments. The guide covers:

✅ **Multi-cloud deployment options** (AWS, GCP, Azure, DigitalOcean)
✅ **Container orchestration** with Docker and Kubernetes
✅ **Security best practices** including secrets management and SSL/TLS
✅ **Scalability solutions** with load balancing and auto-scaling
✅ **Comprehensive monitoring** with Prometheus, Grafana, and ELK stack
✅ **CI/CD pipelines** for automated deployments
✅ **Backup and disaster recovery** strategies
✅ **Performance optimization** techniques

### Next Steps:
1. Choose your preferred cloud platform
2. Set up the infrastructure using the provided templates
3. Configure monitoring and alerting
4. Test the deployment with the provided checklists
5. Implement CI/CD pipeline for automated deployments

**The AI Coding Assistant is now ready for enterprise production deployment! 🚀**
