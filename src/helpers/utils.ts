import fs from 'fs/promises';

export async function listOnlyFiles(directory: string) {
  const items = await fs.readdir(directory, {
    withFileTypes: true
  });
  return items
    .filter((item) => item .isFile())
    .map((item) => item.name);
}
