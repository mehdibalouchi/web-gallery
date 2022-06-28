import { createClient, Status } from '@functionland/fula'
import React, { useState } from 'react'

const Boxes = ({ fulaClient, setFulaClient, connectionStatus, setConnectionStatus, boxAddress, setBoxAddress }) => {
    const [isPrivate, setIsPrivate] = useState(false)
    const [netSecret, setNetSecret] = useState(null)

    const connectToBox = async () => {
        if (fulaClient)
        fulaClient.close()

        let _fula
        if(isPrivate){
            const key = new TextEncoder().encode(netSecret)
            _fula = await createClient({netSecret: key})
            setFulaClient(_fula)
        } else {
            _fula = await createClient()
            setFulaClient(_fula)
        }
        
        let _connection = _fula.connect(boxAddress)
        setConnectionStatus(Status.Connecting)
        
        _connection.on('status', setConnectionStatus)

        // @TODO display error message
        _connection.on('error', console.log)
    }

    const submit = (event) => {
        event.preventDefault()

        // @TODO display error message
        if (!boxAddress){
            console.log('No Box Address')
            return
        }

        connectToBox()
    }

    const connectionStatusCaption = () => {
        switch (connectionStatus) {
            case Status.Connecting:
                return 'Connecting...'
            case Status.Offline:
                return 'Offline'
            case Status.Online:
                return 'Connected'
            default:
                return '';
        }
    }

    return (
        <div className='container flex-column'>
            <h1>Connect to your Box</h1>
            <form>
                <input type='text' onChange={(evt) => setBoxAddress(evt.target.value)} placeholder='Box Address' />
                <button type='submit' onClick={submit}>Connect</button>
                <div className='m-10'>
                    <input type='checkbox' onChange={() => setIsPrivate(!isPrivate)} />
                    <span className='m-10'>Private Network</span>
                    {isPrivate &&
                        <span className='m-10'>
                            <input type='password' onChange={(evt) => setNetSecret(evt.target.value)} placeholder='Network Secret' />
                        </span>
                    }
                </div>
            </form>
            <div className='flex-column mtop-100'>
                <div className='m-20'><div>Status</div>{connectionStatusCaption()}</div>
                <div className='m-20'><div>Box Address</div>{boxAddress || 'Not set'}</div>
            </div>
        </div>
    )
}

export default Boxes