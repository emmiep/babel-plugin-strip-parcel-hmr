if (module.hot) {
  shouldBeRemoved;
} else if (module.notHot) {
  shouldBeKept;
} else {
  shouldAlsoBeKept;
}

