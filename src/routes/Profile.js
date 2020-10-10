import { authService, dbService, storageService } from "fbase";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Nweet from "components/Nweet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faTimes,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function Profile({ userObj, refreshUser }) {
  const [nweets, setNweets] = useState([]);
  useEffect(() => {
    dbService
      .collection("nweets")
      .where("creatorId", "==", userObj.uid)
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const nweetArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNweets(nweetArray);
      });
  }, []);
  const history = useHistory();

  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const [attachment, setAttachment] = useState(null);
  const onClearAttachment = () => setAttachment(null);
  const onLogOutClick = () => {
    authService.signOut();
    history.push("/");
  };
  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewDisplayName(value);
  };
  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    let photoURL = "";
    if (userObj.displayName !== newDisplayName) {
      await userObj.updateProfile({
        displayName: newDisplayName,
      });
      refreshUser();
    }
    if (attachment) {
      if (userObj.photoURL) {
        await storageService.refFromURL(userObj.photoURL).delete();
      }

      const photoURLRef = storageService
        .ref()
        .child(`${userObj.uid}/profile/${uuidv4()}`);
      const response = await photoURLRef.putString(attachment, "data_url");
      photoURL = await response.ref.getDownloadURL();

      await userObj.updateProfile({
        photoURL: photoURL,
      });
      refreshUser();
      onClearAttachment();
    }
  };
  return (
    <div className="container">
      <div className="profilePhoto">
        {!attachment && userObj.photoURL && (
          <a href={userObj.photoURL}>
            <img src={userObj.photoURL} />
          </a>
        )}
      </div>
      <form onSubmit={onSubmit} className="profileForm">
        <label htmlFor="attach-file" className="factoryInput__label">
          {userObj.photoURL ? (
            <>
              <span>Change Photo</span>
              <FontAwesomeIcon icon={faPencilAlt} />
            </>
          ) : (
            <>
              <span>Add Photo</span>
              <FontAwesomeIcon icon={faPlus} />
            </>
          )}
        </label>
        <input
          id="attach-file"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{
            opacity: 0,
          }}
        />
        {attachment && (
          <div className="profileForm__attachment">
            <img
              src={attachment}
              style={{
                backgroundImage: attachment,
              }}
            />
            <div className="factoryForm__clear" onClick={onClearAttachment}>
              <span>Cancle</span>
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
        )}
        <input
          onChange={onChange}
          type="text"
          autoFocus
          placeholder="Display name"
          value={newDisplayName}
          className="formInput"
        />
        <input
          type="submit"
          value="Update Profile"
          className="formBtn"
          style={{
            marginTop: 10,
          }}
        />
      </form>

      <span className="formBtn cancelBtn logOut" onClick={onLogOutClick}>
        Log Out
      </span>
      <div style={{ marginTop: 30 }}>
        {nweets.map((nweet) => (
          <Nweet
            key={nweet.id}
            nweetObj={nweet}
            isOwner={nweet.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
}
