NAME = jxt
STANDALONE = JXT
MAIN = index.js

LIB = $(shell find lib -name '*.js')
BIN = ./node_modules/.bin


# -- Tasks ------------------------------------------------------------

.PHONY: all lint test audit clean

all: test build audit

build: build/$(NAME).zip

clean:
	rm -rf build

test: lint
	node test/index.js | $(BIN)/tap-spec

lint:
	$(BIN)/jshint .

audit:
	$(BIN)/nsp package


# -- Build artifacts --------------------------------------------------

build/$(NAME).zip: build/$(NAME).bundle.js build/$(NAME).bundle.min.js
	zip -j $@ $^

build/$(NAME).bundle.js: $(MAIN) $(LIB)
	mkdir -p build
	$(BIN)/browserify --standalone $(STANDALONE) $(MAIN) > $@

build/$(NAME).bundle.min.js: build/$(NAME).bundle.js
	$(BIN)/uglifyjs --screw-ie8 build/$(NAME).bundle.js > $@
