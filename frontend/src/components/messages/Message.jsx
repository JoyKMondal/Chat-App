/* eslint-disable no-undef */
import { useContext } from "react";
import ConversationContext from "../../shared/context/conversation-context";
// import { format, parse } from "date-fns";
import { AuthContext } from "../../shared/context/auth-context";
import { extractTime } from "../../utils/extractTime";

// const formatDate = (dateString) => {
//   const parsedDate = parse(dateString, "MM/dd/yyyy", new Date());
//   return format(parsedDate, "EEEE, MMM dd, yyyy");
// };

const Message = ({ message }) => {
  const { currentConversation } = useContext(ConversationContext);
  const auth = useContext(AuthContext);

  const myMessage = message.senderId === auth.userId;
  const formattedTime = extractTime(message.createdAt);
  const chatClassName = myMessage ? "chat-end" : "chat-start";
  const deliveryStatus = myMessage ? "sent" : "delivered";
  
  const fullName = myMessage
    ? auth.loggedInUser?.fullName
    : currentConversation?.fullName;
  const profileImage = myMessage
    ? auth.loggedInUser?.profileImage
    : currentConversation?.profileImage;
  const bubbleBgColor = myMessage ? "bg-blue-500" : "";

  return (
    <div className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src={`${profileImage}`}
          />
        </div>
      </div>
      <div className="chat-header">
        {fullName}
        <time className="text-xs opacity-50">{formattedTime}</time>
      </div>
      <div className={`chat-bubble text-white ${bubbleBgColor}`}>
        {message.message}
      </div>
      <div className="chat-footer opacity-50">{deliveryStatus}</div>
      {/* <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
        {formatDate(new Date(message.createdAt).toLocaleDateString())}
      </div> */}
    </div>
  );
};
export default Message;
