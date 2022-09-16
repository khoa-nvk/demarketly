export default function (version, geVersion, ltVersion) {
  const getComponents = v => v.split(/[-+]/)[0].split('.').map(i => +i);

  const versionComponents = getComponents(version);
  const geComponents = getComponents(geVersion);
  const ltComponents = getComponents(ltVersion);
  const base = Math.max(...versionComponents, ...geComponents, ...ltComponents) + 1;

  const componentsToNumber = components => components.reverse().reduce((acc, n, idx) => acc + n * Math.pow(base, idx), 0);

  const vNumber = componentsToNumber(versionComponents);
  const geNumber = componentsToNumber(geComponents);
  const ltNumber = componentsToNumber(ltComponents);
  return vNumber >= geNumber && vNumber < ltNumber;
}
//# sourceMappingURL=semver-satisfies.mjs.map