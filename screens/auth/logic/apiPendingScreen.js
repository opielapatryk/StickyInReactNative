import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import {userLink,stickerLink} from '../../../components/Constants'
import {addPendingNote,removePendingNote,changePendingInfo} from '../../../store/notes/boardSlice';

export const loadPendingNotes = async (dispatch) => {
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      const currentUserId = await SecureStore.getItemAsync('userId');

      const result = await axios.get(userLink(currentUserId), {
        headers: {
          Authorization: userToken,
        }
      });

      const stickersRequest = result.data.pending.map(url =>
        axios.get(url)
          .then(response => response.data)
      );

      const stickersData = await Promise.all(stickersRequest);
      stickersData.forEach(sticker => dispatch(addPendingNote({ id: sticker.id, text: sticker.content, isInfo: false })));
      

      return result;
    } catch (error) {
      console.log(error.message);
    }
  };

export const removeNotesFromReduxStore = async (pendingNotes,dispatch) => {
    await pendingNotes.map((sticker) => dispatch(removePendingNote(sticker.id)));
  };

export async function sendNoteToBoard(stickerID,setFetched,pendingNotes,dispatch,){
    try {
        let userID = await SecureStore.getItemAsync('userId');

        const resp = await axios.get(userLink(userID))

        let stickersOnBoard = resp.data.stickersOnBoard;
        let pending = resp.data.pending;

        stickersOnBoard.push(stickerLink(stickerID))

        let newPendingArr = await pending.filter(sticker => sticker != stickerLink(stickerID))

        const patchStickersOnBoardResp = await axios.patch(userLink(userID),{
          'stickersOnBoard': stickersOnBoard
        })

        const patchPendingStickersResp = await axios.patch(userLink(userID),{
          'pending': newPendingArr
        })

        if(patchStickersOnBoardResp.status === 200 && patchPendingStickersResp.status === 200){
            setFetched(true)
            removeNotesFromReduxStore(pendingNotes,dispatch);
            loadPendingNotes(dispatch);
        }
    } catch (error) {
        console.log(error.message);
    }
}

export const onClickChangeInfo = (dispatch,pendingNotes) => {
  pendingNotes.map((note) => {
    if(note.isInfo === true)
    {
      dispatch(changePendingInfo(note.id))
    }
  })
}