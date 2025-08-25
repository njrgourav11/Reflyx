# AI Coding Assistant - Makefile
# Convenient commands for development and deployment

.PHONY: help install dev start stop clean test lint format build deploy

# Default target
help:
	@echo "AI Coding Assistant - Available Commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install     - Install all dependencies and setup environment"
	@echo "  make setup       - Run the automated setup script"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Start development environment"
	@echo "  make start       - Start all services"
	@echo "  make stop        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo ""
	@echo "Code Quality:"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linting checks"
	@echo "  make format      - Format code"
	@echo "  make type-check  - Run type checking"
	@echo ""
	@echo "Building & Deployment:"
	@echo "  make build       - Build all components"
	@echo "  make package     - Package VS Code extension"
	@echo "  make docker      - Build Docker images"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       - Clean up generated files"
	@echo "  make logs        - View service logs"
	@echo "  make health      - Check service health"
	@echo "  make stats       - Show system statistics"

# Setup and Installation
install:
	@echo "🔧 Installing dependencies..."
	python setup.py

setup:
	@echo "🚀 Running automated setup..."
	python setup.py

# Development
dev:
	@echo "🔥 Starting development environment..."
	docker-compose up -d
	@echo "✅ Services started. Run 'make logs' to view logs."
	@echo "🌐 Backend: http://localhost:8000"
	@echo "📊 Qdrant: http://localhost:6333/dashboard"

start:
	@echo "▶️  Starting all services..."
	docker-compose up -d

stop:
	@echo "⏹️  Stopping all services..."
	docker-compose down

restart:
	@echo "🔄 Restarting all services..."
	docker-compose restart

# Code Quality
test:
	@echo "🧪 Running tests..."
	@echo "Backend tests:"
	cd server && python -m pytest tests/ -v --cov=app
	@echo "Extension tests:"
	cd extension && npm test

lint:
	@echo "🔍 Running linting checks..."
	@echo "Python linting:"
	cd server && flake8 app/ --max-line-length=100
	cd server && mypy app/
	@echo "TypeScript linting:"
	cd extension && npm run lint

format:
	@echo "✨ Formatting code..."
	@echo "Python formatting:"
	cd server && black app/ --line-length=100
	cd server && isort app/
	@echo "TypeScript formatting:"
	cd extension && npm run format

type-check:
	@echo "🔎 Running type checks..."
	cd server && mypy app/
	cd extension && npm run type-check

# Building and Packaging
build:
	@echo "🏗️  Building all components..."
	@echo "Building backend..."
	cd server && python -m build
	@echo "Building extension..."
	cd extension && npm run compile

package:
	@echo "📦 Packaging VS Code extension..."
	cd extension && npm run package
	@echo "✅ Extension packaged as .vsix file"

docker:
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✅ Docker images built successfully"

# Maintenance
clean:
	@echo "🧹 Cleaning up..."
	@echo "Removing Python cache..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Removing Node.js cache..."
	cd extension && rm -rf node_modules/.cache 2>/dev/null || true
	cd extension && rm -rf out 2>/dev/null || true
	@echo "Removing build artifacts..."
	rm -rf server/dist 2>/dev/null || true
	rm -rf server/build 2>/dev/null || true
	rm -rf extension/*.vsix 2>/dev/null || true
	@echo "✅ Cleanup completed"

logs:
	@echo "📋 Viewing service logs..."
	docker-compose logs -f

health:
	@echo "🏥 Checking service health..."
	@echo "Backend health:"
	@curl -s http://localhost:8000/api/v1/health | python -m json.tool || echo "❌ Backend not responding"
	@echo ""
	@echo "Qdrant health:"
	@curl -s http://localhost:6333/health | python -m json.tool || echo "❌ Qdrant not responding"
	@echo ""
	@echo "Ollama health:"
	@curl -s http://localhost:11434/api/tags | python -m json.tool || echo "❌ Ollama not responding"

stats:
	@echo "📊 System statistics..."
	@curl -s http://localhost:8000/api/v1/stats | python -m json.tool || echo "❌ Cannot retrieve stats"

# Ollama Management
ollama-install:
	@echo "🤖 Installing Ollama models..."
	ollama pull codellama:7b-code
	ollama pull deepseek-coder:6.7b
	@echo "✅ Models installed"

ollama-list:
	@echo "📋 Available Ollama models:"
	ollama list

# Database Management
db-reset:
	@echo "🗄️  Resetting database..."
	docker-compose down -v
	docker-compose up -d qdrant redis
	@echo "✅ Database reset completed"

db-backup:
	@echo "💾 Backing up database..."
	mkdir -p backups
	docker-compose exec qdrant tar czf - /qdrant/storage > backups/qdrant-backup-$(shell date +%Y%m%d-%H%M%S).tar.gz
	@echo "✅ Database backup completed"

# Extension Development
ext-dev:
	@echo "🔧 Starting extension development..."
	cd extension && npm run watch

ext-install:
	@echo "📦 Installing extension locally..."
	cd extension && npm run compile && npm run package
	@echo "Install the generated .vsix file in VS Code"

# Production Deployment
deploy-prod:
	@echo "🚀 Deploying to production..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production deployment completed"

deploy-stop:
	@echo "⏹️  Stopping production deployment..."
	docker-compose -f docker-compose.prod.yml down

# Monitoring
monitor:
	@echo "📈 Starting monitoring dashboard..."
	@echo "Logs: make logs"
	@echo "Health: make health"
	@echo "Stats: make stats"
	@echo "Qdrant Dashboard: http://localhost:6333/dashboard"

# Quick Commands
quick-start: install start
	@echo "🎉 Quick start completed!"
	@echo "🌐 Backend: http://localhost:8000"
	@echo "📊 Qdrant: http://localhost:6333/dashboard"
	@echo "Run 'make ext-install' to install the VS Code extension"

quick-test: lint test
	@echo "✅ All tests passed!"

# Help for specific components
help-backend:
	@echo "Backend Commands:"
	@echo "  cd server && python -m uvicorn app.main:app --reload"
	@echo "  cd server && python -m pytest tests/"
	@echo "  cd server && python -m black app/"

help-extension:
	@echo "Extension Commands:"
	@echo "  cd extension && npm run compile"
	@echo "  cd extension && npm run watch"
	@echo "  cd extension && npm run package"
	@echo "  cd extension && npm test"
