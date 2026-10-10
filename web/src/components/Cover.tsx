import { cloth, shortTitle } from "./books";

/** A cloth-bound cover drawn from the title, since we don't store cover images. */
export function Cover({ title, author }: { title: string; author: string }) {
  return (
    <div className="cover" style={{ background: cloth(title) }} aria-hidden="true">
      <span className="cover-title">{shortTitle(title)}</span>
      <span className="cover-author">{author}</span>
    </div>
  );
}
