#!/usr/bin/env python3
"""
Cross-Platform Testing Suite for AI Coding Assistant
Tests compatibility across Windows, macOS, and Linux platforms.
"""

import os
import sys
import platform
import subprocess
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CrossPlatformTester:
    """Tests cross-platform compatibility and functionality."""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.project_root = Path(__file__).parent.parent
        self.test_results = []
        
    def get_system_info(self) -> Dict[str, str]:
        """Get detailed system information."""
        return {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "python_version": platform.python_version(),
            "python_implementation": platform.python_implementation(),
            "architecture": platform.architecture()[0]
        }
    
    def test_path_handling(self) -> List[Dict[str, Any]]:
        """Test path handling across platforms."""
        results = []
        
        # Test different path formats
        test_paths = [
            "server/app/main.py",
            "extension/src/extension.ts",
            "docs/README.md",
            "tests/test_config.json"
        ]
        
        for path_str in test_paths:
            try:
                # Test Path object creation
                path_obj = Path(path_str)
                
                # Test path resolution
                resolved = path_obj.resolve()
                
                # Test path operations
                parent = path_obj.parent
                name = path_obj.name
                suffix = path_obj.suffix
                
                results.append({
                    "test": f"Path handling: {path_str}",
                    "passed": True,
                    "details": {
                        "resolved": str(resolved),
                        "parent": str(parent),
                        "name": name,
                        "suffix": suffix
                    }
                })
                
            except Exception as e:
                results.append({
                    "test": f"Path handling: {path_str}",
                    "passed": False,
                    "error": str(e)
                })
        
        return results
    
    def test_command_execution(self) -> List[Dict[str, Any]]:
        """Test command execution across platforms."""
        results = []
        
        # Platform-specific commands
        if self.system == "windows":
            test_commands = [
                ("dir", "List directory contents"),
                ("echo Hello", "Echo command"),
                ("where python", "Find Python executable"),
                ("powershell -Command Get-Process", "PowerShell command")
            ]
        else:  # Unix-like (macOS, Linux)
            test_commands = [
                ("ls", "List directory contents"),
                ("echo Hello", "Echo command"),
                ("which python3", "Find Python executable"),
                ("ps aux | head -5", "Process list")
            ]
        
        for command, description in test_commands:
            try:
                result = subprocess.run(
                    command,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                results.append({
                    "test": f"Command execution: {description}",
                    "passed": result.returncode == 0,
                    "command": command,
                    "return_code": result.returncode,
                    "output_length": len(result.stdout)
                })
                
            except Exception as e:
                results.append({
                    "test": f"Command execution: {description}",
                    "passed": False,
                    "command": command,
                    "error": str(e)
                })
        
        return results
    
    def test_file_operations(self) -> List[Dict[str, Any]]:
        """Test file operations across platforms."""
        results = []
        
        # Create temporary directory for testing
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Test file creation
            try:
                test_file = temp_path / "test_file.txt"
                test_file.write_text("Hello, World!", encoding='utf-8')
                
                results.append({
                    "test": "File creation",
                    "passed": test_file.exists(),
                    "path": str(test_file)
                })
                
            except Exception as e:
                results.append({
                    "test": "File creation",
                    "passed": False,
                    "error": str(e)
                })
            
            # Test directory creation
            try:
                test_dir = temp_path / "test_directory"
                test_dir.mkdir()
                
                results.append({
                    "test": "Directory creation",
                    "passed": test_dir.exists() and test_dir.is_dir(),
                    "path": str(test_dir)
                })
                
            except Exception as e:
                results.append({
                    "test": "Directory creation",
                    "passed": False,
                    "error": str(e)
                })
            
            # Test file permissions (Unix-like systems)
            if self.system != "windows":
                try:
                    test_file = temp_path / "permission_test.txt"
                    test_file.write_text("test")
                    
                    # Make file executable
                    test_file.chmod(0o755)
                    
                    # Check if file is executable
                    is_executable = os.access(test_file, os.X_OK)
                    
                    results.append({
                        "test": "File permissions",
                        "passed": is_executable,
                        "path": str(test_file)
                    })
                    
                except Exception as e:
                    results.append({
                        "test": "File permissions",
                        "passed": False,
                        "error": str(e)
                    })
        
        return results
    
    def test_environment_variables(self) -> List[Dict[str, Any]]:
        """Test environment variable handling."""
        results = []
        
        # Test reading common environment variables
        common_vars = ["PATH", "HOME", "USER"]
        if self.system == "windows":
            common_vars.extend(["USERPROFILE", "APPDATA", "LOCALAPPDATA"])
        
        for var in common_vars:
            try:
                value = os.environ.get(var)
                results.append({
                    "test": f"Environment variable: {var}",
                    "passed": value is not None,
                    "variable": var,
                    "has_value": value is not None,
                    "value_length": len(value) if value else 0
                })
                
            except Exception as e:
                results.append({
                    "test": f"Environment variable: {var}",
                    "passed": False,
                    "variable": var,
                    "error": str(e)
                })
        
        # Test setting and reading custom environment variable
        try:
            test_var = "AI_CODING_ASSISTANT_TEST"
            test_value = "test_value_123"
            
            os.environ[test_var] = test_value
            retrieved_value = os.environ.get(test_var)
            
            results.append({
                "test": "Custom environment variable",
                "passed": retrieved_value == test_value,
                "variable": test_var,
                "expected": test_value,
                "actual": retrieved_value
            })
            
            # Clean up
            del os.environ[test_var]
            
        except Exception as e:
            results.append({
                "test": "Custom environment variable",
                "passed": False,
                "error": str(e)
            })
        
        return results
    
    def test_network_connectivity(self) -> List[Dict[str, Any]]:
        """Test network connectivity and DNS resolution."""
        results = []
        
        # Test DNS resolution
        import socket
        
        test_hosts = [
            ("google.com", 80),
            ("github.com", 443),
            ("api.openai.com", 443),
            ("localhost", 8000)
        ]
        
        for host, port in test_hosts:
            try:
                # Test DNS resolution
                ip = socket.gethostbyname(host)
                
                # Test connection (with timeout)
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(5)
                result = sock.connect_ex((host, port))
                sock.close()
                
                results.append({
                    "test": f"Network connectivity: {host}:{port}",
                    "passed": result == 0,
                    "host": host,
                    "port": port,
                    "ip": ip,
                    "connection_result": result
                })
                
            except Exception as e:
                results.append({
                    "test": f"Network connectivity: {host}:{port}",
                    "passed": False,
                    "host": host,
                    "port": port,
                    "error": str(e)
                })
        
        return results
    
    def test_unicode_handling(self) -> List[Dict[str, Any]]:
        """Test Unicode and encoding handling."""
        results = []
        
        # Test Unicode strings
        test_strings = [
            "Hello, World!",
            "Héllo, Wörld!",
            "こんにちは世界",
            "🤖 AI Coding Assistant 🚀",
            "Ελληνικά",
            "العربية"
        ]
        
        for test_string in test_strings:
            try:
                # Test encoding/decoding
                encoded = test_string.encode('utf-8')
                decoded = encoded.decode('utf-8')
                
                # Test file I/O with Unicode
                with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', delete=False) as f:
                    f.write(test_string)
                    temp_file = f.name
                
                with open(temp_file, 'r', encoding='utf-8') as f:
                    read_string = f.read()
                
                os.unlink(temp_file)
                
                results.append({
                    "test": f"Unicode handling: {test_string[:20]}...",
                    "passed": decoded == test_string and read_string == test_string,
                    "original_length": len(test_string),
                    "encoded_length": len(encoded),
                    "file_io_success": read_string == test_string
                })
                
            except Exception as e:
                results.append({
                    "test": f"Unicode handling: {test_string[:20]}...",
                    "passed": False,
                    "error": str(e)
                })
        
        return results
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all cross-platform tests."""
        print(f"🌐 Cross-Platform Testing Suite")
        print(f"System: {platform.system()} {platform.release()}")
        print("=" * 50)
        
        all_results = []
        
        # Run test suites
        test_suites = [
            ("System Info", lambda: [{"test": "System detection", "passed": True, "info": self.get_system_info()}]),
            ("Path Handling", self.test_path_handling),
            ("Command Execution", self.test_command_execution),
            ("File Operations", self.test_file_operations),
            ("Environment Variables", self.test_environment_variables),
            ("Network Connectivity", self.test_network_connectivity),
            ("Unicode Handling", self.test_unicode_handling)
        ]
        
        for suite_name, test_func in test_suites:
            print(f"\n🧪 Testing {suite_name}...")
            try:
                suite_results = test_func()
                all_results.extend(suite_results)
                
                passed = sum(1 for r in suite_results if r.get("passed", False))
                total = len(suite_results)
                print(f"   {passed}/{total} tests passed")
                
            except Exception as e:
                print(f"   ❌ Suite failed: {e}")
                all_results.append({
                    "test": f"{suite_name} (suite)",
                    "passed": False,
                    "error": str(e)
                })
        
        # Generate summary
        total_tests = len(all_results)
        passed_tests = sum(1 for r in all_results if r.get("passed", False))
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        summary = {
            "system_info": self.get_system_info(),
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "success_rate": success_rate,
            "results": all_results
        }
        
        print(f"\n📊 Cross-Platform Test Summary")
        print("=" * 50)
        print(f"Platform: {summary['system_info']['system']} {summary['system_info']['release']}")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        return summary

def main():
    """Main test runner."""
    tester = CrossPlatformTester()
    results = tester.run_all_tests()
    
    # Save results
    results_file = Path(__file__).parent / f"cross_platform_results_{platform.system().lower()}.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📄 Results saved to: {results_file}")
    
    # Exit with appropriate code
    exit_code = 0 if results["success_rate"] >= 90 else 1
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
