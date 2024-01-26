import "./MessageGroupItem.css";
import React from "react";

import { Link } from "react-router-dom";
import { format_datetime, message_time_ago } from "../lib/DateTimeFormats";
import { useParams } from "react-router-dom";
import { get } from "lib/Requests";
import ProfileAvatar from "./ProfileAvatar";

export default function MessageGroupItem(props) {
  const params = useParams();

  const [setuserCognitoId, setsetuserCognitoId] = React.useState("");
  const dataFetchedRef = React.useRef(false);

  const loadData = async () => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/users/@${props.message_group.handle}/short`;
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

  const classes = () => {
    let classes = ["message_group_item"];
    if (params.message_group_uuid === props.message_group.uuid){
      classes.push("active");
    }
    return classes.join(" ");
  }

  return (
    <Link className={classes()} to={`/messages/` + props.message_group.uuid}>
      <ProfileAvatar className="message_group_avatar" id={setuserCognitoId} />
      <div className='message_content'>
        <div classsName='message_group_meta'>
          <div className='message_group_identity'>
            <div className='display_name'>{props.message_group.display_name}</div>
            <div className="handle">@{props.message_group.handle}</div>
          </div>{/* activity_identity */}
        </div>{/* message_meta */}
        <div className="message">{props.message_group.message}</div>
        <div className="created_at" title={format_datetime(props.message_group.created_at)}>
          <span className='ago'>{message_time_ago(props.message_group.created_at)}</span> 
        </div>{/* created_at */}
      </div>{/* message_content */}
    </Link>
  );
}