# childNodesWatcher

Provides helper methods for `test` and `test`.
[Minimum compatibility](https://caniuse.com/#feat=mutation-events) provided via [Mutation Events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events).
[Optimal compatibility](https://caniuse.com/#feat=mutationobserver) via [Mutation Observer](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

## Plain quick usage
Run provided `example/watch.html`

---

## Develop locally

### Setup dev dependencies
`npm install`

### GiT commits message format
please use [Convetional Commits](https://www.conventionalcommits.org) to enable proper functioning of `npm run release` (below)

### Testing
`npm test` (via local Chrome)

### Release/versioning
`npm run release` (auto-generates version, git tag and [CHANGELOG.md](./CHANGELOG.md))