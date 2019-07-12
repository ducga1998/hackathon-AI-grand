import React from 'react'
import { GiftedChat } from 'react-native-gifted-chat'

import socket from './socket'
import uuid from 'uuid'

export default class Messages extends React.Component {
    state = {
        messages: [],
    }
    socket = null
    componentDidMount() {
        this.socket = socket('http://52.77.249.75:5005', {}, '/socket.io/')
        this.socket.on('bot_uttered', (botUttered) => {
            console.log('botUttered', botUttered)
            this.setState({ messages: [...[{ ...botUttered, ...{ _id: uuid() } }], ...this.state.messages] })
        });



    }
    componentWillMount() {
        this.setState({
            messages: [
                {
                    _id: 1,
                    text: 'Hello developer',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any',
                    },
                },
            ],
        })
    }

    onSend(messages = []) {
        this.socket.emit('user_uttered', { message: '/get_started', customData: {}, session_id: '5f8f5266c55a448593ff31cbae14f341' });
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    render() {

        return <GiftedChat
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
                _id: 1,
            }}
        />
    }
}
