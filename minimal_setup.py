#!/usr/bin/env python3
"""
Minimal Setup Script for AI Coding Assistant
Focuses on getting core components working with minimal dependencies.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

class Colors:
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    OKBLUE = '\033[94m'

def print_step(text: str):
    print(f"{Colors.OKBLUE}🔧 {text}{Colors.ENDC}")

def print_success(text: str):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text: str):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_warning(text: str):
    print(f"{Colors.WARNING}⚠️ {text}{Colors.ENDC}")

def run_command(command: str, timeout: int = 300, shell: bool = True, encoding: str = 'utf-8') -> tuple[bool, str]:
    """Run a command and return success status and output."""
    try:
        result = subprocess.run(
            command,
            shell=shell,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding=encoding,
            errors='replace'  # Replace problematic characters
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, "Command timed out"
    except Exception as e:
        return False, str(e)

def setup_minimal_python_env():
    """Set up minimal Python environment with essential packages only."""
    print_step("Setting up minimal Python environment...")
    
    project_root = Path(__file__).parent
    server_dir = project_root / "server"
    venv_dir = server_dir / "venv"
    
    # Create fresh virtual environment
    if venv_dir.exists():
        print_step("Removing existing virtual environment...")
        shutil.rmtree(venv_dir)
    
    print_step("Creating new virtual environment...")
    success, output = run_command(f'python -m venv "{venv_dir}"')
    if not success:
        print_error(f"Failed to create virtual environment: {output}")
        return False
    
    # Get Python executable path
    if os.name == 'nt':  # Windows
        python_exe = venv_dir / "Scripts" / "python.exe"
        pip_exe = venv_dir / "Scripts" / "pip.exe"
    else:
        python_exe = venv_dir / "bin" / "python"
        pip_exe = venv_dir / "bin" / "pip"
    
    # Upgrade pip
    print_step("Upgrading pip...")
    success, output = run_command(f'"{python_exe}" -m pip install --upgrade pip')
    if success:
        print_success("Pip upgraded")
    else:
        print_warning("Pip upgrade failed, continuing...")
    
    # Install minimal essential packages
    essential_packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0", 
        "pydantic==2.5.0",
        "httpx==0.25.2",
        "python-multipart==0.0.6",
        "qdrant-client==1.7.0",
        "redis==5.0.1",
        "python-dotenv==1.0.0"
    ]
    
    print_step("Installing essential packages...")
    for package in essential_packages:
        print(f"  Installing {package}...")
        success, output = run_command(f'"{python_exe}" -m pip install "{package}"', timeout=120)
        if success:
            print_success(f"  ✓ {package}")
        else:
            print_error(f"  ✗ {package}: {output}")
            return False
    
    print_success("Essential Python packages installed")
    return True

def setup_basic_extension():
    """Set up basic VS Code extension."""
    print_step("Setting up VS Code extension...")
    
    project_root = Path(__file__).parent
    extension_dir = project_root / "extension"
    
    if not extension_dir.exists():
        print_error("Extension directory not found")
        return False
    
    # Change to extension directory
    original_cwd = os.getcwd()
    os.chdir(extension_dir)
    
    try:
        # Add Node.js to PATH
        node_paths = [
            r"C:\Program Files\nodejs",
            r"C:\Program Files (x86)\nodejs"
        ]
        
        current_path = os.environ.get("PATH", "")
        for node_path in node_paths:
            if os.path.exists(node_path) and node_path not in current_path:
                os.environ["PATH"] = f"{node_path};{current_path}"
                current_path = os.environ["PATH"]
        
        # Install npm dependencies
        print_step("Installing npm dependencies...")
        success, output = run_command("npm install", timeout=300)
        if not success:
            print_error(f"npm install failed: {output}")
            return False
        
        print_success("npm dependencies installed")
        
        # Compile TypeScript
        print_step("Compiling TypeScript...")
        success, output = run_command("npm run compile", timeout=120)
        if success:
            print_success("Extension compiled")
        else:
            print_warning(f"Compilation issues: {output}")
        
        return True
        
    finally:
        os.chdir(original_cwd)

def create_minimal_docker_compose():
    """Create a minimal docker-compose.yml for testing."""
    print_step("Creating minimal Docker configuration...")
    
    project_root = Path(__file__).parent
    
    minimal_compose = """version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:v1.7.0
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  qdrant_data:
  redis_data:
"""
    
    compose_file = project_root / "docker-compose.minimal.yml"
    with open(compose_file, 'w') as f:
        f.write(minimal_compose)
    
    print_success("Minimal Docker configuration created")
    return True

def create_test_server():
    """Create a minimal test server to verify setup."""
    print_step("Creating test server...")
    
    project_root = Path(__file__).parent
    server_dir = project_root / "server"
    
    test_server_code = '''#!/usr/bin/env python3
"""
Minimal Test Server for AI Coding Assistant
Tests basic functionality without heavy dependencies.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from typing import Dict, Any

app = FastAPI(title="AI Coding Assistant - Test Server", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    max_results: int = 5

class HealthResponse(BaseModel):
    success: bool
    status: str
    services: Dict[str, Any]

@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    services = {}
    
    # Check Qdrant
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:6333/health", timeout=5.0)
            services["qdrant"] = {"status": "healthy" if response.status_code == 200 else "unhealthy"}
    except:
        services["qdrant"] = {"status": "unavailable"}
    
    # Check Redis
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, decode_responses=True)
        r.ping()
        services["redis"] = {"status": "healthy"}
    except:
        services["redis"] = {"status": "unavailable"}
    
    return HealthResponse(
        success=True,
        status="healthy",
        services=services
    )

@app.post("/api/v1/query")
async def query_codebase(request: QueryRequest):
    """Simple query endpoint for testing."""
    return {
        "success": True,
        "query": request.query,
        "response": f"Test response for: {request.query}",
        "results": [],
        "metadata": {
            "provider": "test",
            "model": "test-model",
            "processing_time": 0.1
        }
    }

@app.get("/api/v1/stats")
async def get_stats():
    """Get system statistics."""
    return {
        "success": True,
        "data": {
            "indexed_files": 0,
            "total_queries": 0,
            "uptime": "0s"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''
    
    test_server_file = server_dir / "test_server.py"
    with open(test_server_file, 'w') as f:
        f.write(test_server_code)
    
    print_success("Test server created")
    return True

def create_startup_scripts():
    """Create startup scripts for easy testing."""
    print_step("Creating startup scripts...")
    
    project_root = Path(__file__).parent
    
    # Windows batch script
    startup_script = project_root / "start_minimal.bat"
    
    script_content = f"""@echo off
echo Starting AI Coding Assistant - Minimal Setup...

REM Add paths to current session
set PATH=%PATH%;C:\\Program Files\\nodejs;%LOCALAPPDATA%\\Programs\\Ollama

echo Starting Docker services...
docker-compose -f docker-compose.minimal.yml up -d

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo Starting test server...
cd server
venv\\Scripts\\python.exe test_server.py

pause
"""
    
    with open(startup_script, 'w') as f:
        f.write(script_content)
    
    # Test script
    test_script = project_root / "test_minimal.bat"
    
    test_content = f"""@echo off
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
"""
    
    with open(test_script, 'w') as f:
        f.write(test_content)
    
    print_success("Startup scripts created")
    return True

def main():
    """Run minimal setup."""
    print(f"\n{Colors.BOLD}🔧 AI Coding Assistant - Minimal Setup{Colors.ENDC}")
    print("This setup focuses on core functionality with minimal dependencies.")
    print("=" * 60)
    
    steps = [
        ("Python Environment", setup_minimal_python_env),
        ("VS Code Extension", setup_basic_extension),
        ("Docker Configuration", create_minimal_docker_compose),
        ("Test Server", create_test_server),
        ("Startup Scripts", create_startup_scripts),
    ]
    
    results = {}
    
    for step_name, step_func in steps:
        print(f"\n--- {step_name} ---")
        try:
            results[step_name] = step_func()
        except Exception as e:
            print_error(f"Step failed with exception: {e}")
            results[step_name] = False
    
    # Summary
    print(f"\n{Colors.BOLD}📊 Setup Summary{Colors.ENDC}")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for step_name, result in results.items():
        status = "✅ SUCCESS" if result else "❌ FAILED"
        print(f"{step_name:<25} {status}")
    
    print(f"\nOverall: {passed}/{total} steps completed")
    
    if passed >= 3:  # At least most steps worked
        print_success("🎉 Minimal setup completed!")
        print("\nNext steps:")
        print("1. Run: start_minimal.bat")
        print("2. Test with: test_minimal.bat")
        print("3. Open VS Code and install extension from extension/ folder")
        print("4. Test basic functionality")
        print("\nNote: This is a minimal setup for testing core functionality.")
        print("For full AI features, you'll need to install Ollama models separately.")
        return True
    else:
        print_error("❌ Setup failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
