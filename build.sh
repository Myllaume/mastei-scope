yarn eleventy
yarn pagefind
node_modules/.bin/terser _site/assets/main.js --compress --mangle --output _site/assets/main.js
node_modules/.bin/terser _site/assets/search.js --compress --mangle --output _site/assets/search.js
node_modules/.bin/cleancss -o _site/assets/style.css _site/assets/style.css