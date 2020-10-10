import { dbService, storageService } from "fbase";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import EpochConverter from "utils/EpochConverter";

const Nweet = ({ nweetObj, isOwner }) => {
  const [creatorObj, setCreatorObj] = useState("");
  useEffect(() => {
    dbService
      .collection("users")
      .where("uid", "==", `${nweetObj.creatorId}`)
      .onSnapshot((snapshot) => {
        const creatorObj = snapshot.docs.map((doc) => ({
          ...doc.data(),
        }))[0];
        setCreatorObj(creatorObj);
      });
  }, []);
  const [editing, setEditing] = useState(false);
  const [newNweet, setNewNweet] = useState(nweetObj.text);
  const onDeleteClick = async () => {
    const ok = window.confirm("Are you sure you want to delete this nweet?");
    if (ok) {
      await dbService.doc(`nweets/${nweetObj.id}`).delete();
      await storageService.refFromURL(nweetObj.attachmentUrl).delete();
    }
  };
  const toggleEditing = () => setEditing((prev) => !prev);
  const onSubmit = async (event) => {
    event.preventDefault();
    await dbService.doc(`nweets/${nweetObj.id}`).update({
      text: newNweet,
    });
    setEditing(false);
  };
  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewNweet(value);
  };

  return (
    <div className="nweet">
      {editing ? (
        <>
          {isOwner && (
            <>
              <form onSubmit={onSubmit} className="container nweetEdit">
                <input
                  type="text"
                  placeholder="Edit your nweet"
                  value={newNweet}
                  required
                  authFocus
                  onChange={onChange}
                  className="formInput"
                />
                <input type="submit" value="Update Nweet" className="formBtn" />
              </form>
              <span onClick={toggleEditing} className="formBtn cancleBtn">
                Cancel
              </span>
            </>
          )}
        </>
      ) : (
        <>
          <img
            src={creatorObj.photoURL}
            alt=""
            className="nweet__profile__img"
          />
          <h6 className="nweet__creator">{creatorObj.displayName}</h6>
          <h6 className="nweet__createdAt">
            {EpochConverter(nweetObj.createdAt)}
          </h6>
          <h2 className="nweet__text">{nweetObj.text}</h2>
          <h6>{nweetObj.creatorId.displayName}</h6>
          {nweetObj.attachmentUrl && (
            <a href={nweetObj.attachmentUrl}>
              <img src={nweetObj.attachmentUrl} className="nweet__img" />
            </a>
          )}
          {isOwner && (
            <div className="nweet__actions">
              <span onClick={onDeleteClick}>
                <FontAwesomeIcon icon={faTrash} />
              </span>
              <span onClick={toggleEditing}>
                <FontAwesomeIcon icon={faPencilAlt} />
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Nweet;
