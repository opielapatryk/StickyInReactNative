import { Text,TextInput,View,Button } from 'react-native'
import React,{useState} from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store';

export default FriendsBoard = ({ route,navigation }) => {
    const { friendId, friendName } = route.params;
    const [content,setContent] = useState('');
    const [message, setMessage] = useState('');

    const createNote = async () => {
        try {
            currentUserId = await SecureStore.getItemAsync('userId');
            const userURL = `http://localhost:8000/api/users/${currentUserId}/`
            let result;

            if(content != ''){
                result = await axios.post(`http://localhost:8000/api/stickers/`,{
                    'content':content,
                    'creator':userURL
                })
            }else{
                setMessage('Note cannot be empty..')
            }
            

            const stickerID = result.data.id

            const friendURL = `http://localhost:8000/api/users/${friendId}/`

            const resultStickers = await axios.get(friendURL)

            // if someone has turned on asking before sticking note 
            // push this to pending notes
            if(resultStickers.data.askBeforeStick){
                console.log(resultStickers.data.askBeforeStick);
            }
            ///////////////////////////////////////////////////////
    
            let list = resultStickers.data.stickersOnBoard
    
            list.push(`http://localhost:8000/api/stickers/${stickerID}/`);

            await axios.patch(`http://localhost:8000/api/users/${friendId}/`,{
                'stickersOnBoard': list
            })

            if(result.status === 201){
                setMessage('Note created successfully!')
                setContent('')
            }else{
                setMessage('Cannot create note, something went wrong..')
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    const removeFriend = async () => {
        try {
            currentUserId = await SecureStore.getItemAsync('userId');
            const currentUserResult = await axios.get(`http://localhost:8000/api/users/${currentUserId}`)

            let list = currentUserResult.data.friends

            list = list.filter((element) => element !== `http://localhost:8000/api/users/${friendId}/`)

            const resp = await axios.patch(`http://localhost:8000/api/users/${currentUserId}/`,{
                'friends':list
            })

            if(resp.status === 200) {
                navigation.navigate('Friends')
            }
            return resp
        } catch (error) {
            console.log(error.message);
        }
    }

    return (
      <View>
        <Button title='remove friend' onPress={()=>removeFriend()}/>
        <Text>Welcome on {friendName?friendName:'your friend'} board</Text>
        <TextInput placeholder='note.....' value={content} onChangeText={(content)=>setContent(content)}/>
        <Button title='create note' onPress={()=>createNote()}/>
        <Text>{message}</Text>
      </View>
    );
}