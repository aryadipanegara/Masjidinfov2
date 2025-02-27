import { IconBookmark, IconTrashX } from "@tabler/icons-react";

export default function PostMenuActions() {
  return (
    <div className="">
      <h1 className="mt-8 mb-4 text-sm font-medium">Actions</h1>
      <div className="flex items-center gap-2 py-2 text-sm cursor-pointer">
        <IconBookmark />
        <span>Save this Post</span>
      </div>
      <div className="flex items-center gap-2 py-2 text-sm cursor-pointer">
        <IconTrashX />
        <span>Delete this Post</span>
      </div>
    </div>
  );
}
