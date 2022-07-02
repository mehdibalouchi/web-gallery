import React from 'react'
import { useEffect, useState } from "react";
import {
  VStack,
  useDisclosure,
  Button,
  Text,
  HStack,
  Select,
  Input,
  Box,
  ChakraProvider
} from "@chakra-ui/react";
import SelectWalletModal from "../components/Modal";
import { useWeb3React } from "@web3-react/core";
import { FulaDID } from '@functionland/fula-sec';
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { connectors } from "../utils/connectors";
import { truncateAddress } from "../utils";

const Identity = ({setDID, DID}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    library,
    chainId,
    account,
    activate,
    deactivate,
    active
  } = useWeb3React();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");


  const createDID = async () => {
    let didObj = null;
    
    try {
      const DID = new FulaDID();
      didObj = await DID.create(signature, signature)
      
      setDID(DID)
    } catch (error) {
      alert(error);
    }
  }

  const signMessage = async () => {
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: [Array.from(new TextEncoder().encode(account.toLowerCase())), account]
      });
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    setSignature("");
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, []);

  useEffect(() => {
    if(!signature || !account) return
    if(DID) return

    createDID()
  },[signature])

  return (
    <div className='container flex-column'>
      <h1>Connect your Wallet</h1>
      <VStack justifyContent="center" alignItems="center">
        <HStack>
          {!active ? (
            <Button onClick={onOpen}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
          <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text color="white">{`Connection Status: `}</Text>
            {active ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>
          <Tooltip label={account} placement="right">
            <Text color="white">{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text color="white">{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
          <Text color="white">{`Auth ID: ${DID ? DID.authDID : "No Did applied"}`}</Text>
        </VStack>
        {active && (
          <button onClick={signMessage}>Create DID</button>
        )}
        <Text color="white">{error ? error.message : null}</Text>
      </VStack>
      
    </div>
  );
}

export default Identity
