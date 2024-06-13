import fs from 'fs';

export function removeOldFile(newImagePath: string, oldImagePath: string) {
  if (newImagePath && oldImagePath) {
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }
}
