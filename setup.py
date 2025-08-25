#!/usr/bin/env python3
"""
AI Coding Assistant Setup Script
Automated setup for the entire AI coding assistant project with dual-mode AI support.
Enhanced with support for local (Ollama) and online (GPT-4o, Claude-3.5-Sonnet, etc.) AI providers.
"""

import os
import sys
import subprocess
import platform
import json
import shutil
import argparse
import urllib.request
import zipfile
import tarfile
import time
from pathlib import Path
from typing import List, Dict, Optional, Tuple

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
    UNDERLINE = '\033[4m'

class SetupManager:
    """Enhanced setup manager for the AI coding assistant with dual-mode support."""

    def __init__(self, setup_mode: str = "hybrid"):
        self.project_root = Path(__file__).parent
        self.system = platform.system().lower()
        self.setup_mode = setup_mode  # local, online, hybrid
        self.errors: List[str] = []
        self.warnings: List[str] = []

        # Setup configuration
        self.config = {
            "install_ollama": setup_mode in ["local", "hybrid"],
            "install_models": setup_mode in ["local", "hybrid"],
            "setup_cloud_apis": setup_mode in ["online", "hybrid"],
            "install_docker": True,
            "install_nodejs": True,
            "build_extension": True,
            "create_env_file": True
        }
        
    def print_header(self, text: str):
        """Print a formatted header."""
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")
        
    def print_step(self, text: str):
        """Print a setup step."""
        print(f"{Colors.OKBLUE}🔧 {text}{Colors.ENDC}")
        
    def print_success(self, text: str):
        """Print a success message."""
        print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")
        
    def print_warning(self, text: str):
        """Print a warning message."""
        print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")
        self.warnings.append(text)
        
    def print_error(self, text: str):
        """Print an error message."""
        print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")
        self.errors.append(text)
        
    def run_command(self, command: List[str], cwd: Optional[Path] = None, check: bool = True) -> bool:
        """Run a shell command and return success status."""
        try:
            result = subprocess.run(
                command,
                cwd=cwd or self.project_root,
                check=check,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except subprocess.CalledProcessError as e:
            self.print_error(f"Command failed: {' '.join(command)}")
            self.print_error(f"Error: {e.stderr}")
            return False
        except FileNotFoundError:
            self.print_error(f"Command not found: {command[0]}")
            return False
            
    def check_prerequisites(self) -> bool:
        """Check if all required software is installed."""
        self.print_step("Checking prerequisites...")
        
        required_tools = {
            'python': ['python', '--version'],
            'node': ['node', '--version'],
            'npm': ['npm', '--version'],
            'docker': ['docker', '--version'],
            'git': ['git', '--version']
        }
        
        missing_tools = []
        
        for tool, command in required_tools.items():
            if not self.run_command(command, check=False):
                missing_tools.append(tool)
                
        if missing_tools:
            self.print_error(f"Missing required tools: {', '.join(missing_tools)}")
            self.print_error("Please install the missing tools and run setup again.")
            return False
            
        self.print_success("All prerequisites are installed!")
        return True
        
    def setup_python_environment(self) -> bool:
        """Set up Python virtual environment and install dependencies."""
        self.print_step("Setting up Python environment...")
        
        server_dir = self.project_root / "server"
        venv_dir = server_dir / "venv"
        
        # Create virtual environment
        if not venv_dir.exists():
            if not self.run_command([sys.executable, '-m', 'venv', str(venv_dir)]):
                return False
                
        # Determine activation script
        if self.system == 'windows':
            activate_script = venv_dir / "Scripts" / "activate.bat"
            pip_executable = venv_dir / "Scripts" / "pip.exe"
        else:
            activate_script = venv_dir / "bin" / "activate"
            pip_executable = venv_dir / "bin" / "pip"
            
        # Install requirements
        requirements_file = server_dir / "requirements.txt"
        if requirements_file.exists():
            if not self.run_command([str(pip_executable), 'install', '-r', str(requirements_file)]):
                return False
                
        self.print_success("Python environment set up successfully!")
        return True
        
    def setup_node_environment(self) -> bool:
        """Set up Node.js environment for the VS Code extension."""
        self.print_step("Setting up Node.js environment...")
        
        extension_dir = self.project_root / "extension"
        
        if not extension_dir.exists():
            self.print_warning("Extension directory not found, skipping Node.js setup")
            return True
            
        # Install npm dependencies
        if not self.run_command(['npm', 'install'], cwd=extension_dir):
            return False
            
        # Compile TypeScript
        if not self.run_command(['npm', 'run', 'compile'], cwd=extension_dir):
            self.print_warning("TypeScript compilation failed, but continuing...")
            
        self.print_success("Node.js environment set up successfully!")
        return True
        
    def setup_docker_services(self) -> bool:
        """Set up Docker services."""
        self.print_step("Setting up Docker services...")
        
        # Check if Docker is running
        if not self.run_command(['docker', 'info'], check=False):
            self.print_error("Docker is not running. Please start Docker and try again.")
            return False
            
        # Pull required Docker images
        images = ['qdrant/qdrant:latest', 'redis:7-alpine']
        
        for image in images:
            self.print_step(f"Pulling Docker image: {image}")
            if not self.run_command(['docker', 'pull', image]):
                self.print_warning(f"Failed to pull {image}, but continuing...")
                
        self.print_success("Docker services set up successfully!")
        return True
        
    def setup_ollama(self) -> bool:
        """Set up Ollama and download required models."""
        self.print_step("Setting up Ollama...")
        
        # Check if Ollama is installed
        if not self.run_command(['ollama', '--version'], check=False):
            self.print_warning("Ollama not found. Please install from https://ollama.ai")
            self.print_warning("After installation, run: ollama pull codellama:7b-code")
            return True
            
        # Pull required models
        models = ['codellama:7b-code', 'deepseek-coder:6.7b']
        
        for model in models:
            self.print_step(f"Pulling Ollama model: {model}")
            if not self.run_command(['ollama', 'pull', model], check=False):
                self.print_warning(f"Failed to pull {model}, you can install it later")
                
        self.print_success("Ollama setup completed!")
        return True
        
    def create_env_files(self) -> bool:
        """Create environment configuration files."""
        self.print_step("Creating environment files...")
        
        # Backend .env file
        backend_env = self.project_root / "server" / ".env"
        if not backend_env.exists():
            env_content = """# AI Coding Assistant Backend Configuration

# Vector Database
QDRANT_URL=http://localhost:6333

# Local LLM
OLLAMA_URL=http://localhost:11434

# Embedding Model
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Logging
LOG_LEVEL=INFO

# Optional: Cloud API Keys (Free Tiers)
# OPENAI_API_KEY=your_openai_key_here
# GROQ_API_KEY=your_groq_key_here
# ANTHROPIC_API_KEY=your_anthropic_key_here

# Redis Cache (Optional)
REDIS_URL=redis://localhost:6379

# Performance Settings
MAX_CHUNK_SIZE=500
MAX_RETRIEVAL_COUNT=10
MAX_CONCURRENT_REQUESTS=50
"""
            backend_env.write_text(env_content)
            
        self.print_success("Environment files created!")
        return True
        
    def create_vscode_settings(self) -> bool:
        """Create VS Code workspace settings."""
        self.print_step("Creating VS Code settings...")
        
        vscode_dir = self.project_root / ".vscode"
        vscode_dir.mkdir(exist_ok=True)
        
        # Settings
        settings = {
            "python.defaultInterpreterPath": "./server/venv/bin/python",
            "python.terminal.activateEnvironment": True,
            "typescript.preferences.includePackageJsonAutoImports": "on",
            "aiCodingAssistant.modelProvider": "ollama",
            "aiCodingAssistant.embeddingModel": "all-MiniLM-L6-v2",
            "aiCodingAssistant.maxChunkSize": 500,
            "aiCodingAssistant.retrievalCount": 10,
            "aiCodingAssistant.ignorePatterns": [
                "node_modules/**",
                ".git/**",
                "*.min.js",
                "dist/**",
                "venv/**",
                "__pycache__/**"
            ]
        }
        
        settings_file = vscode_dir / "settings.json"
        settings_file.write_text(json.dumps(settings, indent=2))
        
        # Launch configuration
        launch_config = {
            "version": "0.2.0",
            "configurations": [
                {
                    "name": "Launch Backend",
                    "type": "python",
                    "request": "launch",
                    "program": "${workspaceFolder}/server/app/main.py",
                    "console": "integratedTerminal",
                    "cwd": "${workspaceFolder}/server",
                    "env": {
                        "PYTHONPATH": "${workspaceFolder}/server"
                    }
                },
                {
                    "name": "Launch Extension",
                    "type": "extensionHost",
                    "request": "launch",
                    "args": ["--extensionDevelopmentPath=${workspaceFolder}/extension"]
                }
            ]
        }
        
        launch_file = vscode_dir / "launch.json"
        launch_file.write_text(json.dumps(launch_config, indent=2))
        
        self.print_success("VS Code settings created!")
        return True
        
    def print_summary(self):
        """Print setup summary."""
        self.print_header("SETUP COMPLETE")
        
        if not self.errors:
            self.print_success("🎉 Setup completed successfully!")
        else:
            self.print_error(f"Setup completed with {len(self.errors)} errors:")
            for error in self.errors:
                print(f"  • {error}")
                
        if self.warnings:
            self.print_warning(f"⚠️  {len(self.warnings)} warnings:")
            for warning in self.warnings:
                print(f"  • {warning}")
                
        print(f"\n{Colors.OKBLUE}Next steps:{Colors.ENDC}")
        print("1. Start services: docker-compose up -d")
        print("2. Open VS Code in this directory")
        print("3. Install the extension from extension/ folder")
        print("4. Run: AI Coding Assistant: Index Workspace")
        print("5. Start coding with AI assistance!")
        
        print(f"\n{Colors.OKCYAN}Useful commands:{Colors.ENDC}")
        print("• docker-compose up -d          # Start all services")
        print("• docker-compose logs -f        # View logs")
        print("• docker-compose down           # Stop services")
        print("• ollama pull codellama:7b-code # Download AI model")
        
    def run(self):
        """Run the complete setup process."""
        self.print_header("AI CODING ASSISTANT SETUP")
        
        steps = [
            ("Checking prerequisites", self.check_prerequisites),
            ("Setting up Python environment", self.setup_python_environment),
            ("Setting up Node.js environment", self.setup_node_environment),
            ("Setting up Docker services", self.setup_docker_services),
            ("Setting up Ollama", self.setup_ollama),
            ("Creating environment files", self.create_env_files),
            ("Creating VS Code settings", self.create_vscode_settings),
        ]
        
        for step_name, step_func in steps:
            try:
                if not step_func():
                    self.print_error(f"Failed: {step_name}")
            except Exception as e:
                self.print_error(f"Error in {step_name}: {str(e)}")
                
        self.print_summary()

    def interactive_api_key_setup(self):
        """Interactive setup for API keys."""
        self.print_header("API KEYS CONFIGURATION")

        providers = {
            "openai": {
                "name": "OpenAI (GPT-4o, GPT-4 Turbo)",
                "url": "https://platform.openai.com/api-keys",
                "free": "$5 free credit for new accounts",
                "format": "sk-..."
            },
            "anthropic": {
                "name": "Anthropic (Claude 3.5 Sonnet)",
                "url": "https://console.anthropic.com/",
                "free": "Limited free tier available",
                "format": "sk-ant-..."
            },
            "google": {
                "name": "Google AI (Gemini 1.5 Pro)",
                "url": "https://makersuite.google.com/app/apikey",
                "free": "Generous free tier",
                "format": "alphanumeric string"
            },
            "groq": {
                "name": "Groq (Ultra-fast inference)",
                "url": "https://console.groq.com/keys",
                "free": "14,400 requests per day",
                "format": "gsk_..."
            }
        }

        print(f"{Colors.OKCYAN}Configure API keys for online AI providers:{Colors.ENDC}\n")

        env_updates = {}

        for provider_id, provider_info in providers.items():
            print(f"{Colors.OKBLUE}🔑 {provider_info['name']}{Colors.ENDC}")
            print(f"   Free Tier: {provider_info['free']}")
            print(f"   Get API Key: {provider_info['url']}")
            print(f"   Format: {provider_info['format']}")

            while True:
                api_key = input(f"\n   Enter API key (or press Enter to skip): ").strip()

                if not api_key:
                    print(f"   {Colors.WARNING}Skipped {provider_info['name']}{Colors.ENDC}")
                    break

                # Basic validation
                if provider_id == "openai" and not api_key.startswith("sk-"):
                    print(f"   {Colors.FAIL}Invalid format. OpenAI keys start with 'sk-'{Colors.ENDC}")
                    continue
                elif provider_id == "anthropic" and not api_key.startswith("sk-ant-"):
                    print(f"   {Colors.FAIL}Invalid format. Anthropic keys start with 'sk-ant-'{Colors.ENDC}")
                    continue
                elif provider_id == "groq" and not api_key.startswith("gsk_"):
                    print(f"   {Colors.FAIL}Invalid format. Groq keys start with 'gsk_'{Colors.ENDC}")
                    continue

                # Store the key
                env_key = f"{provider_id.upper()}_API_KEY"
                env_updates[env_key] = api_key
                print(f"   {Colors.OKGREEN}✅ {provider_info['name']} API key saved{Colors.ENDC}")
                break

            print()

        # Update .env file
        if env_updates:
            self.update_env_file(env_updates)
            print(f"{Colors.OKGREEN}✅ API keys saved to .env file{Colors.ENDC}")
            print(f"{Colors.OKCYAN}💡 You can also configure these later in VS Code settings{Colors.ENDC}")
        else:
            print(f"{Colors.WARNING}No API keys configured. You can add them later.{Colors.ENDC}")

    def update_env_file(self, updates: Dict[str, str]):
        """Update .env file with new values."""
        env_file = self.project_root / "server" / ".env"

        # Read existing content
        existing_content = ""
        if env_file.exists():
            with open(env_file, 'r') as f:
                existing_content = f.read()

        # Update or add new values
        lines = existing_content.split('\n') if existing_content else []
        updated_keys = set()

        for i, line in enumerate(lines):
            if '=' in line and not line.strip().startswith('#'):
                key = line.split('=')[0].strip()
                if key in updates:
                    lines[i] = f"{key}={updates[key]}"
                    updated_keys.add(key)

        # Add new keys that weren't found
        for key, value in updates.items():
            if key not in updated_keys:
                lines.append(f"{key}={value}")

        # Write back to file
        with open(env_file, 'w') as f:
            f.write('\n'.join(lines))

def main():
    """Main entry point with enhanced argument parsing."""
    parser = argparse.ArgumentParser(
        description="AI Coding Assistant Setup - Enhanced with Dual-Mode AI Support",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Setup Modes:
  local     - Local AI only (Ollama models, complete privacy)
  online    - Online AI only (cloud APIs, requires API keys)
  hybrid    - Both local and online (recommended, best of both worlds)

Examples:
  python setup.py                    # Default hybrid setup
  python setup.py --mode local       # Privacy-first local setup
  python setup.py --mode online      # Performance-first cloud setup
  python setup.py --skip-ollama      # Skip Ollama installation
  python setup.py --skip-models      # Skip model downloads
  python setup.py --quick            # Quick setup (minimal components)
        """
    )

    parser.add_argument(
        "--mode",
        choices=["local", "online", "hybrid"],
        default="hybrid",
        help="Setup mode: local (privacy), online (performance), or hybrid (balanced)"
    )

    parser.add_argument(
        "--skip-ollama",
        action="store_true",
        help="Skip Ollama installation (for online-only setups)"
    )

    parser.add_argument(
        "--skip-models",
        action="store_true",
        help="Skip downloading AI models (faster setup)"
    )

    parser.add_argument(
        "--skip-docker",
        action="store_true",
        help="Skip Docker setup (if already installed)"
    )

    parser.add_argument(
        "--skip-nodejs",
        action="store_true",
        help="Skip Node.js setup (if already installed)"
    )

    parser.add_argument(
        "--quick",
        action="store_true",
        help="Quick setup with minimal components"
    )

    parser.add_argument(
        "--api-keys",
        action="store_true",
        help="Interactive API key configuration"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose output for debugging"
    )

    args = parser.parse_args()

    # Print welcome message
    print(f"""
{Colors.HEADER}{Colors.BOLD}
🤖 AI Coding Assistant Setup - Enhanced Edition
{Colors.ENDC}
{Colors.OKCYAN}Dual-Mode AI Processing: Local Privacy + Cloud Performance{Colors.ENDC}

Setup Mode: {Colors.OKGREEN}{args.mode.upper()}{Colors.ENDC}
""")

    # Create setup manager with configuration
    setup = SetupManager(setup_mode=args.mode)

    # Apply command line options
    if args.skip_ollama or args.mode == "online":
        setup.config["install_ollama"] = False
        setup.config["install_models"] = False

    if args.skip_models:
        setup.config["install_models"] = False

    if args.skip_docker:
        setup.config["install_docker"] = False

    if args.skip_nodejs:
        setup.config["install_nodejs"] = False

    if args.quick:
        setup.config["install_models"] = False
        setup.config["build_extension"] = False

    # Set verbose mode
    if args.verbose:
        setup.verbose = True

    # Run setup
    try:
        setup.run()

        # Interactive API key setup if requested
        if args.api_keys and args.mode in ["online", "hybrid"]:
            setup.interactive_api_key_setup()

    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Setup interrupted by user{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.FAIL}Setup failed with error: {e}{Colors.ENDC}")
        sys.exit(1)


if __name__ == "__main__":
    main()
