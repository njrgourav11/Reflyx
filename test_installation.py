#!/usr/bin/env python3
"""
Installation Test Script for AI Coding Assistant
Tests all components and dependencies to ensure proper installation.
"""

import os
import sys
import subprocess
import time
from pathlib import Path

class Colors:
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test(name: str):
    print(f"🧪 Testing {name}...")

def print_success(text: str):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text: str):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_warning(text: str):
    print(f"{Colors.WARNING}⚠️ {text}{Colors.ENDC}")

def run_command(command: str, timeout: int = 30) -> tuple[bool, str]:
    """Run a command and return success status and output."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, "Command timed out"
    except Exception as e:
        return False, str(e)

def test_python():
    """Test Python installation."""
    print_test("Python")
    
    # Check Python version
    success, output = run_command("python --version")
    if success:
        version = output.strip()
        print_success(f"Python installed: {version}")
        
        # Check if version is 3.8+
        try:
            version_parts = version.split()[1].split('.')
            major, minor = int(version_parts[0]), int(version_parts[1])
            if major >= 3 and minor >= 8:
                print_success("Python version is compatible (3.8+)")
                return True
            else:
                print_error(f"Python version {major}.{minor} is too old (need 3.8+)")
                return False
        except:
            print_warning("Could not parse Python version")
            return True
    else:
        print_error("Python not found")
        return False

def test_nodejs():
    """Test Node.js and npm installation."""
    print_test("Node.js and npm")
    
    # Test Node.js
    success, output = run_command("node --version")
    if not success:
        print_error("Node.js not found")
        return False
    
    node_version = output.strip()
    print_success(f"Node.js installed: {node_version}")
    
    # Test npm
    success, output = run_command("npm --version")
    if not success:
        print_error("npm not found")
        return False
    
    npm_version = output.strip()
    print_success(f"npm installed: {npm_version}")
    return True

def test_docker():
    """Test Docker installation and status."""
    print_test("Docker")
    
    # Check Docker version
    success, output = run_command("docker --version")
    if not success:
        print_error("Docker not found")
        return False
    
    docker_version = output.strip()
    print_success(f"Docker installed: {docker_version}")
    
    # Check if Docker is running
    success, output = run_command("docker ps", timeout=10)
    if success:
        print_success("Docker is running")
        return True
    else:
        print_warning("Docker is installed but not running")
        print_warning("Please start Docker Desktop and try again")
        return False

def test_ollama():
    """Test Ollama installation and status."""
    print_test("Ollama")
    
    # Add Ollama to PATH for this session
    ollama_path = os.path.expanduser(r"~\AppData\Local\Programs\Ollama")
    if os.path.exists(ollama_path):
        current_path = os.environ.get("PATH", "")
        if ollama_path not in current_path:
            os.environ["PATH"] = f"{ollama_path};{current_path}"
    
    # Check Ollama version
    success, output = run_command("ollama --version")
    if not success:
        print_error("Ollama not found")
        print_warning("Install Ollama from https://ollama.ai")
        return False
    
    ollama_version = output.strip()
    print_success(f"Ollama installed: {ollama_version}")
    
    # Check if Ollama service is running
    success, output = run_command("ollama list", timeout=10)
    if success:
        print_success("Ollama service is running")
        if "codellama" in output.lower():
            print_success("CodeLlama model is available")
        else:
            print_warning("No models installed. Run: ollama pull codellama:7b-code")
        return True
    else:
        print_warning("Ollama service not running")
        print_warning("Starting Ollama service...")
        
        # Try to start Ollama service
        subprocess.Popen(["ollama", "serve"], 
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        
        # Wait a moment and test again
        time.sleep(3)
        success, output = run_command("ollama list", timeout=10)
        if success:
            print_success("Ollama service started successfully")
            return True
        else:
            print_error("Could not start Ollama service")
            return False

def test_project_structure():
    """Test project structure and files."""
    print_test("Project Structure")
    
    project_root = Path(__file__).parent
    required_dirs = ["server", "extension", "docs"]
    required_files = ["setup.py", "docker-compose.yml", "README.md"]
    
    all_good = True
    
    for dir_name in required_dirs:
        dir_path = project_root / dir_name
        if dir_path.exists():
            print_success(f"Directory exists: {dir_name}")
        else:
            print_error(f"Missing directory: {dir_name}")
            all_good = False
    
    for file_name in required_files:
        file_path = project_root / file_name
        if file_path.exists():
            print_success(f"File exists: {file_name}")
        else:
            print_error(f"Missing file: {file_name}")
            all_good = False
    
    return all_good

def test_python_dependencies():
    """Test Python dependencies installation."""
    print_test("Python Dependencies")
    
    project_root = Path(__file__).parent
    venv_path = project_root / "server" / "venv"
    
    if not venv_path.exists():
        print_warning("Python virtual environment not found")
        return False
    
    # Check if we can activate venv and import key packages
    if os.name == 'nt':  # Windows
        python_exe = venv_path / "Scripts" / "python.exe"
    else:
        python_exe = venv_path / "bin" / "python"
    
    if not python_exe.exists():
        print_error("Python executable not found in virtual environment")
        return False
    
    print_success("Virtual environment found")
    
    # Test key imports
    test_imports = [
        "fastapi",
        "uvicorn", 
        "qdrant_client",
        "sentence_transformers",
        "torch"
    ]
    
    all_good = True
    for package in test_imports:
        success, output = run_command(f'"{python_exe}" -c "import {package}; print(f\'{package} OK\')"')
        if success:
            print_success(f"Package available: {package}")
        else:
            print_error(f"Package missing or broken: {package}")
            all_good = False
    
    return all_good

def test_extension_build():
    """Test VS Code extension build."""
    print_test("VS Code Extension")
    
    project_root = Path(__file__).parent
    extension_dir = project_root / "extension"
    
    if not extension_dir.exists():
        print_error("Extension directory not found")
        return False
    
    # Check if package.json exists
    package_json = extension_dir / "package.json"
    if not package_json.exists():
        print_error("package.json not found in extension directory")
        return False
    
    print_success("Extension directory structure OK")
    
    # Check if node_modules exists
    node_modules = extension_dir / "node_modules"
    if node_modules.exists():
        print_success("Node modules installed")
    else:
        print_warning("Node modules not installed")
        return False
    
    # Check if compiled output exists
    out_dir = extension_dir / "out"
    if out_dir.exists():
        print_success("Extension compiled successfully")
    else:
        print_warning("Extension not compiled yet")
        return False
    
    return True

def main():
    """Run all installation tests."""
    print(f"\n{Colors.BOLD}🧪 AI Coding Assistant - Installation Test{Colors.ENDC}")
    print("=" * 50)
    
    tests = [
        ("Python", test_python),
        ("Node.js & npm", test_nodejs),
        ("Docker", test_docker),
        ("Ollama", test_ollama),
        ("Project Structure", test_project_structure),
        ("Python Dependencies", test_python_dependencies),
        ("VS Code Extension", test_extension_build),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print_error(f"Test failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print(f"\n{Colors.BOLD}📊 Test Summary{Colors.ENDC}")
    print("=" * 50)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print_success("🎉 All tests passed! Installation is ready.")
        print("\nNext steps:")
        print("1. Run: python setup.py --mode local")
        print("2. Start services: docker-compose up -d")
        print("3. Install VS Code extension")
        print("4. Start coding with AI assistance!")
        return True
    else:
        print_error("❌ Some tests failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("• Start Docker Desktop")
        print("• Run: ollama serve (in background)")
        print("• Run: python setup.py --mode local")
        print("• Check installation guides in docs/")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
