# Note

## Referenze

ref. https://vuejs.org/v2/cookbook/packaging-sfc-for-npm.html

## Processo

Compila `yarn build`
Aggiungi tutti i file `git add -A`
Fail il commit delle modifiche `git commit -m "Fix"`
Scrivi le info `npm version patch -m "Fix"`
Carica le modifiche `git push --follow-tags`
Pubblicale `npm publish`

### Comandi

```
yarn build
git add -A
git commit -m "Fix"
npm version patch -m "Fix"
git push --follow-tags
npm publish
```

## Test locale

vue serve --open src/vue-cap.vue