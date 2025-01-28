import Comment from "./comment";

export default function Comments() {
  return (
    <div className="flex flex-col gap-8 lg:w-3/5">
      <h1 className="text-xl text-green-500 underline">Comments</h1>
      <div className="flex items-center justify-between gap-8 w-full">
        <textarea
          placeholder="Write a comment"
          className="w-full p-4 rounded-xl"
        />
        <button className="bg-blue-800 py-3 px-3 font-medium rounded-xl">
          Send
        </button>
      </div>
      <Comment />
      <Comment />
      <Comment />
      <Comment />
    </div>
  );
}
