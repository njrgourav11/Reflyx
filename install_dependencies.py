#!/usr/bin/env python3
"""
Dependency Installation Script for AI Coding Assistant
Automatically installs missing dependencies on Windows, macOS, and Linux.
"""

import os
import sys
import subprocess
import platform
import urllib.request
import zipfile
import shutil
from pathlib import Path
import json

class Colors:
    """ANSI color codes for terminal output."""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class DependencyInstaller:
    """Handles installation of missing dependencies."""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.arch = platform.machine().lower()
        self.project_root = Path(__file__).parent
        
    def print_step(self, text: str):
        print(f"{Colors.OKBLUE}🔧 {text}{Colors.ENDC}")
        
    def print_success(self, text: str):
        print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")
        
    def print_error(self, text: str):
        print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")
        
    def print_warning(self, text: str):
        print(f"{Colors.WARNING}⚠️ {text}{Colors.ENDC}")
    
    def run_command(self, command: str, shell: bool = True) -> tuple[bool, str]:
        """Run a command and return success status and output."""
        try:
            result = subprocess.run(
                command,
                shell=shell,
                capture_output=True,
                text=True,
                timeout=300
            )
            return result.returncode == 0, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, "Command timed out"
        except Exception as e:
            return False, str(e)
    
    def check_command_exists(self, command: str) -> bool:
        """Check if a command exists in PATH."""
        success, _ = self.run_command(f"where {command}" if self.system == "windows" else f"which {command}")
        return success
    
    def install_nodejs(self) -> bool:
        """Install Node.js if not present."""
        if self.check_command_exists("node") and self.check_command_exists("npm"):
            self.print_success("Node.js and npm are already installed")
            return True
            
        self.print_step("Installing Node.js...")
        
        if self.system == "windows":
            return self._install_nodejs_windows()
        elif self.system == "darwin":
            return self._install_nodejs_macos()
        else:
            return self._install_nodejs_linux()
    
    def _install_nodejs_windows(self) -> bool:
        """Install Node.js on Windows."""
        try:
            # Download Node.js installer
            node_url = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
            installer_path = self.project_root / "node_installer.msi"
            
            self.print_step("Downloading Node.js installer...")
            urllib.request.urlretrieve(node_url, installer_path)
            
            # Run installer
            self.print_step("Running Node.js installer...")
            success, output = self.run_command(f'msiexec /i "{installer_path}" /quiet /norestart')
            
            # Cleanup
            if installer_path.exists():
                installer_path.unlink()
            
            if success:
                self.print_success("Node.js installed successfully")
                # Add to PATH for current session
                node_path = r"C:\Program Files\nodejs"
                current_path = os.environ.get("PATH", "")
                if node_path not in current_path:
                    os.environ["PATH"] = f"{node_path};{current_path}"
                return True
            else:
                self.print_error(f"Failed to install Node.js: {output}")
                return False
                
        except Exception as e:
            self.print_error(f"Error installing Node.js: {e}")
            return False
    
    def _install_nodejs_macos(self) -> bool:
        """Install Node.js on macOS."""
        # Try Homebrew first
        if self.check_command_exists("brew"):
            success, output = self.run_command("brew install node")
            if success:
                self.print_success("Node.js installed via Homebrew")
                return True
        
        # Fallback to direct download
        try:
            node_url = "https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg"
            installer_path = self.project_root / "node_installer.pkg"
            
            urllib.request.urlretrieve(node_url, installer_path)
            success, output = self.run_command(f"sudo installer -pkg {installer_path} -target /")
            
            if installer_path.exists():
                installer_path.unlink()
                
            return success
        except Exception as e:
            self.print_error(f"Error installing Node.js: {e}")
            return False
    
    def _install_nodejs_linux(self) -> bool:
        """Install Node.js on Linux."""
        # Try different package managers
        package_managers = [
            ("apt-get", "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"),
            ("yum", "curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - && sudo yum install -y nodejs"),
            ("dnf", "curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - && sudo dnf install -y nodejs"),
            ("pacman", "sudo pacman -S nodejs npm"),
        ]
        
        for pm, install_cmd in package_managers:
            if self.check_command_exists(pm):
                success, output = self.run_command(install_cmd)
                if success:
                    self.print_success(f"Node.js installed via {pm}")
                    return True
        
        self.print_error("Could not install Node.js - no supported package manager found")
        return False
    
    def install_docker(self) -> bool:
        """Install Docker if not present."""
        if self.check_command_exists("docker"):
            self.print_success("Docker is already installed")
            return True
            
        self.print_step("Installing Docker...")
        
        if self.system == "windows":
            return self._install_docker_windows()
        elif self.system == "darwin":
            return self._install_docker_macos()
        else:
            return self._install_docker_linux()
    
    def _install_docker_windows(self) -> bool:
        """Install Docker Desktop on Windows."""
        try:
            docker_url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
            installer_path = self.project_root / "DockerDesktopInstaller.exe"
            
            self.print_step("Downloading Docker Desktop installer...")
            urllib.request.urlretrieve(docker_url, installer_path)
            
            self.print_step("Running Docker Desktop installer...")
            success, output = self.run_command(f'"{installer_path}" install --quiet')
            
            if installer_path.exists():
                installer_path.unlink()
            
            if success:
                self.print_success("Docker Desktop installed successfully")
                self.print_warning("Please restart your computer and start Docker Desktop manually")
                return True
            else:
                self.print_error(f"Failed to install Docker Desktop: {output}")
                return False
                
        except Exception as e:
            self.print_error(f"Error installing Docker Desktop: {e}")
            return False
    
    def _install_docker_macos(self) -> bool:
        """Install Docker Desktop on macOS."""
        if self.check_command_exists("brew"):
            success, output = self.run_command("brew install --cask docker")
            if success:
                self.print_success("Docker Desktop installed via Homebrew")
                return True
        
        # Manual installation
        try:
            if "arm" in self.arch or "aarch64" in self.arch:
                docker_url = "https://desktop.docker.com/mac/main/arm64/Docker.dmg"
            else:
                docker_url = "https://desktop.docker.com/mac/main/amd64/Docker.dmg"
                
            installer_path = self.project_root / "Docker.dmg"
            urllib.request.urlretrieve(docker_url, installer_path)
            
            # Mount and install
            self.run_command(f"hdiutil attach {installer_path}")
            self.run_command("cp -R /Volumes/Docker/Docker.app /Applications/")
            self.run_command("hdiutil detach /Volumes/Docker")
            
            if installer_path.exists():
                installer_path.unlink()
                
            self.print_success("Docker Desktop installed successfully")
            return True
            
        except Exception as e:
            self.print_error(f"Error installing Docker Desktop: {e}")
            return False
    
    def _install_docker_linux(self) -> bool:
        """Install Docker on Linux."""
        # Install Docker Engine
        if self.check_command_exists("apt-get"):
            commands = [
                "sudo apt-get update",
                "sudo apt-get install -y ca-certificates curl gnupg lsb-release",
                "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
                'echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null',
                "sudo apt-get update",
                "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin"
            ]
        elif self.check_command_exists("yum"):
            commands = [
                "sudo yum install -y yum-utils",
                "sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo",
                "sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin"
            ]
        else:
            self.print_error("Unsupported Linux distribution for automatic Docker installation")
            return False
        
        for cmd in commands:
            success, output = self.run_command(cmd)
            if not success:
                self.print_error(f"Failed to run: {cmd}")
                return False
        
        # Start Docker service
        self.run_command("sudo systemctl start docker")
        self.run_command("sudo systemctl enable docker")
        
        # Add user to docker group
        username = os.getenv("USER", "")
        if username:
            self.run_command(f"sudo usermod -aG docker {username}")
            self.print_warning("Please log out and log back in for Docker permissions to take effect")
        
        self.print_success("Docker installed successfully")
        return True
    
    def install_ollama(self) -> bool:
        """Install Ollama if not present."""
        if self.check_command_exists("ollama"):
            self.print_success("Ollama is already installed")
            return True
            
        self.print_step("Installing Ollama...")
        
        if self.system == "windows":
            return self._install_ollama_windows()
        elif self.system == "darwin":
            return self._install_ollama_macos()
        else:
            return self._install_ollama_linux()
    
    def _install_ollama_windows(self) -> bool:
        """Install Ollama on Windows."""
        try:
            ollama_url = "https://ollama.com/download/OllamaSetup.exe"
            installer_path = self.project_root / "OllamaSetup.exe"
            
            self.print_step("Downloading Ollama installer...")
            urllib.request.urlretrieve(ollama_url, installer_path)
            
            self.print_step("Running Ollama installer...")
            success, output = self.run_command(f'"{installer_path}" /S')
            
            if installer_path.exists():
                installer_path.unlink()
            
            if success:
                self.print_success("Ollama installed successfully")
                # Add to PATH
                ollama_path = os.path.expanduser("~\\AppData\\Local\\Programs\\Ollama")
                current_path = os.environ.get("PATH", "")
                if ollama_path not in current_path:
                    os.environ["PATH"] = f"{ollama_path};{current_path}"
                return True
            else:
                self.print_error(f"Failed to install Ollama: {output}")
                return False
                
        except Exception as e:
            self.print_error(f"Error installing Ollama: {e}")
            return False
    
    def _install_ollama_macos(self) -> bool:
        """Install Ollama on macOS."""
        try:
            # Use the official install script
            success, output = self.run_command("curl -fsSL https://ollama.com/install.sh | sh")
            if success:
                self.print_success("Ollama installed successfully")
                return True
            else:
                self.print_error(f"Failed to install Ollama: {output}")
                return False
        except Exception as e:
            self.print_error(f"Error installing Ollama: {e}")
            return False
    
    def _install_ollama_linux(self) -> bool:
        """Install Ollama on Linux."""
        try:
            # Use the official install script
            success, output = self.run_command("curl -fsSL https://ollama.com/install.sh | sh")
            if success:
                self.print_success("Ollama installed successfully")
                return True
            else:
                self.print_error(f"Failed to install Ollama: {output}")
                return False
        except Exception as e:
            self.print_error(f"Error installing Ollama: {e}")
            return False
    
    def run_installation(self):
        """Run the complete dependency installation process."""
        print(f"\n{Colors.HEADER}{Colors.BOLD}🔧 AI Coding Assistant - Dependency Installer{Colors.ENDC}")
        print(f"{Colors.OKCYAN}Installing missing dependencies for {self.system.title()}...{Colors.ENDC}\n")
        
        success_count = 0
        total_count = 4
        
        # Install Node.js
        if self.install_nodejs():
            success_count += 1
        
        # Install Docker
        if self.install_docker():
            success_count += 1
        
        # Install Ollama
        if self.install_ollama():
            success_count += 1
        
        # Check Python
        if sys.version_info >= (3, 8):
            self.print_success("Python 3.8+ is available")
            success_count += 1
        else:
            self.print_error("Python 3.8+ is required but not found")
        
        print(f"\n{Colors.HEADER}{Colors.BOLD}Installation Summary{Colors.ENDC}")
        print(f"Successfully installed: {success_count}/{total_count} dependencies")
        
        if success_count == total_count:
            self.print_success("All dependencies installed successfully!")
            print(f"\n{Colors.OKCYAN}Next steps:{Colors.ENDC}")
            print("1. Restart your terminal/command prompt")
            print("2. Run: python setup.py --mode local")
            print("3. Follow the setup instructions")
            return True
        else:
            self.print_warning("Some dependencies could not be installed automatically")
            print(f"\n{Colors.OKCYAN}Manual installation may be required for:{Colors.ENDC}")
            if not self.check_command_exists("node"):
                print("• Node.js: https://nodejs.org/")
            if not self.check_command_exists("docker"):
                print("• Docker: https://docker.com/")
            if not self.check_command_exists("ollama"):
                print("• Ollama: https://ollama.ai/")
            return False

if __name__ == "__main__":
    installer = DependencyInstaller()
    installer.run_installation()
