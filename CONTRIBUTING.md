# Contributing to AI Coding Assistant

Thank you for your interest in contributing to the AI Coding Assistant! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use the issue templates** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, VS Code version, etc.)
   - Screenshots or logs if applicable

### Suggesting Features

1. **Check the roadmap** to see if the feature is already planned
2. **Open a feature request** with detailed description
3. **Explain the use case** and why it would be valuable
4. **Consider implementation complexity** and alternatives

### Code Contributions

1. **Fork the repository** and create a feature branch
2. **Follow the development setup** instructions below
3. **Write tests** for new functionality
4. **Follow code style guidelines**
5. **Update documentation** as needed
6. **Submit a pull request** with clear description

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+ and pip
- **Docker** (optional but recommended)
- **VS Code** for extension development
- **Git** for version control

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/ai-coding-assistant.git
   cd ai-coding-assistant
   ```

2. **Set up the backend**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

3. **Set up the extension**
   ```bash
   cd ../extension
   npm install
   npm run compile
   ```

4. **Start development services**
   ```bash
   # Terminal 1: Start backend
   cd server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 2: Start extension development
   cd extension
   npm run watch  # Watches for changes and recompiles
   ```

5. **Test the extension**
   - Open VS Code
   - Press `F5` to launch Extension Development Host
   - Test your changes in the new VS Code window

### Docker Development

```bash
# Start all services with Docker
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📝 Code Style Guidelines

### TypeScript (Extension)

- **Use TypeScript strict mode**
- **Follow ESLint configuration**
- **Use meaningful variable names**
- **Add JSDoc comments for public APIs**
- **Prefer async/await over Promises**

```typescript
// Good
async function explainCode(code: string, language: string): Promise<string> {
    try {
        const response = await apiClient.explainCode({ code, language });
        return response.explanation;
    } catch (error) {
        logger.error('Failed to explain code:', error);
        throw error;
    }
}

// Bad
function explainCode(code, language) {
    return apiClient.explainCode({ code, language }).then(response => {
        return response.explanation;
    });
}
```

### Python (Backend)

- **Follow PEP 8** style guidelines
- **Use Black** for code formatting
- **Use type hints** for all functions
- **Add docstrings** for classes and functions
- **Use async/await** for I/O operations

```python
# Good
async def explain_code(code: str, language: str) -> ExplanationResponse:
    """
    Explain the provided code using AI.
    
    Args:
        code: The code to explain
        language: Programming language of the code
        
    Returns:
        ExplanationResponse containing the explanation
        
    Raises:
        AIProviderError: If AI provider fails
    """
    try:
        response = await ai_provider.explain(code, language)
        return ExplanationResponse(explanation=response.text)
    except Exception as e:
        logger.error(f"Failed to explain code: {e}")
        raise AIProviderError(str(e))

# Bad
def explain_code(code, language):
    response = ai_provider.explain(code, language)
    return response.text
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Backend tests
cd server
python -m pytest tests/ -v --cov=app

# Extension tests
cd extension
npm test

# Integration tests
cd tests
python comprehensive_test_suite.py

# Cross-platform tests
python cross_platform_tests.py
```

### Writing Tests

#### Backend Tests (Python)

```python
# tests/test_ai_service.py
import pytest
from app.services.ai_service import AIService

@pytest.mark.asyncio
async def test_explain_code():
    """Test code explanation functionality."""
    ai_service = AIService()
    
    code = "def hello(): print('Hello, World!')"
    language = "python"
    
    result = await ai_service.explain_code(code, language)
    
    assert result.explanation is not None
    assert len(result.explanation) > 0
    assert "function" in result.explanation.lower()
```

#### Extension Tests (TypeScript)

```typescript
// src/test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import { ApiClient } from '../../services/ApiClient';

suite('Extension Test Suite', () => {
    test('ApiClient initialization', () => {
        const apiClient = new ApiClient('http://localhost:8000');
        assert.ok(apiClient);
    });

    test('Code explanation command', async () => {
        const result = await vscode.commands.executeCommand(
            'aiCodingAssistant.explainSelection'
        );
        assert.ok(result);
    });
});
```

## 📚 Documentation

### Code Documentation

- **Add JSDoc/docstrings** for all public APIs
- **Include examples** in documentation
- **Document complex algorithms**
- **Keep comments up-to-date**

### User Documentation

- **Update README.md** for user-facing changes
- **Add to docs/** folder for detailed guides
- **Include screenshots** for UI changes
- **Update troubleshooting guides**

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   npm test && python -m pytest
   ```

2. **Run linting and formatting**
   ```bash
   npm run lint:fix
   black server/app/
   ```

3. **Update documentation** if needed

4. **Test manually** in VS Code

### PR Guidelines

1. **Use descriptive titles** and descriptions
2. **Reference related issues** with "Fixes #123"
3. **Keep PRs focused** on single features/fixes
4. **Include screenshots** for UI changes
5. **Add tests** for new functionality

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] New tests added

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update version numbers**
   - `extension/package.json`
   - `server/app/__init__.py`

2. **Update CHANGELOG.md**

3. **Create release PR**

4. **Tag release** after merge
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

5. **GitHub Actions** will handle the rest

## 🎯 Areas for Contribution

### High Priority

- **AI Provider Integrations**: Add support for new AI services
- **Language Support**: Extend to more programming languages
- **Performance Optimization**: Improve response times and memory usage
- **Testing**: Increase test coverage and add integration tests

### Medium Priority

- **UI/UX Improvements**: Enhance the VS Code extension interface
- **Documentation**: Improve guides and API documentation
- **Error Handling**: Better error messages and recovery
- **Accessibility**: Make the extension more accessible

### Low Priority

- **Themes**: Custom themes for the chat interface
- **Plugins**: Extension plugin system
- **Analytics**: Usage analytics and insights
- **Mobile**: Mobile development environment support

## 🤔 Questions?

- **GitHub Discussions**: For general questions and ideas
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: Join our community chat (link in README)
- **Email**: maintainers@ai-coding-assistant.dev

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AI Coding Assistant! 🚀
