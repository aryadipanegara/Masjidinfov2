import ImageKit from "./image";
export default function Comment() {
  return (
    <div className="">
      <div className="">
        <ImageKit
          alt="Comment"
          src="/default.jpg"
          w={40}
          h={40}
          className="rounded-full object-cover"
        />
        <span className="font-medium">Jhon Doe</span>
        <span className="text-sm text-gray-500">2 days ago</span>
      </div>
      <div className="mt-4 text-justify">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor
          laboriosam exercitationem voluptate cumque corrupti doloremque
          sapiente accusantium consectetur veritatis quaerat, officiis non nobis
          cum aspernatur, eligendi laudantium distinctio repellendus! Iure
          laboriosam maiores officiis ab aliquam accusantium placeat nihil autem
          culpa!
        </p>
      </div>
    </div>
  );
}
