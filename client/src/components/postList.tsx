import PostListItem from "./postListItem";
import axios from "axios";

const fetchPosts = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null;
  }
};

export default function PostList() {
  return (
    <div className="flex flex-col gap-12 mb-8">
      <PostListItem />
      <PostListItem />
      <PostListItem />
      <PostListItem />
      <PostListItem />
      <PostListItem />
      <PostListItem />
      <PostListItem />
    </div>
  );
}
