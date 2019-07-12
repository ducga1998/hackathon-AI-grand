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
        this.socket.on('bot_uttered', (message) => {
            const result = {
                ...message, ...{
                    _id: uuid(),
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any',
                    }
                }
            }
            console.log('botUttered', result)
            this.setState({ messages: [...[result], ...this.state.messages] })
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
        console.log('message', messages[0])
        const { text } = messages[0]
        this.socket.emit('user_uttered', {
            message: text, customData: {
                user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://placeimg.com/140/140/any',
                }
            }, session_id: '5f8f5266c55a448593ff31cbae14f341'
        });
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
