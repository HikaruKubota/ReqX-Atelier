# ReqX-Atelier Makefile
# Common development commands

.PHONY: help install dev test lint format check all clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Run development server"
	@echo "  make test       - Run all tests"
	@echo "  make lint       - Run ESLint"
	@echo "  make format     - Run Prettier"
	@echo "  make check      - Run format, lint, and tests"
	@echo "  make all        - Run format, lint, typecheck, and tests"
	@echo "  make clean      - Clean build artifacts and node_modules"

# Install dependencies
install:
	npm install

# Development
dev:
	npm run dev

# Run tests
test:
	npm test

# Run linter
lint:
	npm run lint

# Run formatter
format:
	npm run format

# Run typecheck
typecheck:
	npm run typecheck

# Quick check (format, lint, test)
check: format lint test

# Full check (format, lint, typecheck, test)
all: format lint typecheck test

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf .turbo/
	rm -rf coverage/
	rm -rf storybook-static/

# Clean everything including dependencies
clean-all: clean
	rm -rf node_modules/

# Build commands
build-renderer:
	npm run build:renderer

build-electron:
	npm run build:electron

build: build-renderer build-electron

# Storybook
storybook:
	npm run storybook

storybook-build:
	npm run build-storybook

# E2E tests
e2e:
	npm run e2e

# Development with all tools
dev-all:
	npm run dev:all

# Git operations
commit-check: check
	@echo "✅ All checks passed! Ready to commit."

# Watch mode for tests
test-watch:
	npm run test:watch