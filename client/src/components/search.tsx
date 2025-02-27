import { IconSearch } from "@tabler/icons-react";

export default function Search() {
  return (
    <div className="bg-gray-100  p-2 rounded-full flex items-center gap-2">
      <IconSearch />
      <input
        type="text"
        placeholder="Search a post..."
        className="bg-transparent"
      />
    </div>
  );
}
