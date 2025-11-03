import { useContext } from "react";
import ConversationContext from "../../shared/context/conversation-context";
import { useSocketContext } from "../../shared/context/SocketContext";

const Conversation = ({ user, lastIndex }) => {
  const { currentConversation, setCurrentConversation } =
    useContext(ConversationContext);

  const { activeUsers } = useSocketContext();

  const isActive = activeUsers.includes(user.id);

  const isClicked = currentConversation?.id === user.id;

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer ${
          isClicked ? "bg-sky-500" : ""
        }`}
        onClick={() => setCurrentConversation(user)}
      >
        <div className={`avatar ${isActive ? "online" : ""}`}>
          <div className="w-16 rounded-full">
            <img src={`${user.profileImage}`} alt="user avatar" />
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex flex-col gap-3">
            <p className="font-bold">{user.fullName}</p>
          </div>
        </div>
      </div>

      {!lastIndex && <div className="divider my-0 py-0 h-1" />}
    </>
  );
};
export default Conversation;
