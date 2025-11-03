import { useContext, useEffect } from "react";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import ConversationContext from "../../shared/context/conversation-context";
import { AuthContext } from "../../shared/context/auth-context";
import { useSocketContext } from "../../shared/context/SocketContext";
import { MdArrowBackIos } from "react-icons/md";

const MessageContainer = () => {
  const { currentConversation, setCurrentConversation } =
    useContext(ConversationContext);
  const auth = useContext(AuthContext);

  const { activeUsers } = useSocketContext();

  const isActive = activeUsers.includes(currentConversation?.id);

  useEffect(() => {
    return () => setCurrentConversation(null);
  }, [setCurrentConversation]);

  return (
    <div className="md:w-2/3 mx-6 border border-gray-200 dark:border-gray-700 flex flex-col sm:h-[450px] md:h-[550px] widescreen:section-min-height tallscreen:section-min-height">
      {!currentConversation ? (
        <NoChatSelected user={auth.loggedInUser} />
      ) : (
        <>
          <div className="flex items-center gap-2 bg-slate-500 px-4 py-2 mb-2">
            <MdArrowBackIos
              onClick={() => setCurrentConversation(null)}
              className="text-xl md:text-2xl text-white cursor-pointer"
            />
            <div className={`avatar`}>
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS chat bubble component"
                  src={`${currentConversation.profileImage}`}
                />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-white font-bold">
                {currentConversation.fullName}
              </span>
              <span className="text-gray-100 font-normal">
                {isActive ? "online" : "offline"}
              </span>
            </div>
          </div>
          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};
export default MessageContainer;

const NoChatSelected = ({ user }) => {
  return (
    <div className="flex items-center justify-center widescreen:section-min-height tallscreen:section-min-height">
      <div className="px-4 text-center sm:text-lg md:text-xl font-semibold flex flex-col items-center gap-2">
        <p>
          Welcome back!{" "}
          <span className="text-emerald-400">{user?.fullName}</span> 👋
        </p>
        <p>Select a chat to start messaging</p>
        <TiMessages className="text-3xl md:text-6xl text-center" />
      </div>
    </div>
  );
};
