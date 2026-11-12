import type { PostEntry } from './lib/post-catalogue';
declare global {
  namespace App {
    interface Locals { post?: PostEntry }
  }
}
