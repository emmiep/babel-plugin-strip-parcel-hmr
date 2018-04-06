if (module.notHot) {
  shouldBeKept;
} else if (module.hot) {
  shouldBeRemoved;
} else {
  shouldAlsoBeKept;
}

