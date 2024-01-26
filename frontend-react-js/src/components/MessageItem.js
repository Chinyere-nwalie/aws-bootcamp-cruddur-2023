import "./MessageItem.css";
import React from "react";
import { Link } from "react-router-dom";
import { format_datetime, message_time_ago } from "../lib/DateTimeFormats";
import ProfileAvatar from "./ProfileAvatar";
import { get } from "lib/Requests";

export default function MessageItem(props) {
  const [setuserCognitoId, setsetuserCognitoId] = React.useState("");
  const dataFetchedRef = React.useRef(false);

  const loadData = async () => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/users/@${props.message.handle}/short`;
    get(url, {
      auth: true,
      success: function (data) {
        setsetuserCognitoId(data.cognito_user_id);
      },
    });
  };
  React.useEffect(() => {
    //prevents double call
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    loadData();
  }, []);

  return (
    <div className='message_item'>
      <ProfileAvatar className="message_avatar" id={setuserCognitoId} />
      <div className='message_content'>
        <div classsName='message_meta'>
          <div className='message_identity'>
            <div className='display_name'>{props.message.display_name}</div>
            <div className="handle">@{props.message.handle}</div>
          </div>{/* activity_identity */}
        </div>{/* message_meta */}
        <div className="message">{props.message.message}</div>
        <div className="created_at" title={format_datetime(props.message.created_at)}>
          <span className='ago'>{message_time_ago(props.message.created_at)}</span>  
        </div>{/* created_at */}
      </div>{/* message_content */}
    </div>
  );
}