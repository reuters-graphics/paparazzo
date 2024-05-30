export const getUniqueSlugs = (urls: string[]) => {
  // Parse URLs and extract paths
  const paths = urls.map((url) => {
    const { pathname } = new URL(url);
    return pathname.split('/').filter((segment) => segment);
  });

  // Find unique parts for each path
  const uniqueParts = paths.map((currentPath, index) => {
    const otherPaths = paths.slice(0, index).concat(paths.slice(index + 1));
    let uniquePart = '';

    for (let i = 0; i < currentPath.length; i++) {
      const segment = currentPath.slice(0, i + 1).join('/');
      if (otherPaths.every((path) => !path.join('/').startsWith(segment))) {
        uniquePart = currentPath.slice(0, i + 1).join('-');
        break;
      }
    }

    return uniquePart || currentPath.join('-') || 'home';
  });

  return uniqueParts;
};
