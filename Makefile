.PHONY: dev clean help

## Remove generated static files
clean:
	rm -fr web/public
	rm -fr web/resources

## Run Hugo server (clean it first)
dev: clean
	hugo serve -s web/ -p 1313 --environment development

## Show available commands
help:
	@echo "Available make commands:"
	@echo "  make clean   - Remove generated files (web/public, web/resources)"
	@echo "  make dev     - Clean and start Hugo server on http://localhost:1313"
	@echo "  make help    - Show this help message"