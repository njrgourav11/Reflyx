#!/usr/bin/env python3
"""
Installation Fix Script for AI Coding Assistant
Fixes common installation issues and ensures all components work properly.
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

def run_command(command: str, timeout: int = 300, shell: bool = True) -> tuple[bool, str]:
    """Run a command and return success status and output."""
    try:
        result = subprocess.run(
            command,
            shell=shell,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, "Command timed out"
    except Exception as e:
        return False, str(e)

def fix_path_issues():
    """Fix PATH issues for npm and ollama."""
    print_step("Fixing PATH issues...")
    
    # Add Node.js to PATH
    node_paths = [
        r"C:\Program Files\nodejs",
        r"C:\Program Files (x86)\nodejs"
    ]
    
    # Add Ollama to PATH
    ollama_path = os.path.expanduser(r"~\AppData\Local\Programs\Ollama")
    
    current_path = os.environ.get("PATH", "")
    path_updated = False
    
    for node_path in node_paths:
        if os.path.exists(node_path) and node_path not in current_path:
            os.environ["PATH"] = f"{node_path};{current_path}"
            current_path = os.environ["PATH"]
            path_updated = True
            print_success(f"Added Node.js path: {node_path}")
    
    if os.path.exists(ollama_path) and ollama_path not in current_path:
        os.environ["PATH"] = f"{ollama_path};{current_path}"
        path_updated = True
        print_success(f"Added Ollama path: {ollama_path}")
    
    if path_updated:
        print_success("PATH updated for current session")
    else:
        print_warning("No PATH updates needed")
    
    return True

def fix_python_environment():
    """Fix Python virtual environment issues."""
    print_step("Fixing Python virtual environment...")
    
    project_root = Path(__file__).parent
    server_dir = project_root / "server"
    venv_dir = server_dir / "venv"
    
    if not venv_dir.exists():
        print_error("Virtual environment not found")
        return False
    
    # Get Python executable path
    if os.name == 'nt':  # Windows
        python_exe = venv_dir / "Scripts" / "python.exe"
        pip_exe = venv_dir / "Scripts" / "pip.exe"
    else:
        python_exe = venv_dir / "bin" / "python"
        pip_exe = venv_dir / "bin" / "pip"
    
    if not python_exe.exists():
        print_error("Python executable not found in virtual environment")
        return False
    
    # Upgrade pip first
    print_step("Upgrading pip...")
    success, output = run_command(f'"{python_exe}" -m pip install --upgrade pip')
    if success:
        print_success("Pip upgraded successfully")
    else:
        print_warning(f"Pip upgrade failed: {output}")
    
    # Install setuptools and wheel first
    print_step("Installing build tools...")
    success, output = run_command(f'"{python_exe}" -m pip install --upgrade setuptools wheel')
    if success:
        print_success("Build tools installed")
    else:
        print_error(f"Failed to install build tools: {output}")
        return False
    
    # Install requirements with specific fixes
    print_step("Installing Python dependencies...")
    requirements_file = server_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print_error("requirements.txt not found")
        return False
    
    # Install in chunks to avoid memory issues
    critical_packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "pydantic==2.5.0",
        "torch>=2.2.0",
        "numpy==1.24.4"
    ]
    
    print_step("Installing critical packages first...")
    for package in critical_packages:
        success, output = run_command(f'"{python_exe}" -m pip install "{package}"')
        if success:
            print_success(f"Installed: {package}")
        else:
            print_warning(f"Failed to install {package}: {output}")
    
    # Install remaining packages
    print_step("Installing remaining packages...")
    success, output = run_command(f'"{python_exe}" -m pip install -r "{requirements_file}"')
    if success:
        print_success("All Python dependencies installed")
        return True
    else:
        print_warning(f"Some packages may have failed: {output}")
        # Try to continue anyway
        return True

def fix_ollama_setup():
    """Fix Ollama setup and download models."""
    print_step("Setting up Ollama...")
    
    # Check if Ollama is available
    success, output = run_command("ollama --version")
    if not success:
        print_error("Ollama not found in PATH")
        return False
    
    print_success("Ollama is available")
    
    # Check if Ollama service is running
    success, output = run_command("ollama list", timeout=10)
    if not success:
        print_step("Starting Ollama service...")
        # Start Ollama service in background
        try:
            subprocess.Popen(["ollama", "serve"], 
                           stdout=subprocess.DEVNULL, 
                           stderr=subprocess.DEVNULL)
            import time
            time.sleep(5)  # Wait for service to start
            
            # Test again
            success, output = run_command("ollama list", timeout=10)
            if success:
                print_success("Ollama service started")
            else:
                print_error("Could not start Ollama service")
                return False
        except Exception as e:
            print_error(f"Error starting Ollama: {e}")
            return False
    
    # Check if models are installed
    if "codellama" not in output.lower():
        print_step("Downloading CodeLlama model (this may take a while)...")
        success, output = run_command("ollama pull codellama:7b-code", timeout=1800)  # 30 minutes
        if success:
            print_success("CodeLlama model downloaded")
        else:
            print_warning(f"Model download failed: {output}")
            print_warning("You can download it later with: ollama pull codellama:7b-code")
    else:
        print_success("CodeLlama model already available")
    
    return True

def fix_extension_build():
    """Fix VS Code extension build."""
    print_step("Building VS Code extension...")
    
    project_root = Path(__file__).parent
    extension_dir = project_root / "extension"
    
    if not extension_dir.exists():
        print_error("Extension directory not found")
        return False
    
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
        print_success("Extension compiled successfully")
    else:
        print_warning(f"Compilation warnings: {output}")
    
    # Package extension
    print_step("Packaging extension...")
    success, output = run_command("npm run package", timeout=60)
    if success:
        print_success("Extension packaged successfully")
        # Find the .vsix file
        vsix_files = list(extension_dir.glob("*.vsix"))
        if vsix_files:
            print_success(f"Extension package: {vsix_files[0].name}")
    else:
        print_warning(f"Packaging failed: {output}")
    
    return True

def create_startup_script():
    """Create a startup script for easy launching."""
    print_step("Creating startup script...")
    
    project_root = Path(__file__).parent
    
    # Windows batch script
    startup_script = project_root / "start_ai_assistant.bat"
    
    script_content = f"""@echo off
echo Starting AI Coding Assistant...

REM Add paths to current session
set PATH=%PATH%;C:\\Program Files\\nodejs;%LOCALAPPDATA%\\Programs\\Ollama

REM Start Ollama service
echo Starting Ollama service...
start /B ollama serve

REM Wait a moment
timeout /t 5 /nobreak >nul

REM Start Docker services
echo Starting Docker services...
docker-compose up -d

REM Show status
echo.
echo AI Coding Assistant is starting up...
echo.
echo Services:
docker-compose ps
echo.
echo Ollama models:
ollama list
echo.
echo Setup complete! Open VS Code and install the extension from extension/ folder.
echo Extension file: {project_root / "extension"}\\*.vsix
echo.
pause
"""
    
    with open(startup_script, 'w') as f:
        f.write(script_content)
    
    print_success(f"Startup script created: {startup_script.name}")
    return True

def main():
    """Run all fixes."""
    print(f"\n{Colors.BOLD}🔧 AI Coding Assistant - Installation Fix{Colors.ENDC}")
    print("=" * 50)
    
    fixes = [
        ("PATH Issues", fix_path_issues),
        ("Python Environment", fix_python_environment),
        ("Ollama Setup", fix_ollama_setup),
        ("Extension Build", fix_extension_build),
        ("Startup Script", create_startup_script),
    ]
    
    results = {}
    
    for fix_name, fix_func in fixes:
        print(f"\n--- {fix_name} ---")
        try:
            results[fix_name] = fix_func()
        except Exception as e:
            print_error(f"Fix failed with exception: {e}")
            results[fix_name] = False
    
    # Summary
    print(f"\n{Colors.BOLD}📊 Fix Summary{Colors.ENDC}")
    print("=" * 50)
    
    passed = sum(results.values())
    total = len(results)
    
    for fix_name, result in results.items():
        status = "✅ FIXED" if result else "❌ FAILED"
        print(f"{fix_name:<20} {status}")
    
    print(f"\nOverall: {passed}/{total} fixes applied")
    
    if passed >= 3:  # At least most fixes worked
        print_success("🎉 Installation fixes applied successfully!")
        print("\nNext steps:")
        print("1. Run: start_ai_assistant.bat (or docker-compose up -d)")
        print("2. Open VS Code in this directory")
        print("3. Install extension: Ctrl+Shift+P → 'Extensions: Install from VSIX'")
        print("4. Select the .vsix file from extension/ folder")
        print("5. Restart VS Code")
        print("6. Run: 'AI Coding Assistant: Index Workspace'")
        print("7. Start coding with AI assistance!")
        return True
    else:
        print_error("❌ Several fixes failed. Manual intervention may be required.")
        return False

if __name__ == "__main__":
    # Change to extension directory for npm commands
    project_root = Path(__file__).parent
    extension_dir = project_root / "extension"
    if extension_dir.exists():
        os.chdir(extension_dir)
    
    success = main()
    sys.exit(0 if success else 1)
