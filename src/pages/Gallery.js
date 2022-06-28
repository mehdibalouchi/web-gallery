import React, { useEffect, useState } from 'react'
import Photo from '../components/Photo'
import {TaggedEncryption} from '@functionland/fula-sec';
import { Uploader } from '../components/Uploader';

const Gallery = ({ fulaClient, DID }) => {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    if (fulaClient && DID) {
      (async () => {
        const allData = await fulaClient.graphql(readQuery);
        if (allData && allData.data && allData.data.read) {
          setPhotos([]);
          for (const {cid, jwe} of allData.data.read) {
            let file = null
            console.log({cid, jwe})
            if (jwe) {
              console.log("encrypted photo")
              const tagged = new TaggedEncryption(DID.did)

              let plainObject
              try {
                plainObject = await tagged.decrypt(jwe)
              } catch (e) {
                console.log(e)
                continue
              }
              const _iv = []
              for (let i=0; i<16; i+=1)
                _iv.push(plainObject.symetricKey.iv[i])

              const _symKey = []
              for (let i=0; i<32; i+=1)
                _symKey.push(plainObject.symetricKey.symKey[i])

              file = await fulaClient.receiveDecryptedFile(cid, Uint8Array.from(_symKey), Uint8Array.from(_iv))
            } else {
              console.log("not encrypted photo")
              file = await fulaClient.receiveFile(cid);
            }
            if(file)
              setPhotos((prev) => [...prev, file]);
          }
        } else {
          setPhotos([])
        }
      })();
    }
  }, [fulaClient, DID]);

  const onUpload = async (selectedFile) => {
    try {
      // const cid = await fula.sendFile(selectedFile);
      // await fula.graphql(createMutation, { values: [{ cid, _id: cid }] });
      const {cid, key} = await fulaClient.sendEncryptedFile(selectedFile)
      const tagged = new TaggedEncryption(DID.did)

      let plaintext = {
        symmetricKey: key,
        CID: cid
      }
      let jwe = await tagged.encrypt(plaintext.symmetricKey, plaintext.CID, [DID.did.id])
      await fulaClient.graphql(createMutation, {values: [{cid, _id: cid, jwe}]})
      setPhotos((prev) => [selectedFile, ...prev]);
    } catch (e) {
      console.log(e.message);
    }
  }

  return (
    <div className='container flex-column'>
      <h1>Gallery</h1>
      <div className='m-20'>
        {fulaClient === null ? <div>No Box Connected!</div> : null}
        {DID === undefined ? <div>Warning: No Wallet Connected. You may only view unencrypted photos. Your photos are uploaded unencrypted</div> : null}
      </div>
      {fulaClient !== null ? <div>
        <Uploader onUpload={onUpload} />
        {
          photos.length > 0 && photos.map((photo, index) => (
            <div key={index} >
              <Photo photo={photo} />
            </div>
          ))
        }
        {
          photos.length === 0 && <div className="container">
            <h1>no photo</h1>
          </div>
        }
      </div> : null}
    </div>
  )
}

export default Gallery

export const readQuery = `
  query {
    read(input:{
      collection:"gallery",
      filter:{}
    }){
      cid,
      symKey,
      iv,
      jwe
    }

  }
`

export const createMutation = `
  mutation addImage($values:JSON){
    create(input:{
      collection:"gallery",
      values: $values
    }){
      cid
    }
  }
`;