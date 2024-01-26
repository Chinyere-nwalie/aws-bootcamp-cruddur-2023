import "./ActivityContent.css";
import React from "react";

import { Link } from "react-router-dom";
import { format_datetime, time_ago, time_future } from "../lib/DateTimeFormats";
import { ReactComponent as BombIcon } from "./svg/bomb.svg";
import ProfileAvatar from "./ProfileAvatar";
import { get } from "lib/Requests";

export default function ActivityContent(props) {
  const [setuserCognitoId, setsetuserCognitoId] = React.useState("");
  const dataFetchedRef = React.useRef(false);

  const loadData = async () => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/users/@${props.activity.handle}/short`;
    get(url, {
      auth: true,
      success: function (data) {
        console.log("data", data)
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

  let expires_at;
  if (props.activity.expires_at) {
    expires_at = (
      <div
        className="expires_at"
        title={format_datetime(props.activity.expires_at)}
      >
        <BombIcon className="icon" />
        <span className="ago">{time_future(props.activity.expires_at)}</span>
      </div>
    );
  }

  return (
    <div className="activity_content_wrap">
      {/* <Link className='activity_avatar' to={`/@`+props.activity.handle}>   </Link> */}
      <ProfileAvatar className="activity_avatar" id={setuserCognitoId} />
      <div className='activity_content'>
        <div className='activity_meta'>
          <div className='activity_identity' >
            <Link className='display_name' to={`/@`+props.activity.handle}>{props.activity.display_name}</Link>
            <Link className="handle" to={`/@`+props.activity.handle}>@{props.activity.handle}</Link>
          </div>{/* activity_identity */}
          <div className='activity_times'>
            <div className="created_at" title={format_datetime(props.activity.created_at)}>
              <span className='ago'>{time_ago(props.activity.created_at)}</span>
            </div>
            {expires_at}
          </div>{/* activity_times */}
        </div>{/* activity_meta */}
        <div className="message">{props.activity.message}</div>
      </div>{/* activity_content */}
    </div>
  );
}
