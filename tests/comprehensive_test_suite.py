#!/usr/bin/env python3
"""
Comprehensive Test Suite for AI Coding Assistant
Tests all components across different operating systems and modes.
"""

import os
import sys
import subprocess
import platform
import json
import time
import asyncio
import aiohttp
import pytest
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Colors:
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    OKBLUE = '\033[94m'

class TestResult:
    def __init__(self, name: str, passed: bool, message: str = "", duration: float = 0.0):
        self.name = name
        self.passed = passed
        self.message = message
        self.duration = duration

class ComprehensiveTestSuite:
    """Main test suite for comprehensive quality assurance."""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.system = platform.system().lower()
        self.results: List[TestResult] = []
        self.config = self.load_test_config()
        
    def load_test_config(self) -> Dict[str, Any]:
        """Load test configuration."""
        config_file = self.project_root / "tests" / "test_config.json"
        if config_file.exists():
            with open(config_file, 'r') as f:
                return json.load(f)
        
        # Default configuration
        return {
            "backend_url": "http://localhost:8000",
            "qdrant_url": "http://localhost:6333",
            "redis_url": "redis://localhost:6379",
            "timeout": 30,
            "test_modes": ["local", "online", "hybrid"],
            "test_providers": ["ollama", "openai", "anthropic", "google", "groq"],
            "skip_slow_tests": False
        }
    
    def print_test(self, name: str):
        print(f"{Colors.OKBLUE}🧪 Testing {name}...{Colors.ENDC}")
    
    def print_success(self, text: str):
        print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")
    
    def print_error(self, text: str):
        print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")
    
    def print_warning(self, text: str):
        print(f"{Colors.WARNING}⚠️ {text}{Colors.ENDC}")
    
    def run_command(self, command: str, timeout: int = 30) -> tuple[bool, str]:
        """Run a command and return success status and output."""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding='utf-8',
                errors='replace'
            )
            return result.returncode == 0, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, "Command timed out"
        except Exception as e:
            return False, str(e)
    
    async def test_backend_health(self) -> TestResult:
        """Test backend server health."""
        start_time = time.time()
        self.print_test("Backend Health")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.config['backend_url']}/api/v1/health",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            duration = time.time() - start_time
                            self.print_success("Backend health check passed")
                            return TestResult("Backend Health", True, "Health endpoint responding", duration)
                        else:
                            return TestResult("Backend Health", False, "Health check returned success=false")
                    else:
                        return TestResult("Backend Health", False, f"HTTP {response.status}")
        except Exception as e:
            return TestResult("Backend Health", False, f"Connection failed: {str(e)}")
    
    async def test_api_endpoints(self) -> List[TestResult]:
        """Test all API endpoints."""
        self.print_test("API Endpoints")
        results = []
        
        endpoints = [
            ("GET", "/api/v1/health", None),
            ("GET", "/api/v1/stats", None),
            ("POST", "/api/v1/query", {"query": "test query", "max_results": 5}),
            ("POST", "/api/v1/explain", {"code": "print('hello')", "language": "python"}),
            ("POST", "/api/v1/generate", {"prompt": "create a hello world function", "language": "python"}),
        ]
        
        async with aiohttp.ClientSession() as session:
            for method, endpoint, payload in endpoints:
                start_time = time.time()
                try:
                    url = f"{self.config['backend_url']}{endpoint}"
                    
                    if method == "GET":
                        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                            success = response.status == 200
                            message = f"HTTP {response.status}"
                    else:
                        async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=30)) as response:
                            success = response.status == 200
                            message = f"HTTP {response.status}"
                    
                    duration = time.time() - start_time
                    results.append(TestResult(f"API {method} {endpoint}", success, message, duration))
                    
                    if success:
                        self.print_success(f"{method} {endpoint}")
                    else:
                        self.print_error(f"{method} {endpoint}: {message}")
                        
                except Exception as e:
                    duration = time.time() - start_time
                    results.append(TestResult(f"API {method} {endpoint}", False, str(e), duration))
                    self.print_error(f"{method} {endpoint}: {str(e)}")
        
        return results
    
    def test_docker_services(self) -> List[TestResult]:
        """Test Docker services."""
        self.print_test("Docker Services")
        results = []
        
        # Check if Docker is running
        success, output = self.run_command("docker ps")
        if not success:
            results.append(TestResult("Docker Status", False, "Docker not running"))
            self.print_error("Docker not running")
            return results
        
        results.append(TestResult("Docker Status", True, "Docker is running"))
        self.print_success("Docker is running")
        
        # Check individual services
        services = ["qdrant", "redis", "postgres"]
        for service in services:
            success, output = self.run_command(f"docker-compose ps {service}")
            if "Up" in output:
                results.append(TestResult(f"Docker {service}", True, "Service is up"))
                self.print_success(f"{service} service is up")
            else:
                results.append(TestResult(f"Docker {service}", False, "Service not running"))
                self.print_error(f"{service} service not running")
        
        return results
    
    def test_python_environment(self) -> List[TestResult]:
        """Test Python environment and dependencies."""
        self.print_test("Python Environment")
        results = []
        
        # Check Python version
        python_version = sys.version_info
        if python_version >= (3, 8):
            results.append(TestResult("Python Version", True, f"Python {python_version.major}.{python_version.minor}"))
            self.print_success(f"Python {python_version.major}.{python_version.minor}")
        else:
            results.append(TestResult("Python Version", False, f"Python {python_version.major}.{python_version.minor} < 3.8"))
            self.print_error(f"Python {python_version.major}.{python_version.minor} is too old")
        
        # Check virtual environment
        venv_path = self.project_root / "server" / "venv"
        if venv_path.exists():
            results.append(TestResult("Virtual Environment", True, "venv exists"))
            self.print_success("Virtual environment found")
        else:
            results.append(TestResult("Virtual Environment", False, "venv not found"))
            self.print_error("Virtual environment not found")
        
        # Test key imports
        test_imports = [
            "fastapi", "uvicorn", "pydantic", "httpx",
            "qdrant_client", "redis", "dotenv"
        ]
        
        for package in test_imports:
            try:
                __import__(package)
                results.append(TestResult(f"Import {package}", True, "Import successful"))
                self.print_success(f"✓ {package}")
            except ImportError as e:
                results.append(TestResult(f"Import {package}", False, str(e)))
                self.print_error(f"✗ {package}: {str(e)}")
        
        return results
    
    def test_extension_build(self) -> List[TestResult]:
        """Test VS Code extension build."""
        self.print_test("VS Code Extension")
        results = []
        
        extension_dir = self.project_root / "extension"
        if not extension_dir.exists():
            results.append(TestResult("Extension Directory", False, "Directory not found"))
            return results
        
        # Check package.json
        package_json = extension_dir / "package.json"
        if package_json.exists():
            results.append(TestResult("Extension package.json", True, "File exists"))
            self.print_success("package.json found")
        else:
            results.append(TestResult("Extension package.json", False, "File not found"))
            self.print_error("package.json not found")
            return results
        
        # Check if compiled
        out_dir = extension_dir / "out"
        if out_dir.exists():
            results.append(TestResult("Extension Compilation", True, "Compiled output exists"))
            self.print_success("Extension compiled")
        else:
            results.append(TestResult("Extension Compilation", False, "No compiled output"))
            self.print_warning("Extension not compiled")
        
        # Check node_modules
        node_modules = extension_dir / "node_modules"
        if node_modules.exists():
            results.append(TestResult("Extension Dependencies", True, "node_modules exists"))
            self.print_success("Dependencies installed")
        else:
            results.append(TestResult("Extension Dependencies", False, "node_modules not found"))
            self.print_error("Dependencies not installed")
        
        return results
    
    def test_ai_providers(self) -> List[TestResult]:
        """Test AI provider availability."""
        self.print_test("AI Providers")
        results = []

        # Test Ollama - check both PATH and direct location
        success, output = self.run_command("ollama --version", timeout=10)
        if not success and self.system == "windows":
            # Try direct path on Windows
            ollama_path = os.path.expanduser(r"~\AppData\Local\Programs\Ollama\ollama.exe")
            if os.path.exists(ollama_path):
                success, output = self.run_command(f'"{ollama_path}" --version', timeout=10)

        if success:
            results.append(TestResult("Ollama Installation", True, "Ollama available"))
            self.print_success("Ollama installed")
            
            # Test Ollama service
            ollama_cmd = "ollama"
            if self.system == "windows":
                ollama_path = os.path.expanduser(r"~\AppData\Local\Programs\Ollama\ollama.exe")
                if os.path.exists(ollama_path):
                    ollama_cmd = f'"{ollama_path}"'

            success, output = self.run_command(f"{ollama_cmd} list", timeout=10)
            if success:
                results.append(TestResult("Ollama Service", True, "Service responding"))
                self.print_success("Ollama service running")
                
                # Check for models
                if "codellama" in output.lower():
                    results.append(TestResult("Ollama Models", True, "CodeLlama available"))
                    self.print_success("CodeLlama model found")
                else:
                    results.append(TestResult("Ollama Models", False, "No models found"))
                    self.print_warning("No Ollama models installed")
            else:
                results.append(TestResult("Ollama Service", False, "Service not responding"))
                self.print_error("Ollama service not running")
        else:
            results.append(TestResult("Ollama Installation", False, "Ollama not found"))
            self.print_error("Ollama not installed")
        
        return results
    
    def test_cross_platform_compatibility(self) -> List[TestResult]:
        """Test cross-platform compatibility."""
        self.print_test("Cross-Platform Compatibility")
        results = []
        
        # Test system-specific features
        system_info = {
            "system": platform.system(),
            "release": platform.release(),
            "machine": platform.machine(),
            "python_version": platform.python_version()
        }
        
        results.append(TestResult("System Detection", True, f"Detected {system_info['system']}"))
        self.print_success(f"Running on {system_info['system']} {system_info['release']}")
        
        # Test path handling
        test_paths = [
            self.project_root / "server",
            self.project_root / "extension",
            self.project_root / "docs"
        ]
        
        for path in test_paths:
            if path.exists():
                results.append(TestResult(f"Path {path.name}", True, "Path accessible"))
            else:
                results.append(TestResult(f"Path {path.name}", False, "Path not found"))
        
        return results
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return comprehensive results."""
        print(f"\n{Colors.BOLD}🧪 AI Coding Assistant - Comprehensive Test Suite{Colors.ENDC}")
        print(f"System: {platform.system()} {platform.release()}")
        print(f"Python: {platform.python_version()}")
        print("=" * 60)
        
        all_results = []
        
        # Backend tests
        backend_health = await self.test_backend_health()
        all_results.append(backend_health)
        
        if backend_health.passed:
            api_results = await self.test_api_endpoints()
            all_results.extend(api_results)
        
        # Infrastructure tests
        docker_results = self.test_docker_services()
        all_results.extend(docker_results)
        
        # Environment tests
        python_results = self.test_python_environment()
        all_results.extend(python_results)
        
        # Extension tests
        extension_results = self.test_extension_build()
        all_results.extend(extension_results)
        
        # AI provider tests
        ai_results = self.test_ai_providers()
        all_results.extend(ai_results)
        
        # Platform tests
        platform_results = self.test_cross_platform_compatibility()
        all_results.extend(platform_results)
        
        # Generate summary
        passed = sum(1 for r in all_results if r.passed)
        total = len(all_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"\n{Colors.BOLD}📊 Test Summary{Colors.ENDC}")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {Colors.OKGREEN}{passed}{Colors.ENDC}")
        print(f"Failed: {Colors.FAIL}{total - passed}{Colors.ENDC}")
        print(f"Success Rate: {Colors.OKGREEN if success_rate >= 80 else Colors.FAIL}{success_rate:.1f}%{Colors.ENDC}")
        
        # Detailed results
        print(f"\n{Colors.BOLD}📋 Detailed Results{Colors.ENDC}")
        print("=" * 60)
        
        for result in all_results:
            status = f"{Colors.OKGREEN}✅ PASS{Colors.ENDC}" if result.passed else f"{Colors.FAIL}❌ FAIL{Colors.ENDC}"
            duration_str = f" ({result.duration:.2f}s)" if result.duration > 0 else ""
            print(f"{result.name:<30} {status}{duration_str}")
            if not result.passed and result.message:
                print(f"    {Colors.WARNING}└─ {result.message}{Colors.ENDC}")
        
        return {
            "total_tests": total,
            "passed_tests": passed,
            "failed_tests": total - passed,
            "success_rate": success_rate,
            "results": [
                {
                    "name": r.name,
                    "passed": r.passed,
                    "message": r.message,
                    "duration": r.duration
                }
                for r in all_results
            ],
            "system_info": {
                "platform": platform.system(),
                "release": platform.release(),
                "machine": platform.machine(),
                "python_version": platform.python_version()
            }
        }

async def main():
    """Main test runner."""
    test_suite = ComprehensiveTestSuite()
    results = await test_suite.run_all_tests()
    
    # Save results to file
    results_file = test_suite.project_root / "tests" / "test_results.json"
    results_file.parent.mkdir(exist_ok=True)
    
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Results saved to: {results_file}")
    
    # Exit with appropriate code
    exit_code = 0 if results["success_rate"] >= 80 else 1
    sys.exit(exit_code)

if __name__ == "__main__":
    asyncio.run(main())
