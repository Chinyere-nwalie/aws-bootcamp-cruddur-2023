import './ProfileAvatar.css';

export default function ProfileAvatar(props) {
  // console.log("UserID in ProfileAvatar.js -> ",props.id);
  const backgroundImage = `url("https://assets.nwaliechinyere.xyz/avatars/${props.id}.jpg")`;
  const styles = {
    backgroundImage: backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div 
      className="profile-avatar"
      style={styles}
    ></div>
  );
}