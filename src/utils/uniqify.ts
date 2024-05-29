import slugify from '@sindresorhus/slugify';

function getLastSegment(urlPath: string) {
  return urlPath.replace(/\/$/, '').split('/').pop();
}

function getUniqueSegments(urls: string[]) {
  const paths = urls.map((url) =>
    new URL(url).pathname.split('/').filter((segment) => segment)
  );

  if (urls.length === 1) {
    return [getLastSegment(paths[0].join('/'))];
  }

  const uniqueSegments = paths.map((pathSegments, i, allPaths) => {
    let uniqueSegment = pathSegments.join('/');
    for (const otherPath of allPaths) {
      if (
        otherPath !== pathSegments &&
        otherPath.includes(pathSegments.join('/'))
      ) {
        uniqueSegment = pathSegments
          .filter((segment) => !otherPath.includes(segment))
          .join('/');
        break;
      }
    }
    return getLastSegment(uniqueSegment);
  });

  return uniqueSegments;
}

export const getDefaultOutNames = (urls: string[]) => {
  const uniqueSegments = getUniqueSegments(urls);
  return uniqueSegments.map((segment, index) =>
    slugify(segment || `img-${index}`)
  );
};
