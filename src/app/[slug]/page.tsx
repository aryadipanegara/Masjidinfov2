type Props = {
  params: { slug: string };
};

export default function SinglePostPage({ params }: Props) {
  const { slug } = params;

  return (
    <main>
      <h1>Post: {slug}</h1>
      <p>Content for the post with slu"{slug}" will go here...</p>
    </main>
  );
}
